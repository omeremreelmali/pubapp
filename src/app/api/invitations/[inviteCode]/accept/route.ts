import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { UserRole } from "@/generated/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const user = await requireAuth();
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

    // Email kontrolü (opsiyonel - davet herhangi bir kullanıcı tarafından kabul edilebilir)
    // if (invitation.email !== user.email) {
    //   return NextResponse.json(
    //     { error: "Bu davet size ait değil" },
    //     { status: 403 }
    //   );
    // }

    // Kullanıcı zaten bu organizasyonda mı kontrol et
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: invitation.organizationId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Zaten bu organizasyon üyesisiniz" },
        { status: 400 }
      );
    }

    // Transaction ile üyelik oluştur ve daveti işaretle
    const result = await prisma.$transaction(async (tx) => {
      // Organizasyon üyeliği oluştur
      const membership = await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role as UserRole,
        },
      });

      // Daveti kullanıldı olarak işaretle
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return membership;
    });

    return NextResponse.json({
      message: "Organizasyona başarıyla katıldınız",
      membershipId: result.id,
      role: result.role,
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
        slug: invitation.organization.slug,
      },
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
