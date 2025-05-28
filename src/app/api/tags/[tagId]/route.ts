import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import * as yup from "yup";

const updateTagSchema = yup.object({
  name: yup
    .string()
    .min(1, "Tag adı en az 1 karakter olmalı")
    .max(50, "Tag adı en fazla 50 karakter olabilir"),
  color: yup
    .string()
    .matches(/^#[0-9A-F]{6}$/i, "Geçerli bir hex renk kodu girin"),
});

// Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Only ADMIN and EDITOR can update tags
    if (user.role === "TESTER") {
      return NextResponse.json(
        { error: "Tag güncellemek için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Check if tag exists and belongs to organization
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        organizationId: user.organizationId,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag bulunamadı" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = await updateTagSchema.validate(body);

    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          name: validatedData.name,
          organizationId: user.organizationId,
          id: { not: tagId },
        },
      });

      if (duplicateTag) {
        return NextResponse.json(
          { error: "Bu isimde bir tag zaten mevcut" },
          { status: 400 }
        );
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: validatedData,
    });

    return NextResponse.json(updatedTag);
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Update tag error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

// Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Only ADMIN and EDITOR can delete tags
    if (user.role === "TESTER") {
      return NextResponse.json(
        { error: "Tag silmek için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Check if tag exists and belongs to organization
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        organizationId: user.organizationId,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag bulunamadı" }, { status: 404 });
    }

    // Delete tag (this will also delete related VersionTag records due to cascade)
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ message: "Tag başarıyla silindi" });
  } catch (error: any) {
    console.error("Delete tag error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
