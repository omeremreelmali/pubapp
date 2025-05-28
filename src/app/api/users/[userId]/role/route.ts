import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentRole } from "@/lib/auth-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = await requireAuth();

    if (!user.activeOrganization) {
      return NextResponse.json(
        { error: "Aktif organizasyon bulunamadı" },
        { status: 400 }
      );
    }

    const currentRole = getCurrentRole(user);

    // Only ADMIN can change roles
    if (currentRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    if (!role || !["ADMIN", "EDITOR", "TESTER"].includes(role)) {
      return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
    }

    // Check if the user is a member of the current organization
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId: user.activeOrganization.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Kullanıcı bu organizasyonda bulunamadı" },
        { status: 404 }
      );
    }

    // Update the user's role in the organization
    await prisma.organizationMember.update({
      where: {
        id: member.id,
      },
      data: {
        role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update user role error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
