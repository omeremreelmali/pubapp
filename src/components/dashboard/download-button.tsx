"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadButtonProps {
  versionId: string;
  slug: string;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
}

export function DownloadButton({
  versionId,
  slug,
  size = "sm",
  variant = "outline",
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      // Create download link
      const response = await fetch(
        `/api/apps/${slug}/versions/${versionId}/download`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "İndirme linki oluşturulamadı");
        return;
      }

      // Open download URL in new tab
      window.open(data.downloadUrl, "_blank");
      toast.success("İndirme başlatıldı");
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {size !== "sm" && <span className="ml-2">İndir</span>}
    </Button>
  );
}
