"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, ArrowLeft, FileText, Smartphone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  validateFile,
  formatFileSize,
  ALLOWED_EXTENSIONS,
} from "@/lib/file-utils";

export default function NewVersionPage() {
  const [formData, setFormData] = useState({
    version: "",
    buildNumber: "",
    releaseNotes: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Platform bilgisini almak için API çağrısı yapmamız gerekiyor
    // Şimdilik Android olarak varsayalım, gerçek uygulamada app bilgisini çekmemiz gerekir
    const validation = validateFile(selectedFile, "ANDROID");

    if (!validation.isValid) {
      setError(validation.error || "Geçersiz dosya");
      return;
    }

    setFile(selectedFile);
    setError("");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Lütfen bir dosya seçin");
      return;
    }

    setIsLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("version", formData.version);
      formDataToSend.append("buildNumber", formData.buildNumber);
      formDataToSend.append("releaseNotes", formData.releaseNotes);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`/api/apps/${slug}/versions`, {
        method: "POST",
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Bir hata oluştu");
      } else {
        toast.success("Versiyon başarıyla yüklendi!");
        router.push(`/dashboard/apps/${slug}`);
      }
    } catch (error) {
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Upload className="mr-3 h-8 w-8" />
                Yeni Versiyon Yükle
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Uygulamanız için yeni bir versiyon yükleyin
              </p>
            </div>
            <Link href={`/dashboard/apps/${slug}`}>
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
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Dosya Yükleme</CardTitle>
              <CardDescription>
                APK, AAB veya IPA dosyanızı yükleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Dosyayı buraya sürükleyin
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    veya dosya seçmek için tıklayın
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".apk,.aab,.ipa"
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Dosya Seç
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-4">
                    Desteklenen formatlar: APK, AAB, IPA (Max: 100MB)
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      disabled={isLoading}
                    >
                      Kaldır
                    </Button>
                  </div>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Yükleniyor...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Version Info */}
          <Card>
            <CardHeader>
              <CardTitle>Versiyon Bilgileri</CardTitle>
              <CardDescription>Versiyon detaylarını girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Versiyon Numarası *</Label>
                  <Input
                    id="version"
                    name="version"
                    type="text"
                    placeholder="1.0.0"
                    value={formData.version}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Semantic versioning (örn: 1.0.0)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildNumber">Build Numarası *</Label>
                  <Input
                    id="buildNumber"
                    name="buildNumber"
                    type="number"
                    placeholder="1"
                    value={formData.buildNumber}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Benzersiz build numarası
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseNotes">Sürüm Notları</Label>
                <Textarea
                  id="releaseNotes"
                  name="releaseNotes"
                  placeholder="Bu versiyonda neler değişti..."
                  value={formData.releaseNotes}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Opsiyonel: Bu versiyondaki değişiklikleri açıklayın
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href={`/dashboard/apps/${slug}`}>
              <Button type="button" variant="outline" disabled={isLoading}>
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Versiyonu Yükle
            </Button>
          </div>
        </form>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📋 Yükleme Rehberi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Dosya Formatları:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Android: APK veya AAB dosyaları</li>
                <li>iOS: IPA dosyaları</li>
              </ul>
            </div>
            <div>
              <strong>Versiyon Numarası:</strong> Semantic versioning kullanın
              (örn: 1.0.0, 2.1.3)
            </div>
            <div>
              <strong>Build Numarası:</strong> Her build için benzersiz bir sayı
              olmalıdır
            </div>
            <div>
              <strong>Dosya Boyutu:</strong> Maksimum 100MB dosya
              yükleyebilirsiniz
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
