"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function SetupPage() {
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

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
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("organizationCreateError"));
      } else {
        toast.success(t("organizationCreatedSuccess"));

        // Session'ı güncelle
        await update({
          organizationId: data.user.organizationId,
          organization: data.user.organization,
        });

        // Dashboard'a yönlendir
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError(t("organizationCreateError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("createOrganization")}
          </CardTitle>
          <CardDescription>
            {t("createOrganizationDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t("organizationNameRequired")}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t("organizationNamePlaceholder")}
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t("organizationDescriptionPlaceholder")}
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("createOrganizationButton")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>{t("organizationSetupInfo")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
