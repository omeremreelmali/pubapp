import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find download link by token
    const downloadLink = await prisma.downloadLink.findUnique({
      where: { token },
      include: {
        version: {
          include: {
            app: {
              select: {
                id: true,
                name: true,
                platform: true,
                packageName: true,
                iosBundleId: true,
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (!downloadLink) {
      return NextResponse.json(
        { error: "Geçersiz indirme linki" },
        { status: 404 }
      );
    }

    // Check if link is expired
    if (downloadLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "İndirme linki süresi dolmuş" },
        { status: 410 }
      );
    }

    // Only for iOS apps
    if (downloadLink.version.app.platform !== "IOS") {
      return NextResponse.json(
        { error: "Manifest sadece iOS uygulamaları için desteklenir" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const downloadUrl = `${baseUrl}/api/download/${token}`;

    // Generate iOS manifest
    const manifest = generateIOSManifest({
      appName: downloadLink.version.app.name,
      bundleId:
        downloadLink.version.app.iosBundleId ||
        downloadLink.version.app.packageName,
      version: downloadLink.version.version,
      buildNumber: downloadLink.version.buildNumber,
      downloadUrl,
      fileSize: downloadLink.version.fileSize,
    });

    return new NextResponse(manifest, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Manifest generation error:", error);
    return NextResponse.json(
      { error: "Manifest oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

interface ManifestConfig {
  appName: string;
  bundleId: string;
  version: string;
  buildNumber: number;
  downloadUrl: string;
  fileSize: number;
}

function generateIOSManifest(config: ManifestConfig): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>${config.downloadUrl}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>${config.bundleId}</string>
                <key>bundle-version</key>
                <string>${config.version}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>${config.appName}</string>
                <key>subtitle</key>
                <string>v${config.version} (${config.buildNumber})</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>`;
}
