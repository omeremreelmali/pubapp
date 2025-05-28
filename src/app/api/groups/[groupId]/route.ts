import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { updateGroupSchema } from "@/lib/validations/group";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.activeOrganization.id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: "desc" },
        },
        appAccess: {
          include: {
            app: {
              select: {
                id: true,
                name: true,
                slug: true,
                platform: true,
                packageName: true,
              },
            },
          },
          orderBy: { grantedAt: "desc" },
        },
        _count: {
          select: {
            members: true,
            appAccess: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error: any) {
    console.error("Get group error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = await updateGroupSchema.validate(body);

    // Check if group exists and belongs to organization
    const existingGroup = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.activeOrganization.id,
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    // Check if new name already exists (if name is being updated)
    if (validatedData.name && validatedData.name !== existingGroup.name) {
      const nameExists = await prisma.group.findFirst({
        where: {
          name: validatedData.name,
          organizationId: user.activeOrganization.id,
          id: { not: groupId },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Bu isimde bir grup zaten mevcut" },
          { status: 400 }
        );
      }
    }

    // Update group
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: validatedData,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        appAccess: {
          include: {
            app: {
              select: {
                id: true,
                name: true,
                platform: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            appAccess: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Grup başarıyla güncellendi",
      group: updatedGroup,
    });
  } catch (error: any) {
    console.error("Update group error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
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

    // Delete group (cascade will handle members and app access)
    await prisma.group.delete({
      where: { id: groupId },
    });

    return NextResponse.json({
      message: "Grup başarıyla silindi",
    });
  } catch (error: any) {
    console.error("Delete group error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
