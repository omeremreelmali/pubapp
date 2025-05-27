import { UserRole } from "@/generated/prisma";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      organizationId: string | null;
      organization: {
        id: string;
        name: string;
        slug: string;
      } | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    organizationId: string | null;
    organization: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
    organizationId: string | null;
    organization: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }
}
