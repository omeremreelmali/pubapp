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
  Users,
  Plus,
  Search,
  Settings,
  Smartphone,
  Eye,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count: {
    members: number;
    appAccess: number;
  };
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  appAccess: Array<{
    app: {
      id: string;
      name: string;
      platform: string;
    };
  }>;
}

export default function GroupsPage() {
  const { t } = useTranslation("common");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async (search?: string) => {
    try {
      const url = new URL("/api/groups", window.location.origin);
      if (search) {
        url.searchParams.set("search", search);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("groupsLoadError"));
        return;
      }

      setGroups(data.groups);
    } catch (error) {
      toast.error(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchGroups(searchTerm);
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
        {t("android")}
      </Badge>
    ) : (
      <Badge variant="default" className="bg-blue-600">
        {t("ios")}
      </Badge>
    );
  };

  const getTotalStats = () => {
    return {
      totalGroups: groups.length,
      totalMembers: groups.reduce(
        (sum, group) => sum + group._count.members,
        0
      ),
      totalApps: groups.reduce((sum, group) => sum + group._count.appAccess, 0),
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("groupsLoading")}</p>
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
                <Users className="mr-3 h-8 w-8" />
                {t("testGroups")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("testGroupsDescription")}
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
              <Link href="/dashboard/groups/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("newGroup")}
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalGroups")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("totalMembers")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("accessibleApps")}
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApps}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("searchGroup")}</CardTitle>
            <CardDescription>{t("searchGroupDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder={t("groupNameOrDescription")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                {t("search")}
              </Button>
              {searchTerm && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    fetchGroups();
                  }}
                >
                  {t("clear")}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Groups Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("groups")}</CardTitle>
                <CardDescription>{t("allTestGroups")}</CardDescription>
              </div>
              <Link href="/dashboard/groups/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("newGroup")}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? t("groupNotFound") : t("noGroupsYet")}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? t("searchCriteriaNoMatch")
                    : t("noGroupsCreatedYet")}
                </p>
                {!searchTerm && (
                  <Link href="/dashboard/groups/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("createFirstGroup")}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("groupName")}</TableHead>
                    <TableHead>{t("description")}</TableHead>
                    <TableHead>{t("memberCount")}</TableHead>
                    <TableHead>{t("appAccess")}</TableHead>
                    <TableHead>{t("createdDate")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        {group.name}
                      </TableCell>
                      <TableCell>
                        {group.description || (
                          <span className="text-gray-400 italic">
                            {t("noDescription")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {group._count.members} {t("members")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {group.appAccess.slice(0, 2).map((access) => (
                            <div
                              key={access.app.id}
                              className="flex items-center space-x-1"
                            >
                              {getPlatformBadge(access.app.platform)}
                            </div>
                          ))}
                          {group.appAccess.length > 2 && (
                            <Badge variant="outline">
                              +{group.appAccess.length - 2} {t("more")}
                            </Badge>
                          )}
                          {group.appAccess.length === 0 && (
                            <span className="text-gray-400 text-sm">
                              {t("noAccess")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(group.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/groups/${group.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/groups/${group.id}/settings`}>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
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
