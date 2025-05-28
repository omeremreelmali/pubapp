"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Download,
  Calendar,
  User,
  Package,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DownloadButton } from "@/components/dashboard/download-button";
import { OrganizationSwitcher } from "@/components/dashboard/organization-switcher";

interface App {
  id: string;
  name: string;
  slug: string;
  platform: string;
  packageName: string;
  description?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  versions: Array<{
    id: string;
    version: string;
    buildNumber: number;
    releaseNotes?: string;
    createdAt: string;
    downloadCount: number;
    fileSize: number;
    uploadedBy: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  _count: {
    versions: number;
  };
}

export default function TesterAppDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const slug = params.slug as string;

  const [app, setApp] = useState<App | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchApp();
    }
  }, [slug]);

  useEffect(() => {
    if (session?.user?.activeOrganization && slug) {
      fetchApp();
    }
  }, [session?.user?.activeOrganization?.id, slug]);

  const fetchApp = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tester/apps/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Uygulama yüklenirken hata oluştu");
        setApp(null);
        return;
      }

      setApp(data.app);
    } catch (error) {
      toast.error("Bir hata oluştu");
      setApp(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

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

  const getTotalDownloads = () => {
    if (!app) return 0;
    return app.versions.reduce(
      (total, version) => total + version.downloadCount,
      0
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Uygulama yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Uygulama bulunamadı
          </h3>
          <p className="text-gray-500 mb-4">
            Bu uygulamaya erişim yetkiniz yok veya uygulama mevcut değil
          </p>
          <Link href="/dashboard/tester">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
              <div className="w-64">
                <OrganizationSwitcher />
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Ana Sayfa
                </Button>
              </Link>
              <Link href="/dashboard/tester">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Uygulamalar
                </Button>
              </Link>
              <Link href="/auth/signout">
                <Button variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </Link>
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
            <CardTitle>Mevcut Versiyonlar</CardTitle>
            <CardDescription>Bu uygulamanın tüm versiyonları</CardDescription>
          </CardHeader>
          <CardContent>
            {app.versions.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz versiyon yok
                </h3>
                <p className="text-gray-500">
                  Bu uygulama için henüz versiyon yüklenmemiş
                </p>
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
                        <DownloadButton
                          versionId={version.id}
                          slug={app.slug}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Release Notes */}
        {app.versions.length > 0 && app.versions[0].releaseNotes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Son Versiyon Notları</CardTitle>
              <CardDescription>
                v{app.versions[0].version} için sürüm notları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">
                  {app.versions[0].releaseNotes}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
