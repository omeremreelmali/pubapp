"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Mail,
  UserPlus,
  ArrowLeft,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InviteUserDialog } from "@/components/dashboard/invite-user-dialog";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: {
    createdApps: number;
    uploadedVersions: number;
  };
}

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: User;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [dialog, setDialog] = useState<boolean>(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, invitationsResponse] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/organizations/invitations"),
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setMembers(
          usersData.users.map((user: any) => ({
            id: user.id,
            role: user.role,
            joinedAt: user.joinedAt,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              createdAt: user.createdAt,
              _count: {
                createdApps: 0, // Bu bilgi API'den gelmiyor, varsayılan değer
                uploadedVersions: 0, // Bu bilgi API'den gelmiyor, varsayılan değer
              },
            },
          }))
        );
      }

      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        setPendingInvitations(invitationsData.invitations || []);
      }
    } catch (error) {
      toast.error(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!editingMember || !newRole) return;

    try {
      const response = await fetch(`/api/users/${editingMember.user.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success(t("userRoleUpdated"));
        setEditingMember(null);
        setNewRole("");
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || t("roleUpdateError"));
      }
    } catch (error) {
      toast.error(t("errorOccurred"));
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      if (!session?.user?.activeOrganization) {
        toast.error(t("noActiveOrganization"));
        return;
      }

      const response = await fetch(
        `/api/organizations/${session.user.activeOrganization.id}/invitations?invitationId=${invitationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success(t("inviteCancelled"));
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || t("inviteCancelError"));
      }
    } catch (error) {
      toast.error(t("errorOccurred"));
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "EDITOR":
        return "secondary";
      case "TESTER":
        return "outline";
      default:
        return "outline";
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("usersLoading")}</p>
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
                {t("userManagement")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {session?.user?.activeOrganization
                  ? t("manageUsersDescription", {
                      organizationName: session.user.activeOrganization.name,
                    })
                  : t("manageUsers")}
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
              <InviteUserDialog />
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
                {t("totalUsers")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("pendingInvites")}
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingInvitations.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("adminCount")}
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.role === "ADMIN").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Users */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("activeUsers")}</CardTitle>
            <CardDescription>{t("allUsersDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("joinDate")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(member.joinedAt)}</TableCell>
                    <TableCell>
                      <Dialog open={dialog} onOpenChange={setDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingMember(member);
                              setNewRole(member.role);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t("edit")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("editUserRole")}</DialogTitle>
                            <DialogDescription>
                              {t("editUserRoleDescription", {
                                userName: member.user.name,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger>
                                <SelectValue placeholder={t("selectRole")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">
                                  {t("admin")}
                                </SelectItem>
                                <SelectItem value="EDITOR">
                                  {t("editor")}
                                </SelectItem>
                                <SelectItem value="TESTER">
                                  {t("tester")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDialog(false);
                                setEditingMember(null);
                              }}
                            >
                              {t("cancel")}
                            </Button>
                            <Button onClick={handleEditRole}>
                              {t("save")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("pendingInvitations")}</CardTitle>
              <CardDescription>{t("notAcceptedInvites")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("sentDate")}</TableHead>
                    <TableHead>{t("expiryDate")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(invitation.role)}>
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                      <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t("cancelInvite")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
