import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
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
  const router = useRouter();
  const [nombreCalle, setNombreCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ubicacionCentro, setUbicacionCentro] = useState([36.7810, -4.1026]); // Vélez-Málaga por defecto
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searched, setSearched] = useState(false);
  const [authCredentials, setAuthCredentials] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
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
    setShowAuthModal(true); // Mostrar modal de autenticación primero
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      // Autenticar con NextAuth
      const result = await signIn("credentials", {
        username: authCredentials.username,
        password: authCredentials.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Usuario o contraseña incorrectos");
      } else {
        // Autenticación exitosa
        setShowAuthModal(false);
        setShowModal(true); // Mostrar modal de agregar calle
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
      setAuthError("Error al autenticar. Inténtalo de nuevo.");
    }
  };

  const handleSubmitNuevaCalle = async (e) => {
    e.preventDefault();
    try {
      // Ahora la sesión está establecida, no necesitamos enviar credenciales
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
        setAuthCredentials({ username: "", password: "" }); // Limpiar credenciales
        handleSearch(); // Recargar búsqueda
      } else {
        const errorData = await response.json();
        alert(`Error al agregar la calle: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al agregar calle:", error);
      alert("Error al agregar la calle");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowAuthModal(false);
    setAuthError("");
    setAuthCredentials({ username: "", password: "" });
    setNuevaCalle({
      seccion: "",
      tipo_via: "",
      nombre_calle: "",
      numero_inicio: "",
      numero_fin: "",
      paridad: "A",
    });
  };

  const handleEditClick = (calle) => {
    router.push(`/editar-calle/${calle.id}`);
  };

  return (
    <div className="max-w-xl p-6 mx-auto correos-card">
      <h2 className="mb-6 text-2xl correos-title">Buscador de Calles</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre de la calle (ej: Málaga o Camino Viejo de Málaga)"
          value={nombreCalle}
          onChange={(e) => setNombreCalle(e.target.value)}
          className="correos-input"
        />
        <input
          type="number"
          placeholder="Número (opcional)"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="correos-input"
        />
        <button
          onClick={handleSearch}
          className="correos-btn-primary"
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
            <p className="mb-3 text-sm correos-subtitle">
              Se encontraron {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </p>
            <ul className="space-y-3">
              {resultados.map((item, index) => (
                <li key={index} className="p-3 border-2 border-yellow-500 rounded-lg bg-blue-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-yellow-500 font-semibold">
                        <strong>{item.tipo_via}</strong> {item.nombre_calle},{" "}
                        {item.numero_inicio}-{item.numero_fin} - Sección: {item.seccion}
                      </p>
                      {item.paridad && (
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                          item.paridad === 'I' ? 'bg-blue-300 text-blue-900' :
                          item.paridad === 'P' ? 'bg-green-300 text-green-900' :
                          'bg-yellow-500 text-black'
                        }`}>
                          {item.paridad === 'I' ? 'Impares' : item.paridad === 'P' ? 'Pares' : 'Ambos'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditClick(item)}
                      className="ml-2 px-3 py-1 text-sm correos-btn-secondary flex items-center gap-1"
                      title="Editar calle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : searched && nombreCalle.trim() ? (
          <div className="p-4 bg-yellow-500 border-4 border-yellow-600 rounded-lg">
            <p className="mb-3 text-black font-semibold">
              No se encontraron resultados para "{nombreCalle}"
            </p>
            <button
              onClick={handleAgregarCalle}
              className="w-full px-4 py-2 font-bold text-black bg-green-300 rounded-lg hover:bg-green-400 shadow-lg"
            >
              + Agregar Nueva Calle
            </button>
          </div>
        ) : (
          <p className="text-yellow-300">
            Ingresa el nombre de una calle para buscar
          </p>
        )}
      </div>

      {/* Modal de autenticación de administrador */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 correos-card">
            <h2 className="mb-4 text-2xl correos-title">
              Autenticación de Administrador
            </h2>
            <p className="mb-4 text-sm correos-subtitle">
              Se requiere autenticación de administrador para agregar calles.
            </p>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={authCredentials.username}
                  onChange={(e) =>
                    setAuthCredentials({ ...authCredentials, username: e.target.value })
                  }
                  className="correos-input"
                  required
                  autoFocus
                  placeholder="Ingrese su usuario"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={authCredentials.password}
                  onChange={(e) =>
                    setAuthCredentials({ ...authCredentials, password: e.target.value })
                  }
                  className="correos-input"
                  required
                  placeholder="Ingrese su contraseña"
                />
              </div>
              
              {authError && (
                <div className="p-3 text-sm text-red-900 bg-red-300 border-2 border-red-500 rounded-lg font-semibold">
                  ❌ {authError}
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="correos-btn-danger"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="correos-btn-primary"
                >
                  Autenticar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agregar nueva calle */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 correos-card">
            <h2 className="mb-4 text-2xl correos-title">
              Agregar Nueva Calle
            </h2>
            <form onSubmit={handleSubmitNuevaCalle} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Sección *
                </label>
                <input
                  type="number"
                  value={nuevaCalle.seccion}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, seccion: parseInt(e.target.value) })
                  }
                  className="correos-input"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Tipo de Vía *
                </label>
                <select
                  value={nuevaCalle.tipo_via}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, tipo_via: e.target.value })
                  }
                  className="correos-input"
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
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Nombre de la Calle *
                </label>
                <input
                  type="text"
                  value={nuevaCalle.nombre_calle}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, nombre_calle: e.target.value })
                  }
                  className="correos-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-bold correos-subtitle">
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
                    className="correos-input"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold correos-subtitle">
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
                    className="correos-input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Paridad *
                </label>
                <select
                  value={nuevaCalle.paridad}
                  onChange={(e) =>
                    setNuevaCalle({ ...nuevaCalle, paridad: e.target.value })
                  }
                  className="correos-input"
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
                  className="correos-btn-danger"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="correos-btn-primary"
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
