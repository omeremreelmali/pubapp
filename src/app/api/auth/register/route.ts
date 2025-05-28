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

    let organizationId: string | null = null;
    let userRole: UserRole = UserRole.ADMIN; // İlk kullanıcı admin olur

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

      organizationId = invitation.organizationId;
      userRole = invitation.role;

      // Mark invitation as used
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });
    } else {
      // Davet kodu olmadan kayıt olan kullanıcılar kendi organizasyonlarını oluşturabilir
      // İlk kullanıcı ADMIN, diğerleri TESTER rolü alır
      const userCount = await prisma.user.count();
      userRole = userCount === 0 ? UserRole.ADMIN : UserRole.TESTER;
      // organizationId null kalır, kullanıcı setup sayfasında organizasyon oluşturacak
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: userRole,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json({
      message: "Kullanıcı başarıyla oluşturuldu",
      user,
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
