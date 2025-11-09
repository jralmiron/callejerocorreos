const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importarDatos() {
  try {
    console.log('📥 Leyendo archivo SQL...');
    const sql = fs.readFileSync('callejero.sql', 'utf-8');
    
    // Extraer solo las líneas INSERT
    const insertLines = sql.split('\n').filter(line => line.trim().startsWith('INSERT INTO'));
    
    console.log(`📊 Se encontraron ${insertLines.length} registros para importar`);
    
    let imported = 0;
    
    for (const line of insertLines) {
      // Extraer valores del INSERT
      const match = line.match(/VALUES \((\d+), '([^']+)', '([^']+)', (\d+), (\d+)\)/);
      if (match) {
        const [, seccion, tipo_via, nombre_calle, numero_inicio, numero_fin] = match;
        
        await prisma.callejero.create({
          data: {
            seccion: parseInt(seccion),
            tipo_via,
            nombre_calle,
            numero_inicio: parseInt(numero_inicio),
            numero_fin: parseInt(numero_fin)
          }
        });
        
        imported++;
        if (imported % 50 === 0) {
          console.log(`   ✓ Importados ${imported}/${insertLines.length} registros...`);
        }
      }
    }
    
    console.log(`✅ Importación completada: ${imported} registros insertados`);
    
    // Verificar
    const total = await prisma.callejero.count();
    console.log(`📊 Total de registros en la base de datos: ${total}`);
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importarDatos();
