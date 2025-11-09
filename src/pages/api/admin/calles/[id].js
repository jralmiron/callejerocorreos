import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prismaClient";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { id } = req.query;
  const calleId = parseInt(id);

  if (req.method === "PUT") {
    try {
      const { seccion, tipo_via, nombre_calle, numero_inicio, numero_fin, paridad } = req.body;

      const calleActualizada = await prisma.callejero.update({
        where: { id: calleId },
        data: {
          seccion,
          tipo_via,
          nombre_calle,
          numero_inicio,
          numero_fin,
          paridad: paridad || "A",
        },
      });

      return res.status(200).json(calleActualizada);
    } catch (error) {
      console.error("Error al actualizar calle:", error);
      return res.status(500).json({ error: "Error al actualizar calle" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.callejero.delete({
        where: { id: calleId },
      });

      return res.status(200).json({ message: "Calle eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar calle:", error);
      return res.status(500).json({ error: "Error al eliminar calle" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
