import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Only ADMIN and EDITOR can manage groups
    if (user.role === "TESTER") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Check if group exists and belongs to user's organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.organizationId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    // Get app access for this group
    const appAccess = await prisma.groupAppAccess.findMany({
      where: {
        groupId,
      },
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
      orderBy: {
        grantedAt: "desc",
      },
    });

    return NextResponse.json({ appAccess });
  } catch (error: any) {
    console.error("Get group app access error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Only ADMIN and EDITOR can manage groups
    if (user.role === "TESTER") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { appId } = body;

    if (!appId) {
      return NextResponse.json(
        { error: "Uygulama ID gerekli" },
        { status: 400 }
      );
    }

    // Check if group exists and belongs to user's organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.organizationId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    // Check if app exists and belongs to user's organization
    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        organizationId: user.organizationId,
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: "Uygulama bulunamadı" },
        { status: 404 }
      );
    }

    // Check if access already exists
    const existingAccess = await prisma.groupAppAccess.findFirst({
      where: {
        groupId,
        appId,
      },
    });

    if (existingAccess) {
      return NextResponse.json(
        { error: "Bu grubun zaten bu uygulamaya erişimi var" },
        { status: 400 }
      );
    }

    // Create app access
    const appAccess = await prisma.groupAppAccess.create({
      data: {
        groupId,
        appId,
      },
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
    });

    return NextResponse.json({ appAccess });
  } catch (error: any) {
    console.error("Add group app access error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
