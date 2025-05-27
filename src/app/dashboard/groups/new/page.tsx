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

export default function NewGroupPage() {
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
      setError("Grup adı gereklidir");
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
        setError(data.error || "Bir hata oluştu");
      } else {
        toast.success("Grup başarıyla oluşturuldu!");
        router.push(`/dashboard/groups/${data.group.id}`);
      }
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
                <Users className="mr-3 h-8 w-8" />
                Yeni Grup Oluştur
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Test kullanıcıları için yeni bir grup oluşturun
              </p>
            </div>
            <Link href="/dashboard/groups">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle>Grup Bilgileri</CardTitle>
              <CardDescription>Grup için temel bilgileri girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Grup Adı *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Test Kullanıcıları"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Grup için açıklayıcı bir ad seçin
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Bu grup için açıklama..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Opsiyonel: Grubun amacını ve kapsamını açıklayın
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/groups">
              <Button type="button" variant="outline" disabled={isLoading}>
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Grubu Oluştur
            </Button>
          </div>
        </form>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📋 Grup Yönetimi Rehberi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Grup Oluşturduktan Sonra:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Test kullanıcılarını gruba ekleyebilirsiniz</li>
                <li>Uygulamalara erişim izni verebilirsiniz</li>
                <li>Grup ayarlarını düzenleyebilirsiniz</li>
              </ul>
            </div>
            <div>
              <strong>Üye Yönetimi:</strong> Sadece Admin ve Editor rolündeki
              kullanıcılar grup üyelerini yönetebilir
            </div>
            <div>
              <strong>Uygulama Erişimi:</strong> Gruplara verilen erişim
              izinleri, o gruptaki tüm üyeler için geçerlidir
            </div>
            <div>
              <strong>Güvenlik:</strong> Grup üyeleri sadece kendilerine atanan
              uygulamaları görebilir ve indirebilir
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
