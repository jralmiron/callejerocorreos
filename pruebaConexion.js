const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    const resultado = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Conexión correcta:', resultado);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
