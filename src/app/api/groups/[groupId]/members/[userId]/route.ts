import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
) {
  try {
    const { groupId, userId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    // Check if group exists and belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.activeOrganization.id,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    // Check if member exists
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Kullanıcı bu grubun üyesi değil" },
        { status: 404 }
      );
    }

    // Check if user belongs to same organization
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        userId: userId,
        organizationId: user.activeOrganization.id,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Remove user from group
    await prisma.groupMember.delete({
      where: {
        id: member.id,
      },
    });

    return NextResponse.json({
      message: "Kullanıcı gruptan başarıyla çıkarıldı",
    });
  } catch (error: any) {
    console.error("Remove group member error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
