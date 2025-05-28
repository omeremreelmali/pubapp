import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: "admin@test.com",
    },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists");
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash("admin123", 12);

  // Create default organization
  const defaultOrg = await prisma.organization.create({
    data: {
      name: "Default Organization",
      slug: "default-org",
    },
  });

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@test.com",
      name: "Admin User",
      password: hashedPassword,
    },
  });

  // Create organization membership
  await prisma.organizationMember.create({
    data: {
      userId: adminUser.id,
      organizationId: defaultOrg.id,
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user:", adminUser.email);
  console.log("✅ Created default organization:", defaultOrg.name);
  console.log("✅ Created admin membership");
  console.log("📧 Email: admin@test.com");
  console.log("🔑 Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
