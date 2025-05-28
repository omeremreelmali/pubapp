import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const { inviteCode } = await params;

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { inviteCode },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Davet bulunamadı" }, { status: 404 });
    }

    // Davet süresi dolmuş mu kontrol et
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Davet süresi dolmuş" },
        { status: 400 }
      );
    }

    // Davet zaten kullanılmış mı kontrol et
    if (invitation.usedAt) {
      return NextResponse.json(
        { error: "Bu davet zaten kullanılmış" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
          slug: invitation.organization.slug,
          description: invitation.organization.description,
        },
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Get invitation error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
