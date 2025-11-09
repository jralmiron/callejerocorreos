import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../../lib/prismaClient";

export default async function handler(req, res) {
  // Verificar autenticación - puede ser por NextAuth o por header Authorization
  const session = await getServerSession(req, res, authOptions);
  
  // Si no hay sesión, verificar header de autorización
  if (!session) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Basic ')) {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
      
      // Validar credenciales (mismo usuario/contraseña del sistema)
      if (username !== 'c205798' || password !== 'Correos.007') {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
      // Credenciales válidas, continuar
    } else {
      return res.status(401).json({ error: "No autorizado" });
    }
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
