import { UserRole } from "@/generated/prisma";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

interface OrganizationMembership {
  id: string;
  role: UserRole;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizations: OrganizationMembership[];
      activeOrganizationId: string | null;
      activeOrganization: {
        id: string;
        name: string;
        slug: string;
        role: UserRole;
      } | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    organizations: OrganizationMembership[];
    activeOrganizationId: string | null;
    activeOrganization: {
      id: string;
      name: string;
      slug: string;
      role: UserRole;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    organizations: OrganizationMembership[];
    activeOrganizationId: string | null;
    activeOrganization: {
      id: string;
      name: string;
      slug: string;
      role: UserRole;
    } | null;
  }
}
