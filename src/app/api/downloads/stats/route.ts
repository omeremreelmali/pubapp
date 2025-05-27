import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Only ADMIN and EDITOR can view download stats
    if (user.role === "TESTER") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total downloads from app versions
    const totalDownloadsResult = await prisma.appVersion.aggregate({
      where: {
        app: {
          organizationId: user.organizationId,
        },
      },
      _sum: {
        downloadCount: true,
      },
    });

    const totalDownloads = totalDownloadsResult._sum.downloadCount || 0;

    // Get download links for time-based stats
    const [todayLinks, weekLinks, monthLinks] = await Promise.all([
      prisma.downloadLink.count({
        where: {
          version: {
            app: {
              organizationId: user.organizationId,
            },
          },
          downloadedAt: {
            not: null,
            gte: todayStart,
          },
        },
      }),
      prisma.downloadLink.count({
        where: {
          version: {
            app: {
              organizationId: user.organizationId,
            },
          },
          downloadedAt: {
            not: null,
            gte: weekStart,
          },
        },
      }),
      prisma.downloadLink.count({
        where: {
          version: {
            app: {
              organizationId: user.organizationId,
            },
          },
          downloadedAt: {
            not: null,
            gte: monthStart,
          },
        },
      }),
    ]);

    // Get top apps by download count
    const topAppsData = await prisma.app.findMany({
      where: {
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        name: true,
        platform: true,
        versions: {
          select: {
            downloadCount: true,
          },
        },
      },
    });

    const topApps = topAppsData
      .map((app) => ({
        app: {
          id: app.id,
          name: app.name,
          platform: app.platform,
        },
        totalDownloads: app.versions.reduce(
          (sum, version) => sum + version.downloadCount,
          0
        ),
      }))
      .filter((item) => item.totalDownloads > 0)
      .sort((a, b) => b.totalDownloads - a.totalDownloads)
      .slice(0, 10);

    // Get recent download links
    const recentDownloads = await prisma.downloadLink.findMany({
      where: {
        version: {
          app: {
            organizationId: user.organizationId,
          },
        },
      },
      include: {
        version: {
          select: {
            id: true,
            version: true,
            buildNumber: true,
            app: {
              select: {
                id: true,
                name: true,
                platform: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const stats = {
      totalDownloads,
      todayDownloads: todayLinks,
      weekDownloads: weekLinks,
      monthDownloads: monthLinks,
      topApps,
      recentDownloads,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Get download stats error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
