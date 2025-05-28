import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@/generated/prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }
  return user;
}

export async function requireActiveOrganization() {
  const user = await requireAuth();
  if (!user.activeOrganization) {
    redirect("/dashboard/organizations");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireActiveOrganization();
  if (
    !user.activeOrganization ||
    !allowedRoles.includes(user.activeOrganization.role)
  ) {
    redirect("/unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

export async function requireEditorOrAdmin() {
  return requireRole([UserRole.ADMIN, UserRole.EDITOR]);
}

export function hasPermission(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN;
}

export function isEditor(userRole: UserRole): boolean {
  return userRole === UserRole.EDITOR;
}

export function isTester(userRole: UserRole): boolean {
  return userRole === UserRole.TESTER;
}

export function getCurrentRole(user: any): UserRole | null {
  return user.activeOrganization?.role || null;
}

export function hasOrganizationAccess(
  user: any,
  organizationId: string
): boolean {
  return user.organizations.some(
    (org: any) => org.organization.id === organizationId
  );
}
