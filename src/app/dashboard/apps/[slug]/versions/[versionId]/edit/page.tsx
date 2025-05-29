"use client";

import { useState, useEffect } from "react";
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
import { Loader2, ArrowLeft, Edit, Tag, Save, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

interface TagData {
  id: string;
  name: string;
  color: string;
}

interface VersionData {
  id: string;
  version: string;
  buildNumber: number;
  releaseNotes?: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    tag: TagData;
  }>;
}

export default function EditVersionPage() {
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({
    version: "",
    buildNumber: "",
    releaseNotes: "",
  });
  const [tags, setTags] = useState<TagData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const versionId = params.versionId as string;

  useEffect(() => {
    fetchVersionData();
    fetchTags();
  }, [slug, versionId]);

  const fetchVersionData = async () => {
    try {
      const response = await fetch(`/api/apps/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("versionLoadError"));
        return;
      }

      const version = data.app.versions.find(
        (v: VersionData) => v.id === versionId
      );
      if (!version) {
        toast.error(t("versionNotFound"));
        router.push(`/dashboard/apps/${slug}`);
        return;
      }

      setVersionData(version);
      setFormData({
        version: version.version,
        buildNumber: version.buildNumber.toString(),
        releaseNotes: version.releaseNotes || "",
      });
      setSelectedTags(version.tags.map((vt: { tag: TagData }) => vt.tag.id));
    } catch (error) {
      toast.error(t("errorOccurred"));
    } finally {
      setIsLoadingData(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/apps/${slug}/versions/${versionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: formData.version,
          buildNumber: parseInt(formData.buildNumber),
          releaseNotes: formData.releaseNotes,
          tagIds: selectedTags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("versionUpdateError"));
      } else {
        toast.success(t("versionUpdatedSuccess"));
        router.push(`/dashboard/apps/${slug}`);
      }
    } catch (error) {
      setError(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = [t("bytes"), t("kb"), t("mb"), t("gb")];
    if (bytes === 0) return `0 ${t("bytes")}`;
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loadingVersion")}</p>
        </div>
      </div>
    );
  }

  if (!versionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("versionNotFound")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("versionNotFoundDescription")}
          </p>
          <Link href={`/dashboard/apps/${slug}`}>
            <Button>{t("goBack")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Edit className="mr-3 h-8 w-8" />
                {t("editVersion")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                v{versionData.version} - {t("build")} {versionData.buildNumber}
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
        {/* File Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("fileInfo")}</CardTitle>
            <CardDescription>{t("fileInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div className="flex-1">
                  <p className="font-medium">{versionData.originalFileName}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(versionData.fileSize)} •{" "}
                    {versionData.downloadCount} {t("downloads")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {versionData.uploadedBy.name} {t("by")}{" "}
                    {formatDate(versionData.createdAt)} {t("uploadedOn")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="releaseNotes">{t("releaseNotes")}</Label>
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
                <CardDescription>
                  {t("tagsForVersionDescription")}
                </CardDescription>
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href={`/dashboard/apps/${slug}`}>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("updating")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("saveChanges")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
