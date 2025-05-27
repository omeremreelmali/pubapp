import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { inviteUserSchema } from "@/lib/validations/auth";
import { UserRole } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await requireEditorOrAdmin();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = await inviteUserSchema.validate(body);

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

    // Check if invitation already exists
    const existingInvitation = await prisma.organizationInvitation.findUnique({
      where: {
        email_organizationId: {
          email: validatedData.email,
          organizationId: user.organizationId,
        },
      },
    });

    if (
      existingInvitation &&
      !existingInvitation.usedAt &&
      existingInvitation.expiresAt > new Date()
    ) {
      return NextResponse.json(
        { error: "Bu kullanıcıya zaten aktif bir davet gönderilmiş" },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = await prisma.organizationInvitation.create({
      data: {
        email: validatedData.email,
        role: validatedData.role as UserRole,
        organizationId: user.organizationId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        organization: true,
      },
    });

    // TODO: Send email with invitation link
    // const inviteLink = `${process.env.APP_URL}/auth/signup?invite=${invitation.inviteCode}`

    return NextResponse.json({
      message: "Davet başarıyla gönderildi",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        inviteCode: invitation.inviteCode,
        expiresAt: invitation.expiresAt,
        organization: invitation.organization,
      },
    });
  } catch (error: any) {
    console.error("Invite user error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireEditorOrAdmin();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId: user.organizationId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error: any) {
    console.error("Get invitations error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
