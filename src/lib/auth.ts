import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@/generated/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            organizationMemberships: {
              include: {
                organization: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Organizasyon üyeliklerini dönüştür
        const organizations = user.organizationMemberships.map(
          (membership) => ({
            id: membership.id,
            role: membership.role,
            organization: {
              id: membership.organization.id,
              name: membership.organization.name,
              slug: membership.organization.slug,
            },
          })
        );

        // İlk organizasyonu aktif olarak ayarla (varsa)
        const activeOrganization =
          organizations.length > 0
            ? {
                id: organizations[0].organization.id,
                name: organizations[0].organization.name,
                slug: organizations[0].organization.slug,
                role: organizations[0].role,
              }
            : null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizations,
          activeOrganizationId: activeOrganization?.id || null,
          activeOrganization,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.organizations = user.organizations;
        token.activeOrganizationId = user.activeOrganizationId;
        token.activeOrganization = user.activeOrganization;
      }

      // Session update trigger'ı geldiğinde token'ı güncelle
      if (trigger === "update" && session) {
        if (session.activeOrganizationId !== undefined) {
          token.activeOrganizationId = session.activeOrganizationId;
        }
        if (session.activeOrganization !== undefined) {
          token.activeOrganization = session.activeOrganization;
        }
        if (session.organizations !== undefined) {
          token.organizations = session.organizations;
        }
      }

      // Her session kontrolünde organizasyon listesini yenile
      if (token.sub && !user && trigger !== "update") {
        try {
          const userWithOrgs = await prisma.user.findUnique({
            where: { id: token.sub },
            include: {
              organizationMemberships: {
                include: {
                  organization: true,
                },
              },
            },
          });

          if (userWithOrgs) {
            const organizations = userWithOrgs.organizationMemberships.map(
              (membership) => ({
                id: membership.id,
                role: membership.role,
                organization: {
                  id: membership.organization.id,
                  name: membership.organization.name,
                  slug: membership.organization.slug,
                },
              })
            );

            token.organizations = organizations;

            // Eğer aktif organizasyon yoksa veya artık üye değilse, ilk organizasyonu aktif yap
            const currentActiveOrgExists = organizations.find(
              (org) => org.organization.id === token.activeOrganizationId
            );

            if (!currentActiveOrgExists && organizations.length > 0) {
              const newActiveOrg = organizations[0];
              token.activeOrganizationId = newActiveOrg.organization.id;
              token.activeOrganization = {
                id: newActiveOrg.organization.id,
                name: newActiveOrg.organization.name,
                slug: newActiveOrg.organization.slug,
                role: newActiveOrg.role,
              };
            } else if (organizations.length === 0) {
              token.activeOrganizationId = null;
              token.activeOrganization = null;
            }
          }
        } catch (error) {
          console.error("Error refreshing organizations in JWT:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.organizations = token.organizations || [];
        session.user.activeOrganizationId = token.activeOrganizationId;
        session.user.activeOrganization = token.activeOrganization;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
