// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const ownerPassword = await bcrypt.hash("Owner@123", 10);
  const userPassword = await bcrypt.hash("User@123", 10);

  // Create Admin
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@example.com",
      password: adminPassword,
      address: "Admin HQ, City",
      role: "ADMIN"
    }
  });

  // Create Owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Store Owner",
      email: "owner@example.com",
      password: ownerPassword,
      address: "123 Owner Street, City",
      role: "OWNER"
    }
  });

  // Create Store for Owner
  await prisma.store.upsert({
    where: { email: "store@example.com" },
    update: {},
    create: {
      name: "Tech World",
      email: "store@example.com",
      address: "45 Market Street, City",
      ownerId: owner.id
    }
  });

  // Create Normal User
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "user@example.com",
      password: userPassword,
      address: "456 User Lane, City",
      role: "USER"
    }
  });
}

main()
  .then(() => {
    console.log("✅ Database seeding completed!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });