import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentRole } from "@/lib/auth-utils";
import * as yup from "yup";

const createTagSchema = yup.object({
  name: yup
    .string()
    .required("Tag adı gerekli")
    .min(1, "Tag adı en az 1 karakter olmalı")
    .max(50, "Tag adı en fazla 50 karakter olabilir"),
  color: yup
    .string()
    .matches(/^#[0-9A-F]{6}$/i, "Geçerli bir hex renk kodu girin")
    .default("#3B82F6"),
});

// Get all tags for organization
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const tags = await prisma.tag.findMany({
      where: {
        organizationId: user.activeOrganization.id,
      },
      include: {
        _count: {
          select: {
            versionTags: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("Get tags error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

// Create new tag
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const currentRole = getCurrentRole(user);

    // Only ADMIN and EDITOR can create tags
    if (currentRole === "TESTER") {
      return NextResponse.json(
        { error: "Tag oluşturmak için yetkiniz yok" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = await createTagSchema.validate(body);

    // Check if tag name already exists in organization
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: validatedData.name,
        organizationId: user.activeOrganization.id,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Bu isimde bir tag zaten mevcut" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
        organizationId: user.activeOrganization.id,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Create tag error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
