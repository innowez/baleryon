import prisma from "../lib/prisma.js";

async function connect() {
  await prisma.$connect();
  return prisma;
}

export default connect;
