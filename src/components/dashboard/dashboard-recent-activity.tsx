"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";

interface RecentActivity {
  id: string;
  version: string;
  createdAt: Date;
  app: {
    name: string;
    slug: string;
  };
  uploadedBy: {
    name: string | null;
    email: string;
  };
}

interface DashboardRecentActivityProps {
  recentActivity: RecentActivity[];
}

export function DashboardRecentActivity({
  recentActivity,
}: DashboardRecentActivityProps) {
  const { t } = useTranslation("common");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentActivity")}</CardTitle>
        <CardDescription>{t("recentActivityDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("noActivity")}
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <Link
                        href={`/dashboard/apps/${activity.app.slug}`}
                        className="hover:text-blue-600"
                      >
                        {activity.app.name}
                      </Link>{" "}
                      {t("newVersionUploaded")}
                    </p>
                    <p className="text-xs text-gray-500">
                      v{activity.version} •{" "}
                      {activity.uploadedBy.name || "Bilinmeyen"} {t("by")}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Intl.DateTimeFormat("tr-TR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(activity.createdAt))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
