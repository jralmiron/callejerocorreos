import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}

export const prisma = globalForPrisma.prisma;
export default prisma;