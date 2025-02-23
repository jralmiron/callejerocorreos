import prisma from '@/lib/prismaClient';

export default async function handler(req, res) {
  const { nombre_calle, seccion } = req.query;

  try {
    if (nombre_calle && seccion) {
      return res.status(400).json({ error: "Por favor, proporciona solo un parámetro: 'nombre_calle' o 'seccion', pero no ambos." });
    }

    let resultado;

    // Buscar por nombre de calle y devolver la sección
    if (nombre_calle) {
      resultado = await prisma.callejero.findFirst({
        where: { nombre_calle: nombre_calle },
        select: { seccion: true, nombre_calle: true },
      });

      if (!resultado) {
        return res.status(404).json({ error: `No se encontró la calle '${nombre_calle}'` });
      }
    }

    // Buscar por sección y devolver todas las calles
    else if (seccion) {
      resultado = await prisma.callejero.findMany({
        where: { seccion: parseInt(seccion) },
        select: { nombre_calle: true, seccion: true },
      });

      if (resultado.length === 0) {
        return res.status(404).json({ error: `No hay calles registradas en la sección '${seccion}'` });
      }
    }

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al buscar:", error);
    res.status(500).json({ error: "Error al obtener los datos", details: error.message });
  }
}
