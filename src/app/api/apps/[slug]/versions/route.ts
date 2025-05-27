import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { createVersionSchema } from "@/lib/validations/app";
import { uploadFile, initializeBucket } from "@/lib/minio";
import { generateFileName, validateFile } from "@/lib/file-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
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
        slug: params.slug,
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

    if (!file) {
      return NextResponse.json({ error: "Dosya gereklidir" }, { status: 400 });
    }

    // Validate form data
    const validatedData = await createVersionSchema.validate({
      version,
      buildNumber: parseInt(buildNumber),
      releaseNotes,
    });

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

    // Create version record
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
  { params }: { params: { slug: string } }
) {
  try {
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
        slug: params.slug,
        organizationId: user.organizationId,
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: "Uygulama bulunamadı" },
        { status: 404 }
      );
    }

    // Get versions
    const versions = await prisma.appVersion.findMany({
      where: { appId: app.id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
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
