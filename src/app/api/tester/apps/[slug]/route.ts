import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Get app by slug
    const app = await prisma.app.findFirst({
      where: {
        slug,
        organizationId: user.organizationId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: "Uygulama bulunamadı" },
        { status: 404 }
      );
    }

    // If user is ADMIN or EDITOR, return full app details
    if (user.role === "ADMIN" || user.role === "EDITOR") {
      return NextResponse.json({ app });
    }

    // For TESTER role, check if they have access through groups
    const hasAccess = await prisma.groupMember.findFirst({
      where: {
        userId: user.id,
        group: {
          appAccess: {
            some: {
              appId: app.id,
            },
          },
        },
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Bu uygulamaya erişim yetkiniz yok" },
        { status: 403 }
      );
    }

    return NextResponse.json({ app });
  } catch (error: any) {
    console.error("Get tester app error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
