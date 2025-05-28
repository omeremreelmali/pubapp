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

    // Get app by slug
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

    // If user is ADMIN or EDITOR, return full app details
    if (currentRole === "ADMIN" || currentRole === "EDITOR") {
      return NextResponse.json({ app });
    }

    // For TESTER role, check if they have access through groups
    console.log(
      "Checking access for user:",
      user.id,
      "app:",
      app.id,
      "organization:",
      user.activeOrganization.id
    );

    const hasAccess = await prisma.groupMember.findFirst({
      where: {
        userId: user.id,
        group: {
          organizationId: user.activeOrganization.id,
          appAccess: {
            some: {
              appId: app.id,
            },
          },
        },
      },
      include: {
        group: {
          include: {
            appAccess: {
              where: {
                appId: app.id,
              },
            },
          },
        },
      },
    });

    console.log("Access check result:", hasAccess ? "GRANTED" : "DENIED");

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
