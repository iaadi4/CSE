import { PrismaClient } from "./generated/prisma/index.js";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || 
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;