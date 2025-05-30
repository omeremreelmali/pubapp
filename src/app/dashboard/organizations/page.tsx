"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plus, LogOut } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function OrganizationsPage() {
  const { t } = useTranslation("common");
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectOrganization = async (organizationId: string) => {
    setIsLoading(true);
    try {
      const selectedOrg = session?.user.organizations.find(
        (org) => org.organization.id === organizationId
      );

      if (!selectedOrg) {
        toast.error(t("organizationNotFound"));
        return;
      }

      // Session'ı güncelle
      await update({
        activeOrganizationId: organizationId,
        activeOrganization: {
          id: selectedOrg.organization.id,
          name: selectedOrg.organization.name,
          slug: selectedOrg.organization.slug,
          role: selectedOrg.role,
        },
      });

      toast.success(
        t("organizationSwitched", {
          organizationName: selectedOrg.organization.name,
        })
      );
      router.push("/dashboard");
    } catch (error) {
      toast.error(t("organizationSwitchError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return <div>{t("loading")}...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="mr-3 h-8 w-8" />
                {t("selectOrganization")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("selectOrganizationDescription")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/dashboard/organizations/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("newOrganization")}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session.user.organizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("noOrganizationMembership")}
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {t("noOrganizationMembershipDescription")}
              </p>
              <Link href="/dashboard/organizations/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("createFirstOrganization")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {session.user.organizations.map((membership) => (
              <Card
                key={membership.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  handleSelectOrganization(membership.organization.id)
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {membership.organization.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        @{membership.organization.slug}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        membership.role === "ADMIN"
                          ? "default"
                          : membership.role === "EDITOR"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {membership.role === "ADMIN"
                        ? t("admin")
                        : membership.role === "EDITOR"
                        ? t("editor")
                        : t("tester")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {t("organizationMember")}
                    </div>
                    <Button
                      size="sm"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOrganization(membership.organization.id);
                      }}
                    >
                      {t("select")}
                    </Button>
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
