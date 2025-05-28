import { PrismaClient, UserRole } from "@/generated/prisma";

const prisma = new PrismaClient();

async function migrateUsers() {
  console.log("Migrating users to new organization system...");

  try {
    // Tüm organizasyonları al
    const organizations = await prisma.organization.findMany();

    console.log(`Found ${organizations.length} organizations`);

    for (const org of organizations) {
      console.log(`Processing organization: ${org.name}`);

      // Bu organizasyonda zaten üye olan kullanıcıları kontrol et
      const existingMembers = await prisma.organizationMember.findMany({
        where: { organizationId: org.id },
      });

      console.log(
        `Organization ${org.name} has ${existingMembers.length} existing members`
      );

      // Eğer hiç üye yoksa, organizasyonu oluşturan kişiyi ADMIN olarak ekle
      if (existingMembers.length === 0) {
        // İlk kullanıcıyı ADMIN olarak ekle (genellikle organizasyonu oluşturan)
        const firstUser = await prisma.user.findFirst({
          orderBy: { createdAt: "asc" },
        });

        if (firstUser) {
          await prisma.organizationMember.create({
            data: {
              userId: firstUser.id,
              organizationId: org.id,
              role: UserRole.ADMIN,
            },
          });
          console.log(`Added ${firstUser.email} as ADMIN to ${org.name}`);
        }
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();
