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
      const calles = await prisma.callejero.findMany({
        orderBy: [
          { seccion: "asc" },
          { nombre_calle: "asc" }
        ]
      });
      return res.status(200).json(calles);
    } catch (error) {
      console.error("Error al obtener calles:", error);
      return res.status(500).json({ error: "Error al obtener calles" });
    }
  }

  if (req.method === "POST") {
    try {
      const { seccion, tipo_via, nombre_calle, numero_inicio, numero_fin, paridad } = req.body;

      const nuevaCalle = await prisma.callejero.create({
        data: {
          seccion,
          tipo_via,
          nombre_calle,
          numero_inicio,
          numero_fin,
          paridad: paridad || "A",
        },
      });

      return res.status(201).json(nuevaCalle);
    } catch (error) {
      console.error("Error al crear calle:", error);
      return res.status(500).json({ error: "Error al crear calle" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
