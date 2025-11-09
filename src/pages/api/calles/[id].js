import prisma from "../../../lib/prismaClient";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    // Validar que el ID existe
    if (!id) {
      return res.status(400).json({ error: "ID no proporcionado" });
    }

    try {
      const calleId = parseInt(id);
      
      if (isNaN(calleId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const calle = await prisma.callejero.findUnique({
        where: { id: calleId }
      });

      if (!calle) {
        return res.status(404).json({ error: "Calle no encontrada" });
      }

      return res.status(200).json(calle);
    } catch (error) {
      console.error("Error al obtener calle:", error);
      return res.status(500).json({ error: "Error al obtener calle" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
