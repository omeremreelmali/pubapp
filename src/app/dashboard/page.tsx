import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardOrganizationInfo } from "@/components/dashboard/dashboard-organization-info";
import { LanguageSwitcher } from "@/components/language-switcher";

async function getDashboardStats(
  userId: string,
  organizationId: string | null
) {
  if (!organizationId) {
    return {
      totalUsers: 0,
      totalApps: 0,
      totalDownloads: 0,
      recentActivity: [],
    };
  }

  const [totalUsers, totalApps, totalDownloads, recentActivity] =
    await Promise.all([
      prisma.organizationMember.count({
        where: { organizationId },
      }),
      prisma.app.count({
        where: { organizationId },
      }),
      prisma.appVersion.aggregate({
        where: { app: { organizationId } },
        _sum: { downloadCount: true },
      }),
      prisma.appVersion.findMany({
        where: { app: { organizationId } },
        include: {
          app: {
            select: {
              name: true,
              slug: true,
            },
          },
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  return {
    totalUsers,
    totalApps,
    totalDownloads: totalDownloads._sum.downloadCount || 0,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const user = await requireAuth();

  if (!user.activeOrganization) {
    redirect("/dashboard/organizations");
  }

  // Redirect TESTER role to their specific dashboard
  if (user.activeOrganization.role === "TESTER") {
    redirect("/dashboard/tester");
  }

  const stats = await getDashboardStats(user.id, user.activeOrganization.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        userName={user.name || "Kullanıcı"}
        userRole={user.activeOrganization.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language Switcher */}
        <div className="mb-8 flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Organization Info */}
        <DashboardOrganizationInfo
          organizationName={user.activeOrganization.name}
          organizationSlug={user.activeOrganization.slug}
        />

        {/* Stats Cards */}
        <DashboardStats
          totalUsers={stats.totalUsers}
          totalApps={stats.totalApps}
          totalDownloads={stats.totalDownloads}
        />

        {/* Quick Actions */}
        <DashboardQuickActions userRole={user.activeOrganization.role} />

        {/* Recent Activity */}
        <DashboardRecentActivity recentActivity={stats.recentActivity} />
      </div>
    </div>
  );
}
