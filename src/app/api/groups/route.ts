import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin, getCurrentRole } from "@/lib/auth-utils";
import { createGroupSchema } from "@/lib/validations/group";

export async function POST(request: NextRequest) {
  try {
    const user = await requireEditorOrAdmin();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = await createGroupSchema.validate(body);

    // Check if group name already exists in organization
    const existingGroup = await prisma.group.findFirst({
      where: {
        name: validatedData.name,
        organizationId: user.activeOrganization.id,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "Bu isimde bir grup zaten mevcut" },
        { status: 400 }
      );
    }

    // Create group
    const group = await prisma.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
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
      message: "Grup başarıyla oluşturuldu",
      group,
    });
  } catch (error: any) {
    console.error("Create group error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireEditorOrAdmin();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const whereClause: any = {
      organizationId: user.activeOrganization.id,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const groups = await prisma.group.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ groups });
  } catch (error: any) {
    console.error("Get groups error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
