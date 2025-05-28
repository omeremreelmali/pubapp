"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Download,
  Search,
  Calendar,
  Package,
  Eye,
  Filter,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DownloadButton } from "@/components/dashboard/download-button";

interface App {
  id: string;
  name: string;
  slug: string;
  platform: string;
  packageName: string;
  description?: string;
  createdAt: string;
  versions: Array<{
    id: string;
    version: string;
    buildNumber: number;
    createdAt: string;
    downloadCount: number;
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

export default function TesterDashboardPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [filteredApps, setFilteredApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, searchTerm, platformFilter]);

  const fetchApps = async () => {
    try {
      const response = await fetch("/api/tester/apps");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Uygulamalar yüklenirken hata oluştu");
        return;
      }

      setApps(data.apps);
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const filterApps = () => {
    let filtered = apps;

    // Platform filter
    if (platformFilter !== "ALL") {
      filtered = filtered.filter((app) => app.platform === platformFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.description &&
            app.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredApps(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterApps();
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
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
    return apps.reduce(
      (total, app) =>
        total +
        app.versions.reduce(
          (appTotal, version) => appTotal + version.downloadCount,
          0
        ),
      0
    );
  };

  const stats = {
    totalApps: apps.length,
    androidApps: apps.filter((app) => app.platform === "ANDROID").length,
    iosApps: apps.filter((app) => app.platform === "IOS").length,
    totalDownloads: getTotalDownloads(),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Uygulamalar yükleniyor...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Smartphone className="mr-3 h-8 w-8" />
                Test Uygulamaları
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Size atanan test uygulamalarını görüntüleyin ve indirin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Ana Sayfa
                </Button>
              </Link>
              <Badge variant="secondary" className="text-sm">
                Test Kullanıcısı
              </Badge>
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
              <div className="text-2xl font-bold">{stats.totalApps}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Android</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.androidApps}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">iOS</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.iosApps}</div>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrele ve Ara</CardTitle>
            <CardDescription>
              Uygulamaları platform ve isme göre filtreleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <Input
                    placeholder="Uygulama adı veya paket adı..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={platformFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setPlatformFilter("ALL")}
                  size="sm"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Tümü
                </Button>
                <Button
                  variant={platformFilter === "ANDROID" ? "default" : "outline"}
                  onClick={() => setPlatformFilter("ANDROID")}
                  size="sm"
                >
                  Android
                </Button>
                <Button
                  variant={platformFilter === "IOS" ? "default" : "outline"}
                  onClick={() => setPlatformFilter("IOS")}
                  size="sm"
                >
                  iOS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apps */}
        <Card>
          <CardHeader>
            <CardTitle>Erişilebilir Uygulamalar</CardTitle>
            <CardDescription>
              Size atanan test uygulamaları ({filteredApps.length} uygulama)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApps.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {apps.length === 0
                    ? "Henüz uygulama yok"
                    : "Uygulama bulunamadı"}
                </h3>
                <p className="text-gray-500">
                  {apps.length === 0
                    ? "Size henüz test uygulaması atanmamış"
                    : "Arama kriterlerinize uygun uygulama bulunamadı"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Uygulama</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Son Versiyon</TableHead>
                    <TableHead>Versiyon Sayısı</TableHead>
                    <TableHead>Son Güncelleme</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.name}</div>
                          <div className="text-sm text-gray-500 font-mono">
                            {app.packageName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlatformBadge(app.platform)}</TableCell>
                      <TableCell>
                        {app.versions[0] ? (
                          <div>
                            <div className="font-medium">
                              v{app.versions[0].version}
                            </div>
                            <div className="text-sm text-gray-500">
                              Build {app.versions[0].buildNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Versiyon yok</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {app._count.versions} versiyon
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.versions[0] ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 h-4 w-4" />
                            {formatDate(app.versions[0].createdAt)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/tester/apps/${app.slug}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {app.versions[0] && (
                            <DownloadButton
                              versionId={app.versions[0].id}
                              slug={app.slug}
                            />
                          )}
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
