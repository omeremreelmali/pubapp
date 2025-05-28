import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const currentRole = getCurrentRole(user);

    // Only ADMIN and EDITOR can list users
    if (currentRole === "TESTER") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    const organizationMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: user.activeOrganization.id,
      },
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
      orderBy: {
        joinedAt: "desc",
      },
    });

    const users = organizationMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      createdAt: member.user.createdAt,
      joinedAt: member.joinedAt,
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
