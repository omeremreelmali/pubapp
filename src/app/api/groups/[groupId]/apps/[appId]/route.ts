import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; appId: string }> }
) {
  try {
    const { groupId, appId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Check if group exists and belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.organizationId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    // Check if app access exists
    const appAccess = await prisma.groupAppAccess.findFirst({
      where: {
        groupId,
        appId,
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    if (!appAccess) {
      return NextResponse.json(
        { error: "Uygulama erişimi bulunamadı" },
        { status: 404 }
      );
    }

    // Check if app belongs to same organization
    if (appAccess.app.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Remove app access from group
    await prisma.groupAppAccess.delete({
      where: {
        id: appAccess.id,
      },
    });

    return NextResponse.json({
      message: "Uygulama erişimi başarıyla kaldırıldı",
    });
  } catch (error: any) {
    console.error("Remove app access error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
