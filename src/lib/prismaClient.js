import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Para depurar problemas
  });
}

export const prisma = globalForPrisma.prisma; // ✅ Exportamos como 'prisma'
