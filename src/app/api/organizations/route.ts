import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { organizationCreateSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validatedData = await organizationCreateSchema.validate(body);

    // Create slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Bu isimde bir organizasyon zaten mevcut" },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
      },
    });

    // Update user to be part of this organization
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });

    return NextResponse.json({
      message: "Organizasyon başarıyla oluşturuldu",
      organization,
    });
  } catch (error: any) {
    console.error("Create organization error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            apps: true,
            groups: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organizasyon bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error("Get organization error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
