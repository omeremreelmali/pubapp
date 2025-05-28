import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDownloadUrl } from "@/lib/minio";

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
                iosMinimumVersion: true,
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
        { error: "Bu endpoint sadece iOS uygulamaları için kullanılabilir" },
        { status: 400 }
      );
    }

    // Generate pre-signed URL for the IPA file
    const ipaUrl = await generateDownloadUrl(
      downloadLink.version.fileName,
      3600 // 1 hour
    );

    // Create manifest.plist content
    const bundleId =
      downloadLink.version.app.iosBundleId ||
      downloadLink.version.app.packageName;
    const appName = downloadLink.version.app.name;
    const version = downloadLink.version.version;
    const minimumOSVersion =
      downloadLink.version.app.iosMinimumVersion || "12.0";

    const manifest = `<?xml version="1.0" encoding="UTF-8"?>
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
          <string>${ipaUrl}</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${bundleId}</string>
        <key>bundle-version</key>
        <string>${version}</string>
        <key>kind</key>
        <string>software</string>
        <key>platform-identifier</key>
        <string>com.apple.platform.iphoneos</string>
        <key>title</key>
        <string>${appName}</string>
        <key>minimum-os-version</key>
        <string>${minimumOSVersion}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;

    // Update download count
    await prisma.appVersion.update({
      where: { id: downloadLink.version.id },
      data: { downloadCount: { increment: 1 } },
    });

    return new NextResponse(manifest, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": 'inline; filename="manifest.plist"',
      },
    });
  } catch (error: any) {
    console.error("Manifest error:", error);
    return NextResponse.json(
      { error: "Manifest oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
