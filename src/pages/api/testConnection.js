import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Realiza una consulta de prueba
    const users = await prisma.user.findMany(); // Cambia "user" si tienes otra tabla

    res.status(200).json({ message: 'Conexión exitosa', data: users });
  } catch (error) {
    console.error('Error en la conexión con la base de datos:', error);
    res.status(500).json({ error: 'No se pudo conectar a la base de datos', details: error.message });
  } finally {
    await prisma.$disconnect(); // Cierra la conexión después de la consulta
  }
}
