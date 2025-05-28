import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentRole } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    // Get app by slug with versions and tags
    const app = await prisma.app.findFirst({
      where: {
        slug,
        organizationId: user.activeOrganization.id,
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
            tags: {
              include: {
                tag: true,
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

    const currentRole = getCurrentRole(user);

    // For TESTER role, check if they have access through groups
    if (currentRole === "TESTER") {
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
    }

    return NextResponse.json({ app });
  } catch (error: any) {
    console.error("Get app error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
