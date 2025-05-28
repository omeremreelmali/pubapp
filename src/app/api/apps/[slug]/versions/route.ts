import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { createVersionSchema } from "@/lib/validations/app";
import { uploadFile, initializeBucket } from "@/lib/minio";
import { generateFileName, validateFile } from "@/lib/file-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await requireEditorOrAdmin();

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const version = formData.get("version") as string;
    const buildNumber = formData.get("buildNumber") as string;
    const releaseNotes = formData.get("releaseNotes") as string;
    const tagIds = formData.get("tagIds") as string; // JSON string of tag IDs

    if (!file) {
      return NextResponse.json({ error: "Dosya gereklidir" }, { status: 400 });
    }

    // Validate form data
    const validatedData = await createVersionSchema.validate({
      version,
      buildNumber: parseInt(buildNumber),
      releaseNotes,
    });

    // Parse and validate tag IDs
    let parsedTagIds: string[] = [];
    if (tagIds) {
      try {
        parsedTagIds = JSON.parse(tagIds);
        if (!Array.isArray(parsedTagIds)) {
          return NextResponse.json(
            { error: "Tag IDs geçerli bir array olmalı" },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Tag IDs geçerli JSON formatında olmalı" },
          { status: 400 }
        );
      }
    }

    // Validate that all tag IDs belong to the organization
    if (parsedTagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: {
          id: { in: parsedTagIds },
          organizationId: user.organizationId,
        },
      });

      if (validTags.length !== parsedTagIds.length) {
        return NextResponse.json(
          { error: "Geçersiz tag ID'leri" },
          { status: 400 }
        );
      }
    }

    // Validate file
    const fileValidation = validateFile(
      file,
      app.platform as "ANDROID" | "IOS"
    );
    if (!fileValidation.isValid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // Check if version already exists
    const existingVersion = await prisma.appVersion.findFirst({
      where: {
        appId: app.id,
        version: validatedData.version,
      },
    });

    if (existingVersion) {
      return NextResponse.json(
        { error: "Bu versiyon numarası zaten mevcut" },
        { status: 400 }
      );
    }

    // Check if build number already exists
    const existingBuild = await prisma.appVersion.findFirst({
      where: {
        appId: app.id,
        buildNumber: validatedData.buildNumber,
      },
    });

    if (existingBuild) {
      return NextResponse.json(
        { error: "Bu build numarası zaten mevcut" },
        { status: 400 }
      );
    }

    // Initialize MinIO bucket
    await initializeBucket();

    // Generate file name
    const fileName = generateFileName(file.name, app.id, validatedData.version);

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload file to MinIO
    await uploadFile(fileName, fileBuffer, file.type);

    // Create version record with tags
    const appVersion = await prisma.appVersion.create({
      data: {
        version: validatedData.version,
        buildNumber: validatedData.buildNumber,
        releaseNotes: validatedData.releaseNotes,
        fileName,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        appId: app.id,
        uploadedById: user.id,
        tags: {
          create: parsedTagIds.map((tagId) => ({
            tagId,
          })),
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        app: {
          select: {
            id: true,
            name: true,
            slug: true,
            platform: true,
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
      message: "Versiyon başarıyla yüklendi",
      version: appVersion,
    });
  } catch (error: any) {
    console.error("Create version error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await requireEditorOrAdmin();
    const { searchParams } = new URL(request.url);
    const tagFilter = searchParams.get("tags"); // Comma-separated tag IDs

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

    // Build where clause for tag filtering
    let whereClause: any = { appId: app.id };

    if (tagFilter) {
      const tagIds = tagFilter.split(",").filter(Boolean);
      if (tagIds.length > 0) {
        whereClause.tags = {
          some: {
            tagId: { in: tagIds },
          },
        };
      }
    }

    // Get versions with tags
    const versions = await prisma.appVersion.findMany({
      where: whereClause,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ versions });
  } catch (error: any) {
    console.error("Get versions error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
