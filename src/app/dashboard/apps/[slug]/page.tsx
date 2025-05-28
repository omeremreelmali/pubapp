"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Smartphone,
  ArrowLeft,
  Plus,
  Download,
  Calendar,
  User,
  Package,
  Tag,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { DownloadButton } from "@/components/dashboard/download-button";
import { toast } from "sonner";

interface TagData {
  id: string;
  name: string;
  color: string;
}

interface VersionData {
  id: string;
  version: string;
  buildNumber: number;
  releaseNotes?: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    tag: TagData;
  }>;
}

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
  versions: VersionData[];
  _count: {
    versions: number;
  };
}

export default function AppDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [app, setApp] = useState<AppData | null>(null);
  const [tags, setTags] = useState<TagData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<VersionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppData();
    fetchTags();
  }, [slug]);

  useEffect(() => {
    if (app) {
      filterVersions();
    }
  }, [app, selectedTags]);

  const fetchAppData = async () => {
    try {
      const response = await fetch(`/api/apps/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Uygulama yüklenirken hata oluştu");
        return;
      }

      setApp(data.app);
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();

      if (response.ok) {
        setTags(data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const filterVersions = () => {
    if (!app) return;

    if (selectedTags.length === 0) {
      setFilteredVersions(app.versions);
      return;
    }

    const filtered = app.versions.filter((version) =>
      version.tags.some((versionTag) =>
        selectedTags.includes(versionTag.tag.id)
      )
    );

    setFilteredVersions(filtered);
  };

  const handleTagFilter = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const clearFilters = () => {
    setSelectedTags([]);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Uygulama bulunamadı
          </h2>
          <p className="text-gray-600 mb-4">
            Aradığınız uygulama mevcut değil veya erişim yetkiniz yok.
          </p>
          <Link href="/dashboard/apps">
            <Button>Uygulamalara Dön</Button>
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
              <Link href="/dashboard/apps">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Uygulamalar
                </Button>
              </Link>
              <Link href={`/dashboard/apps/${app.slug}/versions/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Versiyon
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">İstatistikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Versiyon</span>
                  <Badge variant="secondary">{app._count.versions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam İndirme</span>
                  <Badge variant="secondary">{getTotalDownloads()}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tag Filters */}
        {tags.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Tag Filtreleri
              </CardTitle>
              <CardDescription>
                Versiyonları tag'lere göre filtreleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(tag.id)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "text-white"
                        : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id)
                        ? tag.color
                        : undefined,
                    }}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag.name}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {filteredVersions.length} versiyon gösteriliyor
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Filtreleri Temizle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Versions */}
        <Card>
          <CardHeader>
            <CardTitle>Versiyonlar</CardTitle>
            <CardDescription>
              Uygulamanın tüm versiyonları ve indirme linkleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredVersions.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTags.length > 0
                    ? "Seçilen tag'lere uygun versiyon bulunamadı"
                    : "Henüz versiyon yok"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedTags.length > 0
                    ? "Farklı tag'ler seçerek tekrar deneyin"
                    : "Bu uygulama için henüz hiçbir versiyon yüklenmemiş"}
                </p>
                {selectedTags.length > 0 ? (
                  <Button onClick={clearFilters}>Filtreleri Temizle</Button>
                ) : (
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
                    <TableHead>Tag'ler</TableHead>
                    <TableHead>Dosya</TableHead>
                    <TableHead>Yükleyen</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İndirme</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">v{version.version}</div>
                          <div className="text-sm text-gray-500">
                            Build {version.buildNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {version.tags.map((versionTag) => (
                            <Badge
                              key={versionTag.tag.id}
                              style={{
                                backgroundColor: versionTag.tag.color,
                                color: "white",
                              }}
                              className="text-xs"
                            >
                              {versionTag.tag.name}
                            </Badge>
                          ))}
                          {version.tags.length === 0 && (
                            <span className="text-sm text-gray-400">
                              Tag yok
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {version.originalFileName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(version.fileSize)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">
                              {version.uploadedBy.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {version.uploadedBy.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(version.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {version.downloadCount} indirme
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DownloadButton
                          slug={app.slug}
                          versionId={version.id}
                        />
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
