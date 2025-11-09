import prisma from "../../lib/prismaClient";



async function getCoordinates(tipoVia, nombreCalle, numero) {
  // Si se proporciona un número, buscarlo específicamente
  const direccionCompleta = numero && numero.trim() !== '' 
    ? `${tipoVia} ${nombreCalle} ${numero}, Vélez-Málaga, España`
    : `${tipoVia} ${nombreCalle}, Vélez-Málaga, España`;
    
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`;
  
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
    // Tipos de vía comunes
    const tiposVia = ['CALLE', 'AVENIDA', 'PLAZA', 'PASEO', 'CAMINO', 'PASAJE', 'URB', 'URBANIZACION'];
    
    let tipoViaEncontrado = null;
    let nombreSinTipo = nombre.trim();
    
    // Buscar si el texto incluye un tipo de vía al principio
    const nombreUpper = nombre.trim().toUpperCase();
    for (const tipo of tiposVia) {
      if (nombreUpper.startsWith(tipo + ' ')) {
        tipoViaEncontrado = tipo;
        nombreSinTipo = nombre.trim().substring(tipo.length).trim();
        break;
      }
    }

    // Construir el filtro dinámicamente
    const whereClause = {
      nombre_calle: {
        contains: nombreSinTipo,
        mode: "insensitive", // Búsqueda sin distinción entre mayúsculas y minúsculas
      }
    };

    // Si se detectó un tipo de vía específico, filtrar por él
    if (tipoViaEncontrado) {
      whereClause.tipo_via = {
        equals: tipoViaEncontrado,
        mode: "insensitive"
      };
    }

    // Solo agregar filtro de número si se proporciona
    if (numero && numero.trim() !== '') {
      const numeroInt = Number(numero);
      whereClause.numero_inicio = { lte: numeroInt };
      whereClause.numero_fin = { gte: numeroInt };
      
      // Filtrar por paridad según si el número es par o impar
      const esPar = numeroInt % 2 === 0;
      whereClause.OR = [
        { paridad: "A" }, // Ambos siempre se muestra
        { paridad: esPar ? "P" : "I" } // P si es par, I si es impar
      ];
    }

    const resultados = await prisma.callejero.findMany({
      where: whereClause,
      select: {
        id: true,
        tipo_via: true,
        nombre_calle: true,
        numero_inicio: true,
        numero_fin: true,
        seccion: true,
        paridad: true,
      },
    });

    if (!resultados || resultados.length === 0) {
      // Devolver array vacío en lugar de error 404 para que el frontend pueda manejarlo
      return res.status(200).json([]);
    }

    // Buscar coordenadas para cada resultado
    const resultadosConCoordenadas = await Promise.all(
      resultados.map(async (item) => {
        // Si hay número específico, buscar esa dirección exacta
        // Si no hay número, usar el punto medio del rango de la calle
        const numeroParaBuscar = numero && numero.trim() !== '' 
          ? numero 
          : Math.floor((item.numero_inicio + item.numero_fin) / 2).toString();
        
        const { latitud, longitud } = await getCoordinates(
          item.tipo_via || 'CALLE', 
          item.nombre_calle, 
          numeroParaBuscar
        );
        return { ...item, latitud, longitud };
      })
    );

    res.status(200).json(resultadosConCoordenadas);
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).json({ error: "Error en la consulta de la base de datos" });
  }
}
