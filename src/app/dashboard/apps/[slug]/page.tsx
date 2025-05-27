import { notFound } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Smartphone,
  ArrowLeft,
  Plus,
  Download,
  Calendar,
  User,
  Package,
} from "lucide-react";
import Link from "next/link";
import { DownloadButton } from "@/components/dashboard/download-button";

async function getAppBySlug(slug: string, organizationId: string) {
  const app = await prisma.app.findFirst({
    where: {
      slug,
      organizationId,
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

  return app;
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function AppDetailPage({ params }: PageProps) {
  const user = await requireAuth();

  if (!user.organizationId) {
    return <div>Organizasyon bulunamadı</div>;
  }

  const app = await getAppBySlug(params.slug, user.organizationId);

  if (!app) {
    notFound();
  }

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTotalDownloads = () => {
    return app.versions.reduce(
      (total, version) => total + version.downloadCount,
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
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Smartphone className="mr-3 h-8 w-8" />
                  {app.name}
                </h1>
                {getPlatformBadge(app.platform)}
              </div>
              <p className="text-sm text-gray-500">{app.packageName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/apps">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Uygulamalar
                </Button>
              </Link>
              {(user.role === "ADMIN" || user.role === "EDITOR") && (
                <Link href={`/dashboard/apps/${app.slug}/versions/new`}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Versiyon
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* App Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Uygulama Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Açıklama</h4>
                    <p className="text-gray-600">{app.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Paket Adı
                    </h4>
                    <p className="text-gray-600 font-mono text-sm">
                      {app.packageName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Platform</h4>
                    <div>{getPlatformBadge(app.platform)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Oluşturan
                    </h4>
                    <p className="text-gray-600">{app.createdBy.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Oluşturulma Tarihi
                    </h4>
                    <p className="text-gray-600">{formatDate(app.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Versiyon
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{app._count.versions}</div>
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
                <div className="text-2xl font-bold">{getTotalDownloads()}</div>
              </CardContent>
            </Card>

            {app.versions[0] && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Son Versiyon
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    v{app.versions[0].version}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(app.versions[0].createdAt)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Versions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Versiyonlar</CardTitle>
                <CardDescription>Uygulamanın tüm versiyonları</CardDescription>
              </div>
              {(user.role === "ADMIN" || user.role === "EDITOR") && (
                <Link href={`/dashboard/apps/${app.slug}/versions/new`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Versiyon
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {app.versions.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz versiyon yok
                </h3>
                <p className="text-gray-500 mb-4">
                  Bu uygulama için henüz versiyon yüklenmemiş
                </p>
                {(user.role === "ADMIN" || user.role === "EDITOR") && (
                  <Link href={`/dashboard/apps/${app.slug}/versions/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      İlk Versiyonu Yükle
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Versiyon</TableHead>
                    <TableHead>Build</TableHead>
                    <TableHead>Dosya Boyutu</TableHead>
                    <TableHead>İndirme</TableHead>
                    <TableHead>Yükleyen</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {app.versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium">
                        v{version.version}
                      </TableCell>
                      <TableCell>{version.buildNumber}</TableCell>
                      <TableCell>{formatFileSize(version.fileSize)}</TableCell>
                      <TableCell>{version.downloadCount}</TableCell>
                      <TableCell>{version.uploadedBy.name}</TableCell>
                      <TableCell>{formatDate(version.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <DownloadButton
                            versionId={version.id}
                            slug={app.slug}
                          />
                          <Button variant="outline" size="sm">
                            Detay
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
