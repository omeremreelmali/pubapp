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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Smartphone,
  Plus,
  Search,
  Download,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";

async function getOrganizationApps(organizationId: string) {
  const apps = await prisma.app.findMany({
    where: { organizationId },
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

  return apps;
}

export default async function AppsPage() {
  const user = await requireAuth();

  if (!user.organizationId) {
    return <div>Organizasyon bulunamadı</div>;
  }

  const apps = await getOrganizationApps(user.organizationId);

  const getPlatformBadge = (platform: string) => {
    return platform === "ANDROID" ? (
      <Badge variant="default" className="bg-green-600">
        Android
      </Badge>
    ) : (
      <Badge variant="default" className="bg-blue-600">
        iOS
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getTotalDownloads = (app: any) => {
    return app.versions.reduce(
      (total: number, version: any) => total + version.downloadCount,
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Smartphone className="mr-3 h-8 w-8" />
                Uygulamalar
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Organizasyonunuzdaki tüm uygulamaları yönetin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">← Dashboard</Button>
              </Link>
              {(user.role === "ADMIN" || user.role === "EDITOR") && (
                <Link href="/dashboard/apps/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Uygulama
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Uygulama ara..." className="pl-10" />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Platformlar</SelectItem>
                  <SelectItem value="ANDROID">Android</SelectItem>
                  <SelectItem value="IOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Uygulama
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apps.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Android</CardTitle>
              <Smartphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter((app) => app.platform === "ANDROID").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">iOS</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.filter((app) => app.platform === "IOS").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Versiyon
              </CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apps.reduce((total, app) => total + app._count.versions, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Apps Grid */}
        {apps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Smartphone className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz uygulama yok
              </h3>
              <p className="text-gray-500 text-center mb-4">
                İlk uygulamanızı oluşturarak başlayın
              </p>
              {(user.role === "ADMIN" || user.role === "EDITOR") && (
                <Link href="/dashboard/apps/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Uygulama Oluştur
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <Card key={app.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {app.packageName}
                      </CardDescription>
                    </div>
                    {getPlatformBadge(app.platform)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {app.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {app._count.versions} versiyon
                      </div>
                      {app.versions[0] && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />v
                          {app.versions[0].version}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {app.createdBy.name}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(app.createdAt)}
                      </span>
                      <Link href={`/dashboard/apps/${app.slug}`}>
                        <Button variant="outline" size="sm">
                          Detaylar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
