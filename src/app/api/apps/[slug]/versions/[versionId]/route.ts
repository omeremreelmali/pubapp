import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { updateVersionSchema } from "@/lib/validations/app";

// Update version
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
    const existingVersion = await prisma.appVersion.findFirst({
      where: {
        id: versionId,
        appId: app.id,
      },
    });

    if (!existingVersion) {
      return NextResponse.json(
        { error: "Versiyon bulunamadı" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = await updateVersionSchema.validate(body);

    // Check for version conflicts if version is being updated
    if (
      validatedData.version &&
      validatedData.version !== existingVersion.version
    ) {
      const versionConflict = await prisma.appVersion.findFirst({
        where: {
          appId: app.id,
          version: validatedData.version,
          id: { not: versionId },
        },
      });

      if (versionConflict) {
        return NextResponse.json(
          { error: "Bu versiyon numarası zaten mevcut" },
          { status: 400 }
        );
      }
    }

    // Check for build number conflicts if build number is being updated
    if (
      validatedData.buildNumber &&
      validatedData.buildNumber !== existingVersion.buildNumber
    ) {
      const buildConflict = await prisma.appVersion.findFirst({
        where: {
          appId: app.id,
          buildNumber: validatedData.buildNumber,
          id: { not: versionId },
        },
      });

      if (buildConflict) {
        return NextResponse.json(
          { error: "Bu build numarası zaten mevcut" },
          { status: 400 }
        );
      }
    }

    // Validate tag IDs if provided
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
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

    // Update version in transaction
    const updatedVersion = await prisma.$transaction(async (tx) => {
      // Update version basic info
      const updated = await tx.appVersion.update({
        where: { id: versionId },
        data: {
          version: validatedData.version,
          buildNumber: validatedData.buildNumber,
          releaseNotes: validatedData.releaseNotes,
        },
      });

      // Update tags if provided
      if (validatedData.tagIds !== undefined) {
        // Delete existing tags
        await tx.versionTag.deleteMany({
          where: { versionId },
        });

        // Create new tags
        if (validatedData.tagIds.length > 0) {
          await tx.versionTag.createMany({
            data: validatedData.tagIds.map((tagId) => ({
              versionId,
              tagId,
            })),
          });
        }
      }

      return updated;
    });

    // Get updated version with tags
    const versionWithTags = await prisma.appVersion.findUnique({
      where: { id: versionId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Versiyon başarıyla güncellendi",
      version: versionWithTags,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Update version error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

// Delete version
export async function DELETE(
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

    // Delete version (this will also delete related VersionTag records due to cascade)
    await prisma.appVersion.delete({
      where: { id: versionId },
    });

    return NextResponse.json({ message: "Versiyon başarıyla silindi" });
  } catch (error: any) {
    console.error("Delete version error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
