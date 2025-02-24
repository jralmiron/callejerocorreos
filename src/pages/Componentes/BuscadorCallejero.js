import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Cargar react-leaflet dinámicamente para evitar problemas en SSR
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

// Componente para centrar el mapa dinámicamente
const ChangeMapView = ({ center, zoom }) => {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const BuscadorCallejero = () => {
  const [nombreCalle, setNombreCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ubicacionCentro, setUbicacionCentro] = useState([36.7810, -4.1026]); // Vélez-Málaga por defecto

  // Definir icono chincheta personalizado solo en el cliente
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
    setError("");
    try {
      const response = await fetch(
        `/api/buscarCalle?nombre=${nombreCalle}&numero=${numero}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          setError("Número no encontrado");
        } else {
          setError("Error en la búsqueda");
        }
        setResultados([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setResultados(data);
      if (data.length > 0 && data[0].latitud && data[0].longitud) {
        setUbicacionCentro([data[0].latitud, data[0].longitud]);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setError("Error en la búsqueda");
      setResultados([]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl p-4 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Buscador de Calles</h2>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Nombre de la calle"
          value={nombreCalle}
          onChange={(e) => setNombreCalle(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Número para afinar"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          disabled={loading}
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
          {Array.isArray(resultados) && resultados.map(
            (item, index) =>
              item.latitud &&
              item.longitud && (
                <Marker
                  key={index}
                  position={[item.latitud, item.longitud]}
                  icon={pushpinIcon}
                >
                  <Popup>{item.nombre_calle}</Popup>
                </Marker>
              )
          )}
        </MapContainer>
      </div>
      <div className="mt-4">
        {error ? (
          <span className="text-red-500">{error}</span>
        ) : (
          Array.isArray(resultados) && resultados.length > 0 ? (
            <ul className="space-y-2">
              {resultados.map((item, index) => (
                <li key={index} className="p-2 border rounded">
                  <strong>{item.tipo_via}</strong> {item.nombre_calle}, {item.numero_inicio}-{item.numero_fin} - Sección: {item.seccion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Resultado no encontrado</p>
          )
        )}
      </div>
    </div>
  );
};

export default BuscadorCallejero;
