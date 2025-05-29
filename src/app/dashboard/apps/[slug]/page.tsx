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
  Edit,
  Trash2,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { DownloadButton } from "@/components/dashboard/download-button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

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
  const { t } = useTranslation("common");
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
        toast.error(data.error || t("appLoadError"));
        return;
      }

      setApp(data.app);
    } catch (error) {
      toast.error(t("errorOccurred"));
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

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm(t("deleteVersionConfirm"))) {
      return;
    }

    try {
      const response = await fetch(`/api/apps/${slug}/versions/${versionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("versionDeleteError"));
        return;
      }

      toast.success(t("versionDeletedSuccess"));
      fetchAppData(); // Refresh data
    } catch (error) {
      toast.error(t("errorOccurred"));
    }
  };

  const handleAnalyzeIPA = async (versionId: string) => {
    try {
      const response = await fetch(
        `/api/apps/${slug}/versions/${versionId}/analyze`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("ipaAnalysisError"));
        return;
      }

      toast.success(t("ipaAnalysisSuccess"));

      // Show analysis results
      const info = data.ipaInfo;
      toast.success(
        `📱 ${info.appName}\n🔧 ${info.distributionType}\n📋 ${
          info.bundleId
        }\n${info.teamId ? `👥 ${info.teamId}` : ""}`
      );

      fetchAppData(); // Refresh data
    } catch (error) {
      toast.error(t("errorOccurred"));
    }
  };

  const handleDownloadProfile = (versionId: string) => {
    window.open(
      `/api/apps/${slug}/versions/${versionId}/auto-profile`,
      "_blank"
    );
  };

  const getPlatformBadge = (platform: string) => {
    return platform === "ANDROID" ? (
      <Badge variant="default" className="bg-green-600">
        {t("android")}
      </Badge>
    ) : (
      <Badge variant="default" className="bg-blue-600">
        {t("ios")}
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
    const sizes = [t("bytes"), t("kb"), t("mb"), t("gb")];
    if (bytes === 0) return `0 ${t("bytes")}`;
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
          <p className="text-gray-600">{t("appsLoading")}</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("appNotFound")}
          </h2>
          <p className="text-gray-600 mb-4">{t("appNotFoundDescription")}</p>
          <Link href="/dashboard/apps">
            <Button>{t("backToApps")}</Button>
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
              <LanguageSwitcher />
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {t("homepage")}
                </Button>
              </Link>
              <Link href="/dashboard/apps">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("apps")}
                </Button>
              </Link>
              <Link href={`/dashboard/apps/${app.slug}/versions/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("newVersion")}
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
                <CardTitle>{t("appInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t("description")}
                    </h4>
                    <p className="text-gray-600">{app.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {t("packageName")}
                    </h4>
                    <p className="text-gray-600 font-mono text-sm">
                      {app.packageName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {t("platform")}
                    </h4>
                    <div>{getPlatformBadge(app.platform)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {t("createdBy")}
                    </h4>
                    <p className="text-gray-600">{app.createdBy.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {t("createdAt")}
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
                <CardTitle className="text-lg">{t("statistics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("totalVersions")}
                  </span>
                  <Badge variant="secondary">{app._count.versions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("totalDownloads")}
                  </span>
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
                {t("tagFilters")}
              </CardTitle>
              <CardDescription>{t("tagFiltersDescription")}</CardDescription>
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
                    {t("versionsShowing", { count: filteredVersions.length })}
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    {t("clearFilters")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Versions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("versions")}</CardTitle>
            <CardDescription>{t("versionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredVersions.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedTags.length > 0
                    ? t("noVersionsWithTags")
                    : t("noVersionsYet")}
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  {t("noVersionsDescription")}
                </p>
                {selectedTags.length > 0 ? (
                  <Button onClick={clearFilters}>{t("clearFilters")}</Button>
                ) : (
                  <Link href={`/dashboard/apps/${app.slug}/versions/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("uploadFirstVersion")}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("version")}</TableHead>
                    <TableHead>{t("tags")}</TableHead>
                    <TableHead>{t("file")}</TableHead>
                    <TableHead>{t("uploader")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("downloads")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">v{version.version}</div>
                          <div className="text-sm text-gray-500">
                            {t("build")} {version.buildNumber}
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
                              {t("noTags")}
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
                          {t("downloadCount", { count: version.downloadCount })}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {/* iOS specific buttons */}
                          {app.platform === "IOS" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAnalyzeIPA(version.id)}
                                title={t("ipaAnalyze")}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadProfile(version.id)
                                }
                                title={t("downloadProfile")}
                                className="bg-blue-50 hover:bg-blue-100"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          <Link
                            href={`/dashboard/apps/${slug}/versions/${version.id}/edit`}
                          >
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVersion(version.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <DownloadButton
                            slug={app.slug}
                            versionId={version.id}
                          />
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
