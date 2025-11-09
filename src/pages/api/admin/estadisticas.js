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
      // Total de calles
      const totalCalles = await prisma.callejero.count();

      // Total de secciones únicas
      const secciones = await prisma.callejero.groupBy({
        by: ['seccion'],
        _count: { seccion: true }
      });
      const totalSecciones = secciones.length;

      // Calles únicas (agrupadas por tipo_via + nombre_calle)
      const callesUnicasResult = await prisma.callejero.groupBy({
        by: ['tipo_via', 'nombre_calle'],
        _count: { id: true }
      });
      const callesUnicas = callesUnicasResult.length;

      // Tipos de vía únicos
      const tiposViaResult = await prisma.callejero.groupBy({
        by: ['tipo_via'],
        _count: { tipo_via: true }
      });
      const tiposVia = tiposViaResult.length;

      // Distribución por sección
      const porSeccion = await prisma.callejero.groupBy({
        by: ['seccion'],
        _count: { seccion: true },
        orderBy: { seccion: 'asc' }
      });

      const porSeccionFormateado = porSeccion.map(s => ({
        seccion: s.seccion,
        count: s._count.seccion
      }));

      // Distribución por tipo de vía
      const porTipoVia = await prisma.callejero.groupBy({
        by: ['tipo_via'],
        _count: { tipo_via: true },
        orderBy: { _count: { tipo_via: 'desc' } }
      });

      const porTipoViaFormateado = porTipoVia.map(t => ({
        tipo_via: t.tipo_via,
        count: t._count.tipo_via
      }));

      // Distribución por paridad
      const porParidad = await prisma.callejero.groupBy({
        by: ['paridad'],
        _count: { paridad: true },
        orderBy: { paridad: 'asc' }
      });

      const porParidadFormateado = porParidad.map(p => ({
        paridad: p.paridad,
        count: p._count.paridad
      }));

      // Respuesta consolidada
      const estadisticas = {
        totalCalles,
        totalSecciones,
        callesUnicas,
        tiposVia,
        porSeccion: porSeccionFormateado,
        porTipoVia: porTipoViaFormateado,
        porParidad: porParidadFormateado
      };

      return res.status(200).json(estadisticas);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
