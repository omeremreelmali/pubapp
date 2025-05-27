import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/auth-utils";
import { addMemberSchema } from "@/lib/validations/group";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = await addMemberSchema.validate(body);

    // Check if group exists and belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.organizationId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    // Check if user exists and belongs to same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: validatedData.userId,
        organizationId: user.organizationId,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: validatedData.userId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Kullanıcı zaten bu grubun üyesi" },
        { status: 400 }
      );
    }

    // Add user to group
    const groupMember = await prisma.groupMember.create({
      data: {
        groupId,
        userId: validatedData.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Kullanıcı gruba başarıyla eklendi",
      member: groupMember,
    });
  } catch (error: any) {
    console.error("Add group member error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const user = await requireEditorOrAdmin();

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "Kullanıcı herhangi bir organizasyona üye değil" },
        { status: 400 }
      );
    }

    // Check if group exists and belongs to organization
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.organizationId,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("Get group members error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
