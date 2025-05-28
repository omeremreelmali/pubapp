import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  hasOrganizationAccess,
  getCurrentRole,
} from "@/lib/auth-utils";
import { UserRole } from "@/generated/prisma";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  role: z.enum(["ADMIN", "EDITOR", "TESTER"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { organizationId } = await params;

    // Kullanıcının bu organizasyona erişimi var mı kontrol et
    if (!hasOrganizationAccess(user, organizationId)) {
      return NextResponse.json(
        { error: "Bu organizasyona erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    // Sadece ADMIN ve EDITOR davet gönderebilir
    const userRole = getCurrentRole(user);
    if (!userRole || !["ADMIN", "EDITOR"].includes(userRole)) {
      return NextResponse.json(
        { error: "Davet gönderme yetkiniz yok" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role } = inviteSchema.parse(body);

    // Kullanıcı zaten bu organizasyonda mı kontrol et
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Bu kullanıcı zaten organizasyon üyesi" },
        { status: 400 }
      );
    }

    // Bekleyen davet var mı kontrol et
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId,
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Bu email adresine zaten davet gönderilmiş" },
        { status: 400 }
      );
    }

    // Davet oluştur (7 gün geçerli)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        role: role as UserRole,
        organizationId,
        expiresAt,
      },
      include: {
        organization: true,
      },
    });

    // Davet linkini oluştur
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invitation.inviteCode}`;

    return NextResponse.json({
      message: "Davet başarıyla gönderildi",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        inviteCode: invitation.inviteCode,
        inviteUrl,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("Invitation creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { organizationId } = await params;

    // Kullanıcının bu organizasyona erişimi var mı kontrol et
    if (!hasOrganizationAccess(user, organizationId)) {
      return NextResponse.json(
        { error: "Bu organizasyona erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { organizationId } = await params;

    // Get invitationId from query parameters
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json(
        { error: "Davet ID'si gerekli" },
        { status: 400 }
      );
    }

    // Kullanıcının bu organizasyona erişimi var mı kontrol et
    if (!hasOrganizationAccess(user, organizationId)) {
      return NextResponse.json(
        { error: "Bu organizasyona erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    const currentRole = getCurrentRole(user);

    // Only ADMIN and EDITOR can cancel invitations
    if (currentRole !== "ADMIN" && currentRole !== "EDITOR") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Check if the invitation exists and belongs to the current organization
    const invitation = await prisma.organizationInvitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
        usedAt: null, // Only allow canceling unused invitations
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Davet bulunamadı veya zaten kullanılmış" },
        { status: 404 }
      );
    }

    // Delete the invitation
    await prisma.organizationInvitation.delete({
      where: {
        id: invitationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel invitation error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
