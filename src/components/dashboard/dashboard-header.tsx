"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const { t } = useTranslation("common");

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("dashboard")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("welcome")}, {userName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant={
                userRole === "ADMIN"
                  ? "default"
                  : userRole === "EDITOR"
                  ? "secondary"
                  : "outline"
              }
            >
              {userRole}
            </Badge>
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
  );
}
