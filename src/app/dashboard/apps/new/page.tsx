"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Smartphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewAppPage() {
  const [formData, setFormData] = useState({
    name: "",
    packageName: "",
    platform: "",
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

  const handlePlatformChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Bir hata oluştu");
      } else {
        toast.success("Uygulama başarıyla oluşturuldu!");
        router.push(`/dashboard/apps/${data.app.slug}`);
      }
    } catch (error) {
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePackageName = () => {
    if (formData.name) {
      const cleanName = formData.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        packageName: `com.company.${cleanName}`,
      }));
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
                <Smartphone className="mr-3 h-8 w-8" />
                Yeni Uygulama Oluştur
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Yeni bir mobil uygulama ekleyin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Ana Sayfa
                </Button>
              </Link>
              <Link href="/dashboard/apps">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Uygulamalar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Uygulama Bilgileri</CardTitle>
            <CardDescription>
              Uygulamanızın temel bilgilerini girin
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
                <Label htmlFor="name">Uygulama Adı *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Örn: My Awesome App"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Uygulamanızın görünen adı
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageName">Paket Adı *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="packageName"
                    name="packageName"
                    type="text"
                    placeholder="com.company.app"
                    value={formData.packageName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePackageName}
                    disabled={isLoading || !formData.name}
                  >
                    Otomatik
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Benzersiz paket tanımlayıcısı (reverse domain notation)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={handlePlatformChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Platform seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANDROID">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                        Android
                      </div>
                    </SelectItem>
                    <SelectItem value="IOS">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                        iOS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Uygulamanızın hedef platformu
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Uygulamanız hakkında kısa bir açıklama..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Opsiyonel: Uygulamanızın ne yaptığını açıklayın
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard/apps">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    İptal
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Uygulama Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 İpuçları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Paket Adı:</strong> Benzersiz olmalı ve reverse domain
              notation kullanmalı (örn: com.sirketadi.uygulamaadi)
            </div>
            <div>
              <strong>Platform:</strong> Her platform için ayrı uygulama
              oluşturmanız gerekir
            </div>
            <div>
              <strong>Versiyon Yönetimi:</strong> Uygulama oluşturduktan sonra
              farklı versiyonlar yükleyebilirsiniz
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
