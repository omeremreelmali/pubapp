import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { organizationCreateSchema } from "@/lib/validations/auth";
import { UserRole } from "@/generated/prisma";

// Varsayılan tag'leri oluşturan fonksiyon
async function createDefaultTags(organizationId: string) {
  const defaultTags = [
    { name: "Development", color: "#EF4444" },
    { name: "Testing", color: "#F59E0B" },
    { name: "Staging", color: "#8B5CF6" },
    { name: "Production", color: "#10B981" },
    { name: "Beta", color: "#3B82F6" },
    { name: "Alpha", color: "#EC4899" },
  ];

  await prisma.tag.createMany({
    data: defaultTags.map((tag) => ({
      ...tag,
      organizationId,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validation
    const validatedData = await organizationCreateSchema.validate(body);

    // Slug oluştur
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Slug'ın benzersiz olduğunu kontrol et
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Bu isimde bir organizasyon zaten mevcut" },
        { status: 400 }
      );
    }

    // Organizasyon ve üyelik oluştur
    const result = await prisma.$transaction(async (tx) => {
      // Organizasyon oluştur
      const organization = await tx.organization.create({
        data: {
          name: validatedData.name,
          slug,
          description: validatedData.description,
        },
      });

      // Kullanıcıyı organizasyona ADMIN olarak ekle
      const membership = await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: UserRole.ADMIN,
        },
      });

      return { organization, membership };
    });

    // Varsayılan tag'leri oluştur
    try {
      await createDefaultTags(result.organization.id);
    } catch (tagError) {
      console.error("Default tags creation failed:", tagError);
      // Tag oluşturma hatası organizasyon oluşturmayı engellemez
    }

    return NextResponse.json({
      message: "Organizasyon başarıyla oluşturuldu",
      organization: result.organization,
      membershipId: result.membership.id,
    });
  } catch (error: any) {
    console.error("Organization creation error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.activeOrganization.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
              },
            },
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
