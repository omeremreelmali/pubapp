"use client";

import { useState, useEffect } from "react";
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
  Download,
  Calendar,
  Smartphone,
  TrendingUp,
  Users,
  Clock,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

interface DownloadStats {
  totalDownloads: number;
  todayDownloads: number;
  weekDownloads: number;
  monthDownloads: number;
  topApps: Array<{
    app: {
      id: string;
      name: string;
      platform: string;
    };
    totalDownloads: number;
  }>;
  recentDownloads: Array<{
    id: string;
    createdAt: string;
    expiresAt: string;
    downloadedAt?: string;
    version: {
      id: string;
      version: string;
      buildNumber: number;
      app: {
        id: string;
        name: string;
        platform: string;
      };
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
}

export default function DownloadsPage() {
  const { t } = useTranslation("common");
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDownloadStats();
  }, []);

  const fetchDownloadStats = async () => {
    try {
      const response = await fetch("/api/downloads/stats");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("statsLoadError"));
        return;
      }

      setStats(data);
    } catch (error) {
      toast.error(t("errorOccurred"));
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

  const getStatusBadge = (downloadedAt?: string, expiresAt?: string) => {
    if (downloadedAt) {
      return <Badge variant="default">{t("downloaded")}</Badge>;
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive">{t("expired")}</Badge>;
    }

    return <Badge variant="secondary">{t("active")}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "default",
      EDITOR: "secondary",
      TESTER: "outline",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "outline"}>
        {role === "ADMIN"
          ? t("admin")
          : role === "EDITOR"
          ? t("editor")
          : t("tester")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("statsLoading")}</p>
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
                <Download className="mr-3 h-8 w-8" />
                {t("downloadStats")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("downloadStatsDescription")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("homepage")}
                </Button>
              </Link>
              <Link href="/auth/signout">
                <Button variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("signOut")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("totalDownloads")}
                  </CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalDownloads}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("today")}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.todayDownloads}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("thisWeek")}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.weekDownloads}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("thisMonth")}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.monthDownloads}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Apps */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t("topApps")}</CardTitle>
                <CardDescription>{t("topAppsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topApps.length === 0 ? (
                  <div className="text-center py-8">
                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("noDownloadsYet")}
                    </h3>
                    <p className="text-gray-500">
                      {t("noDownloadsDescription")}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("app")}</TableHead>
                        <TableHead>{t("platform")}</TableHead>
                        <TableHead>{t("downloadCount")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topApps.map((item, index) => (
                        <TableRow key={item.app.id}>
                          <TableCell className="font-medium">
                            #{index + 1} {item.app.name}
                          </TableCell>
                          <TableCell>
                            {getPlatformBadge(item.app.platform)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.totalDownloads} {t("downloads")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recent Downloads */}
            <Card>
              <CardHeader>
                <CardTitle>{t("recentDownloadLinks")}</CardTitle>
                <CardDescription>
                  {t("recentDownloadLinksDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentDownloads.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("noDownloadLinksYet")}
                    </h3>
                    <p className="text-gray-500">
                      {t("noDownloadLinksDescription")}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("app")}</TableHead>
                        <TableHead>{t("version")}</TableHead>
                        <TableHead>{t("platform")}</TableHead>
                        <TableHead>{t("downloader")}</TableHead>
                        <TableHead>{t("createdAt")}</TableHead>
                        <TableHead>{t("expiresAt")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentDownloads.map((download) => (
                        <TableRow key={download.id}>
                          <TableCell className="font-medium">
                            {download.version.app.name}
                          </TableCell>
                          <TableCell>
                            v{download.version.version} ({t("build")}{" "}
                            {download.version.buildNumber})
                          </TableCell>
                          <TableCell>
                            {getPlatformBadge(download.version.app.platform)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {download.createdBy.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {download.createdBy.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="mr-1 h-4 w-4" />
                              {formatDate(download.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatDate(download.expiresAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(
                              download.downloadedAt,
                              download.expiresAt
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("statsLoadFailed")}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("statsLoadFailedDescription")}
            </p>
            <Button onClick={fetchDownloadStats}>{t("tryAgain")}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
