import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import * as yup from "yup";

const updateVersionTagsSchema = yup.object({
  tagIds: yup.array().of(yup.string().required()).required("Tag IDs gerekli"),
});

// Update version tags
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  try {
    const { slug, versionId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    // Get app by slug
    const app = await prisma.app.findFirst({
      where: {
        slug,
        organizationId: user.activeOrganization.id,
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

    const body = await request.json();
    const validatedData = await updateVersionTagsSchema.validate(body);

    // Validate that all tag IDs belong to the organization
    if (validatedData.tagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: {
          id: { in: validatedData.tagIds },
          organizationId: user.activeOrganization.id,
        },
      });

      if (validTags.length !== validatedData.tagIds.length) {
        return NextResponse.json(
          { error: "Geçersiz tag ID'leri" },
          { status: 400 }
        );
      }
    }

    // Remove existing tags and add new ones
    await prisma.$transaction(async (tx) => {
      // Delete existing version tags
      await tx.versionTag.deleteMany({
        where: { versionId },
      });

      // Create new version tags
      if (validatedData.tagIds.length > 0) {
        await tx.versionTag.createMany({
          data: validatedData.tagIds.map((tagId) => ({
            versionId,
            tagId,
          })),
        });
      }
    });

    // Get updated version with tags
    const updatedVersion = await prisma.appVersion.findUnique({
      where: { id: versionId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Versiyon tag'leri başarıyla güncellendi",
      version: updatedVersion,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Update version tags error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
