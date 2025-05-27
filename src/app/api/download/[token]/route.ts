import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDownloadUrl } from "@/lib/minio";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Find download link by token
    const downloadLink = await prisma.downloadLink.findUnique({
      where: { token: params.token },
      include: {
        version: {
          include: {
            app: {
              select: {
                id: true,
                name: true,
                platform: true,
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
