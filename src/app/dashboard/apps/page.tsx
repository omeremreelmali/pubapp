"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface AppData {
  id: string;
  name: string;
  slug: string;
  packageName: string;
  platform: string;
  description?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  versions: {
    id: string;
    version: string;
    buildNumber: number;
    createdAt: string;
    downloadCount: number;
  }[];
  _count: {
    versions: number;
  };
}

export default function AppsPage() {
  const { data: session } = useSession();
  const [apps, setApps] = useState<AppData[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, searchTerm, platformFilter]);

  const fetchApps = async () => {
    try {
      const response = await fetch("/api/apps");
      const data = await response.json();

      if (response.ok) {
        setApps(data || []);
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApps = () => {
    let filtered = apps;

    // Platform filtresi
    if (platformFilter !== "all") {
      filtered = filtered.filter((app) => app.platform === platformFilter);
    }

    // Arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchLower) ||
          app.packageName.toLowerCase().includes(searchLower) ||
          (app.description &&
            app.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredApps(filtered);
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Uygulamalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <div>Giriş yapmanız gerekiyor</div>;
  }

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
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ana Sayfa
                </Button>
              </Link>
              {(session?.user?.activeOrganization?.role === "ADMIN" ||
                session?.user?.activeOrganization?.role === "EDITOR") && (
                <Link href="/dashboard/apps/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Uygulama
                  </Button>
                </Link>
              )}
              <Link href="/auth/signout">
                <Button variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </Link>
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
                  <Input
                    placeholder="Uygulama ara..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
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
                {searchTerm || platformFilter !== "all"
                  ? "Filtrelenmiş"
                  : "Toplam"}{" "}
                Uygulama
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredApps.length}</div>
              {(searchTerm || platformFilter !== "all") && (
                <p className="text-xs text-muted-foreground">
                  Toplam: {apps.length}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Android</CardTitle>
              <Smartphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  filteredApps.filter((app) => app.platform === "ANDROID")
                    .length
                }
              </div>
              {(searchTerm || platformFilter !== "all") && (
                <p className="text-xs text-muted-foreground">
                  Toplam:{" "}
                  {apps.filter((app) => app.platform === "ANDROID").length}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">iOS</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredApps.filter((app) => app.platform === "IOS").length}
              </div>
              {(searchTerm || platformFilter !== "all") && (
                <p className="text-xs text-muted-foreground">
                  Toplam: {apps.filter((app) => app.platform === "IOS").length}
                </p>
              )}
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
                {filteredApps.reduce(
                  (total, app) => total + app._count.versions,
                  0
                )}
              </div>
              {(searchTerm || platformFilter !== "all") && (
                <p className="text-xs text-muted-foreground">
                  Toplam:{" "}
                  {apps.reduce((total, app) => total + app._count.versions, 0)}
                </p>
              )}
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
              {(session?.user?.activeOrganization?.role === "ADMIN" ||
                session?.user?.activeOrganization?.role === "EDITOR") && (
                <Link href="/dashboard/apps/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Uygulama Oluştur
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : filteredApps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Arama sonucu bulunamadı
              </h3>
              <p className="text-gray-500 text-center mb-4">
                "{searchTerm}" araması veya seçilen filtreler için sonuç
                bulunamadı
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setPlatformFilter("all");
                }}
              >
                Filtreleri Temizle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
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
