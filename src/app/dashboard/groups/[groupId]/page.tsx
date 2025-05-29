"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  ArrowLeft,
  Plus,
  Trash2,
  Smartphone,
  UserPlus,
  Settings,
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
  members: Array<{
    id: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  appAccess: Array<{
    id: string;
    grantedAt: string;
    app: {
      id: string;
      name: string;
      slug: string;
      platform: string;
      packageName: string;
    };
  }>;
  _count: {
    members: number;
    appAccess: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface App {
  id: string;
  name: string;
  platform: string;
  packageName: string;
}

export default function GroupDetailPage() {
  const { t } = useTranslation("common");
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableApps, setAvailableApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAppId, setSelectedAppId] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingApp, setIsAddingApp] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchAvailableUsers();
      fetchAvailableApps();
    }
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("groupLoadError"));
        return;
      }

      setGroup(data.group);
    } catch (error) {
      toast.error(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (response.ok) {
        setAvailableUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAvailableApps = async () => {
    try {
      const response = await fetch("/api/apps");
      const data = await response.json();

      if (response.ok) {
        setAvailableApps(data);
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
    }
  };

  const addMember = async () => {
    if (!selectedUserId) {
      toast.error(t("pleaseSelectUser"));
      return;
    }

    setIsAddingMember(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("memberAddError"));
      } else {
        toast.success(t("memberAddSuccess"));
        setSelectedUserId("");
        fetchGroup();
      }
    } catch (error) {
      toast.error(t("errorOccurred"));
    } finally {
      setIsAddingMember(false);
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("memberRemoveError"));
      } else {
        toast.success(t("memberRemoveSuccess"));
        fetchGroup();
      }
    } catch (error) {
      toast.error(t("errorOccurred"));
    }
  };

  const addAppAccess = async () => {
    if (!selectedAppId) {
      toast.error(t("pleaseSelectApp"));
      return;
    }

    setIsAddingApp(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/apps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appId: selectedAppId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("appAccessGrantError"));
      } else {
        toast.success(t("appAccessGrantSuccess"));
        setSelectedAppId("");
        fetchGroup();
      }
    } catch (error) {
      toast.error(t("errorOccurred"));
    } finally {
      setIsAddingApp(false);
    }
  };

  const removeAppAccess = async (appId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/apps/${appId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("appAccessRemoveError"));
      } else {
        toast.success(t("appAccessRemoveSuccess"));
        fetchGroup();
      }
    } catch (error) {
      toast.error(t("errorOccurred"));
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

  const getAvailableUsersForGroup = () => {
    if (!group) return availableUsers;
    const memberIds = group.members.map((member) => member.user.id);
    return availableUsers.filter((user) => !memberIds.includes(user.id));
  };

  const getAvailableAppsForGroup = () => {
    if (!group) return availableApps;
    const appIds = group.appAccess.map((access) => access.app.id);
    return availableApps.filter((app) => !appIds.includes(app.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("groupLoading")}</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("groupNotFound")}
          </h3>
          <p className="text-gray-500 mb-4">{t("groupNotFoundDescription")}</p>
          <Link href="/dashboard/groups">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("groups")}
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8" />
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {group.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {t("homepage")}
                </Button>
              </Link>
              <Link href="/dashboard/groups">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("groups")}
                </Button>
              </Link>
              <Link href={`/dashboard/groups/${groupId}/settings`}>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("settings")}
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
                {t("totalMembers")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group._count.members}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("appAccessManagement")}
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group._count.appAccess}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("createdDate")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {formatDate(group.createdAt)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("groupMembers")}</CardTitle>
                <CardDescription>
                  {t("groupMembersDescription", {
                    count: group.members.length,
                  })}
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("addMember")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("addMemberToGroup")}</DialogTitle>
                    <DialogDescription>
                      {t("addMemberDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectUser")} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableUsersForGroup().map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email}) -{" "}
                            {user.role === "ADMIN"
                              ? t("admin")
                              : user.role === "EDITOR"
                              ? t("editor")
                              : t("tester")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end space-x-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">{t("cancel")}</Button>
                      </DialogTrigger>
                      <Button onClick={addMember} disabled={isAddingMember}>
                        {isAddingMember ? t("adding") : t("add")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {group.members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("noMembersYet")}
                </h3>
                <p className="text-gray-500">{t("noMembersDescription")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("userName")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("joinDate")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.name}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>{getRoleBadge(member.user.role)}</TableCell>
                      <TableCell>{formatDate(member.joinedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember(member.user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* App Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("appAccesses")}</CardTitle>
                <CardDescription>
                  {t("appAccessesDescription", {
                    count: group.appAccess.length,
                  })}
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addApp")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("grantAppAccess")}</DialogTitle>
                    <DialogDescription>
                      {t("grantAppAccessDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select
                      value={selectedAppId}
                      onValueChange={setSelectedAppId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectApp")} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableAppsForGroup().map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.name} (
                            {app.platform === "ANDROID"
                              ? t("android")
                              : t("ios")}
                            ) - {app.packageName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end space-x-2">
                      <DialogTrigger asChild>
                        <Button variant="outline">{t("cancel")}</Button>
                      </DialogTrigger>
                      <Button onClick={addAppAccess} disabled={isAddingApp}>
                        {isAddingApp ? t("adding") : t("add")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {group.appAccess.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("noAppAccessYet")}
                </h3>
                <p className="text-gray-500">{t("noAppAccessDescription")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("application")}</TableHead>
                    <TableHead>{t("platform")}</TableHead>
                    <TableHead>{t("packageName")}</TableHead>
                    <TableHead>{t("accessDate")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.appAccess.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell className="font-medium">
                        {access.app.name}
                      </TableCell>
                      <TableCell>
                        {getPlatformBadge(access.app.platform)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {access.app.packageName}
                      </TableCell>
                      <TableCell>{formatDate(access.grantedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAppAccess(access.app.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
