import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { createAppSchema } from "@/lib/validations/app";
import { Platform } from "@/generated/prisma";

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
    const validatedData = await createAppSchema.validate(body);

    // Create slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists in organization
    const existingApp = await prisma.app.findFirst({
      where: {
        slug,
        organizationId: user.organizationId,
      },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: "Bu isimde bir uygulama zaten mevcut" },
        { status: 400 }
      );
    }

    // Check if package name already exists
    const existingPackage = await prisma.app.findUnique({
      where: { packageName: validatedData.packageName },
    });

    if (existingPackage) {
      return NextResponse.json(
        { error: "Bu paket adı zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Create app
    const app = await prisma.app.create({
      data: {
        name: validatedData.name,
        slug,
        packageName: validatedData.packageName,
        platform: validatedData.platform as Platform,
        description: validatedData.description,
        organizationId: user.organizationId,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Uygulama başarıyla oluşturuldu",
      app,
    });
  } catch (error: any) {
    console.error("Create app error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireEditorOrAdmin();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");

    const whereClause: any = {
      organizationId: user.organizationId,
    };

    if (platform && ["ANDROID", "IOS"].includes(platform)) {
      whereClause.platform = platform;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { packageName: { contains: search, mode: "insensitive" } },
      ];
    }

    const apps = await prisma.app.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          select: {
            id: true,
            version: true,
            buildNumber: true,
            createdAt: true,
            downloadCount: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apps);
  } catch (error: any) {
    console.error("Get apps error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
