import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDownloadUrl } from "@/lib/minio";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const userAgent = request.headers.get("user-agent") || "";
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

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

    // iOS platformu için özel işlem
    if (downloadLink.version.app.platform === "IOS" && isIOS) {
      // iOS için manifest URL'i oluştur
      const manifestUrl = `${process.env.NEXTAUTH_URL}/api/download/${token}/manifest`;
      const installUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(
        manifestUrl
      )}`;

      // HTML sayfası ile iOS kurulum linkini göster
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${downloadLink.version.app.name} Kurulumu</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              padding: 20px; 
              text-align: center; 
              background: #f5f5f7;
            }
            .container { 
              max-width: 400px; 
              margin: 50px auto; 
              background: white; 
              border-radius: 12px; 
              padding: 30px; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .app-icon { 
              width: 80px; 
              height: 80px; 
              background: #007AFF; 
              border-radius: 16px; 
              margin: 0 auto 20px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 32px; 
              color: white;
            }
            .install-btn { 
              background: #007AFF; 
              color: white; 
              padding: 15px 30px; 
              border: none; 
              border-radius: 8px; 
              font-size: 16px; 
              font-weight: 600; 
              text-decoration: none; 
              display: inline-block; 
              margin: 20px 0;
            }
            .info { 
              color: #666; 
              font-size: 14px; 
              margin-top: 20px; 
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="app-icon">📱</div>
            <h2>${downloadLink.version.app.name}</h2>
            <p>Versiyon: ${downloadLink.version.version}</p>
            <a href="${installUrl}" class="install-btn">Uygulamayı Kur</a>
            <div class="info">
              <p><strong>Kurulum Talimatları:</strong></p>
              <p>1. "Uygulamayı Kur" butonuna dokunun</p>
              <p>2. "Yükle" onayını verin</p>
              <p>3. Ayarlar > Genel > VPN ve Cihaz Yönetimi'nden uygulamayı güvenilir olarak işaretleyin</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Check if already downloaded (optional - you might want to allow multiple downloads)
    if (downloadLink.downloadedAt) {
      console.log("Link already used, but allowing re-download");
    }

    // Generate pre-signed URL from MinIO
    const downloadUrl = await generateDownloadUrl(
      downloadLink.version.fileName,
      3600
    ); // 1 hour

    // Update download count and mark as downloaded
    await prisma.$transaction([
      prisma.appVersion.update({
        where: { id: downloadLink.version.id },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.downloadLink.update({
        where: { id: downloadLink.id },
        data: { downloadedAt: new Date() },
      }),
    ]);

    // Redirect to the actual file
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "İndirme sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
