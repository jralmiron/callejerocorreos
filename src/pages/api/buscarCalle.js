import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

async function getCoordinates(nombreCalle, numero) {
  const query = `${nombreCalle} ${numero}, Vélez-Málaga, España`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return { latitud: parseFloat(data[0].lat), longitud: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error("Error obteniendo coordenadas:", error);
  }
  return { latitud: null, longitud: null };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, numero } = req.query;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre de la calle es obligatorio" });
  }

  try {
    const resultados = await prisma.callejero.findMany({
      where: {
        nombre_calle: {
          contains: nombre,
          mode: "insensitive", // Búsqueda sin distinción entre mayúsculas y minúsculas
        },
        AND: numero
          ? {
              numero_inicio: { lte: Number(numero) },
              numero_fin: { gte: Number(numero) },
            }
          : {},
      },
      select: {
        tipo_via: true,
        nombre_calle: true,
        numero_inicio: true,
        numero_fin: true,
        seccion: true,
      },
    });

    if (!resultados || resultados.length === 0) {
      return res.status(404).json({ error: "No se encontraron calles con esos criterios" });
    }

    // Buscar coordenadas para cada resultado
    const resultadosConCoordenadas = await Promise.all(
      resultados.map(async (item) => {
        const { latitud, longitud } = await getCoordinates(item.nombre_calle, numero);
        return { ...item, latitud, longitud };
      })
    );

    res.status(200).json(resultadosConCoordenadas);
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).json({ error: "Error en la consulta de la base de datos" });
  }
}
