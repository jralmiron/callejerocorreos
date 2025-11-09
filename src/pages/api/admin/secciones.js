import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prismaClient";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      // Obtener todas las secciones únicas con el conteo de calles
      const secciones = await prisma.callejero.groupBy({
        by: ['seccion'],
        _count: {
          seccion: true
        },
        orderBy: {
          seccion: 'asc'
        }
      });

      // Formatear la respuesta
      const seccionesFormateadas = secciones.map(s => ({
        seccion: s.seccion,
        _count: {
          calles: s._count.seccion
        }
      }));

      return res.status(200).json(seccionesFormateadas);
    } catch (error) {
      console.error("Error al obtener secciones:", error);
      return res.status(500).json({ error: "Error al obtener secciones" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
