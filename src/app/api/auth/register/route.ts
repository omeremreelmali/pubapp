import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validations/auth";
import { UserRole } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validatedData = await signUpSchema.validate(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi ile zaten bir kullanıcı kayıtlı" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    let invitationData: any = null;

    // Check invite code if provided
    if (validatedData.inviteCode) {
      const invitation = await prisma.organizationInvitation.findUnique({
        where: {
          inviteCode: validatedData.inviteCode,
          expiresAt: { gt: new Date() },
          usedAt: null,
        },
        include: { organization: true },
      });

      if (!invitation) {
        return NextResponse.json(
          { error: "Geçersiz veya süresi dolmuş davet kodu" },
          { status: 400 }
        );
      }

      if (invitation.email !== validatedData.email) {
        return NextResponse.json(
          { error: "Bu davet kodu farklı bir email adresi için" },
          { status: 400 }
        );
      }

      invitationData = invitation;
    }

    // Transaction ile kullanıcı ve organizasyon üyeliği oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Kullanıcı oluştur
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
        },
      });

      let membership = null;

      if (invitationData) {
        // Davet ile kayıt olan kullanıcı için organizasyon üyeliği oluştur
        membership = await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: invitationData.organizationId,
            role: invitationData.role,
          },
        });

        // Daveti kullanıldı olarak işaretle
        await tx.organizationInvitation.update({
          where: { id: invitationData.id },
          data: { usedAt: new Date() },
        });
      }

      return { user, membership };
    });

    return NextResponse.json({
      message: "Kullanıcı başarıyla oluşturuldu",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        hasOrganization: !!result.membership,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
