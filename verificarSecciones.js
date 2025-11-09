const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarSecciones() {
  try {
    console.log('Consultando secciones en la base de datos...\n');
    
    // Obtener todas las secciones únicas
    const secciones = await prisma.callejero.groupBy({
      by: ['seccion'],
      _count: {
        seccion: true
      },
      orderBy: {
        seccion: 'asc'
      }
    });

    console.log('SECCIONES ENCONTRADAS:');
    console.log('======================');
    secciones.forEach(s => {
      console.log(`Sección ${s.seccion}: ${s._count.seccion} registros`);
    });
    
    console.log(`\nTotal de secciones: ${secciones.length}`);
    
    // Total de registros
    const total = await prisma.callejero.count();
    console.log(`Total de registros en callejero: ${total}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSecciones();
