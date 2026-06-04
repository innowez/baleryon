/**
 * Baleryon model layer — use Prisma client for all DB access.
 *
 * Schema definition: backend/prisma/schema.prisma
 * Client singleton:   backend/lib/prisma.js
 *
 * Usage:
 *   import prisma from "../lib/prisma.js";
 *   const users = await prisma.user.findMany();
 */
export { default as prisma } from "../lib/prisma.js";

export * from "./enums.js";
