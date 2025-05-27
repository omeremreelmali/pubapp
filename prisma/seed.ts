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

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@test.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user:", adminUser.email);
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
