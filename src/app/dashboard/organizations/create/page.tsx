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
import { Loader2, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateOrganizationPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

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
        setError(data.error || "Organizasyon oluşturulurken hata oluştu");
        return;
      }

      // Session'ı güncelle
      await update({
        activeOrganizationId: data.organization.id,
        activeOrganization: {
          id: data.organization.id,
          name: data.organization.name,
          slug: data.organization.slug,
          role: "ADMIN",
        },
        organizations: [
          {
            id: data.membershipId,
            role: "ADMIN",
            organization: {
              id: data.organization.id,
              name: data.organization.name,
              slug: data.organization.slug,
            },
          },
        ],
      });

      toast.success("Organizasyon başarıyla oluşturuldu!");
      router.push("/dashboard");
    } catch (error) {
      setError("Bir hata oluştu");
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
                <Building2 className="mr-3 h-8 w-8" />
                Yeni Organizasyon Oluştur
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Ekibiniz için yeni bir organizasyon oluşturun
              </p>
            </div>
            <Link href="/dashboard/organizations">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Organizasyon Bilgileri</CardTitle>
            <CardDescription>
              Organizasyonunuzun temel bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Organizasyon Adı</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Şirket veya ekip adınız"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama (İsteğe bağlı)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Organizasyonunuz hakkında kısa bir açıklama"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/organizations">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    İptal
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Organizasyon Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
