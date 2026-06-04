import { PrismaClient } from "@prisma/client";
import { INITIAL_CATEGORIES, INITIAL_ROLES } from "../models/enums.js";

const prisma = new PrismaClient();

async function main() {
  for (const roleName of INITIAL_ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  for (const { name, slug } of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  console.log("Seeded roles and categories.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
