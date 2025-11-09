import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Cargar componentes de react-leaflet dinámicamente (sin SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Importar ChangeMapView dinámicamente desde src/Componentes
const ChangeMapView = dynamic(
  () => import("../../components/ChangeMapView"),
  { ssr: false }
);

const BuscadorCallejero = () => {
  const [nombreCalle, setNombreCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ubicacionCentro, setUbicacionCentro] = useState([36.7810, -4.1026]); // Vélez-Málaga por defecto
  const [showModal, setShowModal] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nuevaCalle, setNuevaCalle] = useState({
    seccion: "",
    tipo_via: "",
    nombre_calle: "",
    numero_inicio: "",
    numero_fin: "",
    paridad: "A",
  });

  // Definir icono chincheta personalizado solo en cliente
  const pushpinIcon = useMemo(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      return L.icon({
        iconUrl: "/chincheta-icon.png", // Coloca la imagen en la carpeta public
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });
    }
    return null;
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(
        `/api/buscarCalle?nombre=${nombreCalle}&numero=${numero}`
      );
      const data = await response.json();
      
      // Verificar si hay error en la respuesta
      if (data.error) {
        console.error("Error del servidor:", data.error);
        setResultados([]);
        return;
      }
      
      // Asegurarse de que data es un array
      if (Array.isArray(data)) {
        setResultados(data);
        if (data.length > 0 && data[0].latitud && data[0].longitud) {
          setUbicacionCentro([data[0].latitud, data[0].longitud]);
        }
      } else {
        setResultados([]);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCalle = () => {
    setNuevaCalle({
      seccion: "",
      tipo_via: "",
      nombre_calle: nombreCalle,
      numero_inicio: numero || "",
      numero_fin: numero || "",
      paridad: "A",
    });
    setShowModal(true);
  };

  const handleSubmitNuevaCalle = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/calles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCalle),
      });

      if (response.ok) {
        alert("Calle agregada correctamente");
        setShowModal(false);
        handleSearch(); // Recargar búsqueda
      } else {
        alert("Error al agregar la calle. Verifica que hayas iniciado sesión como administrador.");
      }
    } catch (error) {
      console.error("Error al agregar calle:", error);
      alert("Error al agregar la calle");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNuevaCalle({
      seccion: "",
      tipo_via: "",
      nombre_calle: "",
      numero_inicio: "",
      numero_fin: "",
      paridad: "A",
    });
  };

  return (
    <div className="max-w-xl p-4 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Buscador de Calles</h2>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Nombre de la calle (ej: Málaga o Camino Viejo de Málaga)"
          value={nombreCalle}
          onChange={(e) => setNombreCalle(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Número (opcional)"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading || !nombreCalle.trim()}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>
      <div className="w-full h-64 mt-4">
        <MapContainer center={ubicacionCentro} zoom={15} className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ChangeMapView center={ubicacionCentro} zoom={15} />
          {resultados.map((item, index) =>
            item.latitud && item.longitud ? (
              <Marker
                key={index}
                position={[item.latitud, item.longitud]}
                icon={pushpinIcon}
              >
                <Popup>{item.nombre_calle}</Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
      <div className="mt-4">
        {resultados.length > 0 ? (
          <>
            <p className="mb-2 text-sm text-gray-600">
              Se encontraron {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </p>
            <ul className="space-y-2">
              {resultados.map((item, index) => (
                <li key={index} className="p-2 border rounded">
                  <strong>{item.tipo_via}</strong> {item.nombre_calle},{" "}
                  {item.numero_inicio}-{item.numero_fin} - Sección: {item.seccion}
                  {item.paridad && (
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                      item.paridad === 'I' ? 'bg-blue-100 text-blue-800' :
                      item.paridad === 'P' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.paridad === 'I' ? 'Impares' : item.paridad === 'P' ? 'Pares' : 'Ambos'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : searched && nombreCalle.trim() ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="mb-3 text-gray-700">
              No se encontraron resultados para "{nombreCalle}"
            </p>
            <button
              onClick={handleAgregarCalle}
              className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              + Agregar Nueva Calle
            </button>
          </div>
        ) : (
          <p className="text-gray-500">
            Ingresa el nombre de una calle para buscar
          </p>
        )}
      </div>

      {/* Modal para agregar nueva calle */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              Agregar Nueva Calle
            </h2>
            <form onSubmit={handleSubmitNuevaCalle} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Sección *
                </label>
                <input
                  type="number"
                  value={nuevaCalle.seccion}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, seccion: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Tipo de Vía *
                </label>
                <select
                  value={nuevaCalle.tipo_via}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, tipo_via: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="CALLE">Calle</option>
                  <option value="AVENIDA">Avenida</option>
                  <option value="PLAZA">Plaza</option>
                  <option value="PASEO">Paseo</option>
                  <option value="CAMINO">Camino</option>
                  <option value="PASAJE">Pasaje</option>
                  <option value="URB">Urbanización</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Nombre de la Calle *
                </label>
                <input
                  type="text"
                  value={nuevaCalle.nombre_calle}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, nombre_calle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Número Inicio *
                  </label>
                  <input
                    type="number"
                    value={nuevaCalle.numero_inicio}
                    onChange={(e) =>
                      setNuevaCalle({
                        ...nuevaCalle,
                        numero_inicio: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Número Fin *
                  </label>
                  <input
                    type="number"
                    value={nuevaCalle.numero_fin}
                    onChange={(e) =>
                      setNuevaCalle({
                        ...nuevaCalle,
                        numero_fin: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Paridad *
                </label>
                <select
                  value={nuevaCalle.paridad}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, paridad: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="I">Impares (I)</option>
                  <option value="P">Pares (P)</option>
                  <option value="A">Ambos/Todos (A)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Agregar Calle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscadorCallejero;
