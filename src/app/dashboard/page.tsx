import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Smartphone,
  Download,
  Plus,
  Tag,
} from "lucide-react";
import Link from "next/link";

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

  const [totalUsers, totalApps, totalDownloads] = await Promise.all([
    prisma.user.count({
      where: { organizationId },
    }),
    prisma.app.count({
      where: { organizationId },
    }),
    prisma.appVersion.aggregate({
      where: { app: { organizationId } },
      _sum: { downloadCount: true },
    }),
  ]);

  return {
    totalUsers,
    totalApps,
    totalDownloads: totalDownloads._sum.downloadCount || 0,
    recentActivity: [],
  };
}

export default async function DashboardPage() {
  const user = await requireAuth();

  if (!user.organizationId) {
    redirect("/dashboard/setup");
  }

  // Redirect TESTER role to their specific dashboard
  if (user.role === "TESTER") {
    redirect("/dashboard/tester");
  }

  const stats = await getDashboardStats(user.id, user.organizationId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Hoş geldiniz, {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant={
                  user.role === "ADMIN"
                    ? "default"
                    : user.role === "EDITOR"
                    ? "secondary"
                    : "outline"
                }
              >
                {user.role}
              </Badge>
              <Link href="/auth/signout">
                <Button variant="outline">Çıkış Yap</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Info */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                {user.organization?.name}
              </CardTitle>
              <CardDescription>
                Organizasyon Kodu: {user.organization?.slug}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Kullanıcı
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Uygulama
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApps}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam İndirme
              </CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(user.role === "ADMIN" || user.role === "EDITOR") && (
            <>
              <Link href="/dashboard/apps/new">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Yeni Uygulama</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/users">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Kullanıcı Yönetimi</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/groups">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                      <p className="text-sm font-medium">Test Grupları</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/tags">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center">
                      <Tag className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                      <p className="text-sm font-medium">Tag Yönetimi</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          <Link href="/dashboard/apps">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Uygulamalar</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/downloads">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Download className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">İndirmeler</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>
              Organizasyonunuzdaki son aktiviteler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Henüz aktivite bulunmuyor
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
