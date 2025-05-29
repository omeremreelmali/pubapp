"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function NewGroupPage() {
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t("groupNameRequiredError"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errorOccurred"));
      } else {
        toast.success(t("groupCreatedSuccess"));
        router.push(`/dashboard/groups/${data.group.id}`);
      }
    } catch (error) {
      setError(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8" />
                {t("createNewGroup")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("createNewGroupDescription")}
              </p>
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("groupInfo")}</CardTitle>
              <CardDescription>{t("groupInfoDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t("groupNameRequired")}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("groupNamePlaceholder")}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">{t("groupNameHelper")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t("descriptionPlaceholder")}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  {t("descriptionHelper")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/groups">
              <Button type="button" variant="outline" disabled={isLoading}>
                {t("cancel")}
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("createGroup")}
            </Button>
          </div>
        </form>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {t("groupManagementGuide")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>{t("afterCreatingGroup")}</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>{t("canAddTestUsers")}</li>
                <li>{t("canGrantAppAccess")}</li>
                <li>{t("canEditGroupSettings")}</li>
              </ul>
            </div>
            <div>
              <strong>{t("memberManagement")}</strong>{" "}
              {t("memberManagementDescription")}
            </div>
            <div>
              <strong>{t("appAccessManagement")}</strong>{" "}
              {t("appAccessDescription")}
            </div>
            <div>
              <strong>{t("security")}</strong> {t("securityDescription")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
