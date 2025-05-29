"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { OrganizationSwitcher } from "./organization-switcher";

interface DashboardOrganizationInfoProps {
  organizationName: string;
  organizationSlug: string;
}

export function DashboardOrganizationInfo({
  organizationName,
  organizationSlug,
}: DashboardOrganizationInfoProps) {
  const { t } = useTranslation("common");

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                {organizationName}
              </CardTitle>
              <CardDescription>
                {t("organizationCode")}: {organizationSlug}
              </CardDescription>
            </div>
            <div className="w-64">
              <OrganizationSwitcher />
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
