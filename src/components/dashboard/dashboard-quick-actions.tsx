"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Smartphone, Download, Plus, Tag } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";

interface DashboardQuickActionsProps {
  userRole: string;
}

export function DashboardQuickActions({
  userRole,
}: DashboardQuickActionsProps) {
  const { t } = useTranslation("common");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {(userRole === "ADMIN" || userRole === "EDITOR") && (
        <>
          <Link href="/dashboard/apps/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">{t("newApp")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">{t("userManagement")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/groups">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <p className="text-sm font-medium">{t("testGroups")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/tags">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">{t("tagManagement")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </>
      )}

      <Link href="/dashboard/apps">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">{t("apps")}</p>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/downloads">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Download className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-sm font-medium">{t("downloadStats")}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
