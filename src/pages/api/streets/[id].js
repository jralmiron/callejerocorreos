import { prisma } from '@/lib/prismaClient'; // ✅ Importamos correctamente

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const callejero = await prisma.callejero.findUnique({
      where: { id: parseInt(id) },
    });

    if (!callejero) {
      return res.status(404).json({ error: 'Callejero no encontrado' });
    }

    res.status(200).json(callejero);
  } catch (error) {
    console.error('Error fetching street:', error);
    res.status(500).json({ error: 'Error al obtener los datos', details: error.message });
  }
}
