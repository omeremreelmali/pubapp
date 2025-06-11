import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find download link by token with all related data
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!downloadLink) {
      return NextResponse.json({
        found: false,
        error: "Token bulunamadı",
      });
    }

    const now = new Date();
    const isExpired = downloadLink.expiresAt < now;

    return NextResponse.json({
      found: true,
      token: downloadLink.token,
      isExpired,
      expiresAt: downloadLink.expiresAt,
      downloadedAt: downloadLink.downloadedAt,
      version: {
        id: downloadLink.version.id,
        version: downloadLink.version.version,
        fileName: downloadLink.version.fileName,
      },
      app: downloadLink.version.app,
      createdBy: downloadLink.createdBy,
      environment: {
        MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
        MINIO_PORT: process.env.MINIO_PORT,
        MINIO_USE_SSL: process.env.MINIO_USE_SSL,
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      },
    });
  } catch (error: any) {
    console.error("Debug download error:", error);
    return NextResponse.json({
      found: false,
      error: error.message,
      stack: error.stack,
    });
  }
} 