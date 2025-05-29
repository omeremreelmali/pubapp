"use client";

import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestI18nPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">i18n Test Sayfası</h1>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Common</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{t("common.loading")}</p>
            <p>{t("common.error")}</p>
            <p>{t("common.success")}</p>
            <p>{t("common.save")}</p>
            <p>{t("common.delete")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{t("auth.signin")}</p>
            <p>{t("auth.signup")}</p>
            <p>{t("auth.email")}</p>
            <p>{t("auth.password")}</p>
            <p>{t("auth.welcome")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{t("dashboard.title")}</p>
            <p>{t("dashboard.welcome")}</p>
            <p>{t("dashboard.apps")}</p>
            <p>{t("dashboard.users")}</p>
            <p>{t("dashboard.settings")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
