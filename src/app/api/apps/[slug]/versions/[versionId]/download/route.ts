import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  try {
    const { slug, versionId } = await params;
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Get app by slug
    const app = await prisma.app.findFirst({
      where: {
        slug,
        organizationId: user.organizationId,
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: "Uygulama bulunamadı" },
        { status: 404 }
      );
    }

    // Get version
    const version = await prisma.appVersion.findFirst({
      where: {
        id: versionId,
        appId: app.id,
      },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Versiyon bulunamadı" },
        { status: 404 }
      );
    }

    // For TESTER role, check if they have access through groups
    if (user.role === "TESTER") {
      const hasAccess = await prisma.groupMember.findFirst({
        where: {
          userId: user.id,
          group: {
            appAccess: {
              some: {
                appId: app.id,
              },
            },
          },
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Bu uygulamaya erişim yetkiniz yok" },
          { status: 403 }
        );
      }
    }

    // Create download link (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const downloadLink = await prisma.downloadLink.create({
      data: {
        versionId: version.id,
        expiresAt,
      },
    });

    const downloadUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/api/download/${downloadLink.token}`;

    return NextResponse.json({
      downloadUrl,
      expiresAt,
      token: downloadLink.token,
    });
  } catch (error: any) {
    console.error("Create download link error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
