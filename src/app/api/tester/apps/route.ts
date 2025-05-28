import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const currentRole = getCurrentRole(user);

    // If user is ADMIN or EDITOR, return all apps
    if (currentRole === "ADMIN" || currentRole === "EDITOR") {
      const apps = await prisma.app.findMany({
        where: { organizationId: user.activeOrganization.id },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              uploadedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              versions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ apps });
    }

    // For TESTER role, only return apps they have access to through groups in the active organization
    console.log(
      "Fetching apps for tester user:",
      user.id,
      "in organization:",
      user.activeOrganization.id
    );

    const userGroups = await prisma.groupMember.findMany({
      where: {
        userId: user.id,
        group: {
          organizationId: user.activeOrganization.id,
        },
      },
      include: {
        group: {
          include: {
            appAccess: {
              include: {
                app: {
                  include: {
                    versions: {
                      orderBy: { createdAt: "desc" },
                      take: 1,
                      include: {
                        uploadedBy: {
                          select: {
                            id: true,
                            name: true,
                            email: true,
                          },
                        },
                      },
                    },
                    _count: {
                      select: {
                        versions: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("Found user groups:", userGroups.length);

    // Extract unique apps from all groups, filtering by organization
    const appsMap = new Map();
    userGroups.forEach((groupMember) => {
      console.log(
        "Processing group:",
        groupMember.group.name,
        "with",
        groupMember.group.appAccess.length,
        "app access"
      );
      groupMember.group.appAccess.forEach((appAccess) => {
        // Only include apps from the active organization
        if (
          appAccess.app &&
          user.activeOrganization &&
          appAccess.app.organizationId === user.activeOrganization.id &&
          !appsMap.has(appAccess.app.id)
        ) {
          console.log("Adding app:", appAccess.app.name);
          appsMap.set(appAccess.app.id, appAccess.app);
        }
      });
    });

    const apps = Array.from(appsMap.values());
    console.log("Final apps count:", apps.length);

    return NextResponse.json({ apps });
  } catch (error: any) {
    console.error("Get tester apps error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
