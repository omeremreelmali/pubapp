"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Upload,
  ArrowLeft,
  FileText,
  Smartphone,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  validateFile,
  formatFileSize,
  ALLOWED_EXTENSIONS,
} from "@/lib/file-utils";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

interface TagData {
  id: string;
  name: string;
  color: string;
}

interface AppData {
  id: string;
  name: string;
  platform: string;
}

export default function NewVersionPage() {
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({
    version: "",
    buildNumber: "",
    releaseNotes: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<TagData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [app, setApp] = useState<AppData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    fetchAppData();
    fetchTags();
  }, []);

  const fetchAppData = async () => {
    try {
      const response = await fetch(`/api/apps/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setApp(data.app);
      }
    } catch (error) {
      console.error("Error fetching app data:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();

      if (response.ok) {
        setTags(data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (!app) {
        setError(t("appInfoLoading"));
        return;
      }

      const validation = validateFile(
        selectedFile,
        app.platform as "ANDROID" | "IOS"
      );

      if (!validation.isValid) {
        setError(validation.error || t("invalidFile"));
        return;
      }

      setFile(selectedFile);
      setError("");
    },
    [app, t]
  );

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
      setError(t("pleaseSelectFile"));
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
      formDataToSend.append("tagIds", JSON.stringify(selectedTags));

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
        setError(data.error || t("errorOccurred"));
      } else {
        toast.success(t("versionUploadedSuccess"));
        router.push(`/dashboard/apps/${slug}`);
      }
    } catch (error) {
      setError(t("errorOccurred"));
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
                {t("uploadNewVersion")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {app
                  ? t("uploadNewVersionFor", {
                      appName: app.name,
                      platform:
                        app.platform === "ANDROID" ? t("android") : t("ios"),
                    })
                  : t("uploadVersionGeneric")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {t("homepage")}
                </Button>
              </Link>
              <Link href={`/dashboard/apps/${slug}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("goBack")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>{t("fileUpload")}</CardTitle>
              <CardDescription>
                {app
                  ? app.platform === "ANDROID"
                    ? t("uploadApkOrAab")
                    : t("uploadIpa")
                  : t("uploadFile")}
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
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("uploadFile")}
                  </h3>
                  <p className="text-gray-500 mb-4">{t("dragDropFile")}</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={
                      app
                        ? app.platform === "ANDROID"
                          ? ALLOWED_EXTENSIONS.ANDROID.join(",")
                          : ALLOWED_EXTENSIONS.IOS.join(",")
                        : [
                            ...ALLOWED_EXTENSIONS.ANDROID,
                            ...ALLOWED_EXTENSIONS.IOS,
                          ].join(",")
                    }
                    className="hidden"
                    id="file-upload"
                    disabled={!app}
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" asChild disabled={!app}>
                      <span>{!app ? t("loading") : t("selectFile")}</span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    {t("supportedFormats")}{" "}
                    {app
                      ? app.platform === "ANDROID"
                        ? ALLOWED_EXTENSIONS.ANDROID.join(", ")
                        : ALLOWED_EXTENSIONS.IOS.join(", ")
                      : t("loading")}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">{file.name}</p>
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Version Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("versionInfo")}</CardTitle>
              <CardDescription>{t("versionInfoDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">{t("versionNumber")}</Label>
                  <Input
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    placeholder="1.0.0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buildNumber">{t("buildNumber")}</Label>
                  <Input
                    id="buildNumber"
                    name="buildNumber"
                    type="number"
                    value={formData.buildNumber}
                    onChange={handleChange}
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="releaseNotes">
                  {t("releaseNotesOptional")}
                </Label>
                <Textarea
                  id="releaseNotes"
                  name="releaseNotes"
                  value={formData.releaseNotes}
                  onChange={handleChange}
                  placeholder={t("releaseNotesPlaceholder")}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  {t("tagsForVersion")}
                </CardTitle>
                <CardDescription>{t("tagsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTags.includes(tag.id)
                            ? "text-white"
                            : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        }`}
                        style={{
                          backgroundColor: selectedTags.includes(tag.id)
                            ? tag.color
                            : undefined,
                        }}
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag.name}
                      </button>
                    ))}
                  </div>

                  {selectedTags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {t("selectedTags")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <Badge
                              key={tag.id}
                              style={{
                                backgroundColor: tag.color,
                                color: "white",
                              }}
                            >
                              {tag.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t("uploading")}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href={`/dashboard/apps/${slug}`}>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("uploading")}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("uploadVersion")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
