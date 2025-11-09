import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Calles() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { seccion } = router.query; // Obtener sección de la URL
  const [calles, setCalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCalle, setCurrentCalle] = useState({
    id: null,
    seccion: "",
    tipo_via: "",
    nombre_calle: "",
    numero_inicio: "",
    numero_fin: "",
    paridad: "A",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCalles, setExpandedCalles] = useState({});
  const [selectedLetter, setSelectedLetter] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchCalles();
    }
  }, [status, router]);

  const fetchCalles = async () => {
    try {
      const url = seccion 
        ? `/api/admin/calles?seccion=${seccion}` 
        : "/api/admin/calles";
      const res = await fetch(url);
      const data = await res.json();
      setCalles(data);
    } catch (error) {
      console.error("Error al cargar calles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editMode ? `/api/admin/calles/${currentCalle.id}` : "/api/admin/calles";
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentCalle),
      });

      if (res.ok) {
        fetchCalles();
        closeModal();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta calle?")) return;

    try {
      const res = await fetch(`/api/admin/calles/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCalles();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const openModal = (calle = null) => {
    if (calle) {
      setCurrentCalle(calle);
      setEditMode(true);
    } else {
      setCurrentCalle({
        id: null,
        seccion: "",
        tipo_via: "",
        nombre_calle: "",
        numero_inicio: "",
        numero_fin: "",
        paridad: "A",
      });
      setEditMode(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCalle({
      id: null,
      seccion: "",
      tipo_via: "",
      nombre_calle: "",
      numero_inicio: "",
      numero_fin: "",
      paridad: "A",
    });
  };

  const filteredCalles = calles.filter((calle) => {
    const fullName = `${calle.tipo_via} ${calle.nombre_calle}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Agrupar calles por nombre (ordenado alfabéticamente)
  const groupedCalles = filteredCalles.reduce((acc, calle) => {
    const key = `${calle.tipo_via} ${calle.nombre_calle}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(calle);
    return acc;
  }, {});

  // Convertir a array y ordenar alfabéticamente
  const sortedCalleNames = Object.keys(groupedCalles).sort((a, b) => 
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );

  // Filtrar por letra seleccionada
  const filteredByLetter = selectedLetter 
    ? sortedCalleNames.filter(name => {
        // Extraer solo el nombre de la calle (sin tipo_via)
        const parts = name.split(' ');
        // Buscar la primera palabra que no sea un tipo de vía común
        const tiposVia = ['CALLE', 'AVENIDA', 'PLAZA', 'PASEO', 'CAMINO', 'CARRETERA', 'TRAVESIA', 'GLORIETA', 'RONDA'];
        let nombreCalle = '';
        for (let i = 0; i < parts.length; i++) {
          if (!tiposVia.includes(parts[i].toUpperCase())) {
            nombreCalle = parts.slice(i).join(' ');
            break;
          }
        }
        const firstChar = nombreCalle.charAt(0).toUpperCase();
        return firstChar === selectedLetter;
      })
    : sortedCalleNames;

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredByLetter.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCalleNames = filteredByLetter.slice(startIndex, endIndex);

  // Contar calles por letra
  const letterCounts = sortedCalleNames.reduce((acc, name) => {
    // Extraer solo el nombre de la calle (sin tipo_via)
    const parts = name.split(' ');
    const tiposVia = ['CALLE', 'AVENIDA', 'PLAZA', 'PASEO', 'CAMINO', 'CARRETERA', 'TRAVESIA', 'GLORIETA', 'RONDA'];
    let nombreCalle = '';
    for (let i = 0; i < parts.length; i++) {
      if (!tiposVia.includes(parts[i].toUpperCase())) {
        nombreCalle = parts.slice(i).join(' ');
        break;
      }
    }
    const firstChar = nombreCalle.charAt(0).toUpperCase();
    acc[firstChar] = (acc[firstChar] || 0) + 1;
    return acc;
  }, {});

  // Generar alfabeto
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Reset de página al cambiar búsqueda o letra
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLetter]);

  const toggleExpand = (calleName) => {
    setExpandedCalles(prev => ({
      ...prev,
      [calleName]: !prev[calleName]
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen correos-gradient-bg">
        <div className="text-xl correos-title">Cargando...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen correos-gradient-bg">
      <nav className="bg-blue-900 border-b-4 border-yellow-500 shadow-2xl">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={seccion ? "/admin/secciones" : "/admin/dashboard"}>
                <button className="correos-subtitle hover:text-yellow-100">
                  ← Volver {seccion ? "a Secciones" : "al Dashboard"}
                </button>
              </Link>
              <h1 className="text-xl correos-title">
                {seccion ? `Gestión de Calles - Sección ${seccion}` : "Gestión de Calles"}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Buscar calle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 correos-input"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLetter("");
                  }}
                  className="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-400"
                >
                  Limpiar
                </button>
              )}
            </div>
            <button
              onClick={() => openModal()}
              className="px-6 correos-btn-primary"
            >
              + Nueva Calle
            </button>
          </div>

          {/* Navegación alfabética */}
          <div className="p-4 correos-card">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedLetter("")}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  selectedLetter === "" 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-blue-800 text-yellow-300 hover:bg-blue-700'
                }`}
              >
                Todas
              </button>
              {alphabet.map(letter => {
                const count = letterCounts[letter] || 0;
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    disabled={count === 0}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      selectedLetter === letter 
                        ? 'bg-yellow-500 text-black' 
                        : count > 0 
                          ? 'bg-blue-800 text-yellow-300 hover:bg-blue-700' 
                          : 'bg-blue-950 text-gray-500 cursor-not-allowed'
                    }`}
                    title={count > 0 ? `${count} ${count === 1 ? 'calle' : 'calles'}` : 'Sin calles'}
                  >
                    {letter}
                    {count > 0 && (
                      <span className="ml-1 text-xs opacity-75">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedLetter && (
              <div className="mt-2 text-sm text-center correos-subtitle">
                Mostrando calles que empiezan por "{selectedLetter}" ({filteredByLetter.length} {filteredByLetter.length === 1 ? 'resultado' : 'resultados'})
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden correos-card">
          <div className="divide-y divide-yellow-500">
            {paginatedCalleNames.map((calleName) => {
              const callesGroup = groupedCalles[calleName];
              const isExpanded = expandedCalles[calleName];
              
              return (
                <div key={calleName} className="border-b border-yellow-500">
                  {/* Cabecera de la calle */}
                  <div 
                    className="flex items-center justify-between px-6 py-4 transition-colors cursor-pointer hover:bg-blue-800"
                    onClick={() => toggleExpand(calleName)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg 
                        className={`w-5 h-5 text-yellow-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-lg font-semibold text-yellow-500">{calleName}</span>
                      <span className="px-2 py-1 text-xs font-medium text-black bg-yellow-500 rounded-full">
                        {callesGroup.length} {callesGroup.length === 1 ? 'registro' : 'registros'}
                      </span>
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="px-6 pb-4 bg-blue-800">
                      <table className="min-w-full divide-y divide-yellow-500">
                        <thead className="bg-blue-700">
                          <tr>
                            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase correos-subtitle">
                              Sección
                            </th>
                            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase correos-subtitle">
                              Números
                            </th>
                            <th className="px-4 py-2 text-xs font-medium tracking-wider text-left uppercase correos-subtitle">
                              Paridad
                            </th>
                            <th className="px-4 py-2 text-xs font-medium tracking-wider text-right uppercase correos-subtitle">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-blue-900 divide-y divide-blue-800">
                          {callesGroup.map((calle) => (
                            <tr key={calle.id} className="transition-colors hover:bg-blue-700">
                              <td className="px-4 py-3 text-sm font-semibold text-yellow-300 whitespace-nowrap">
                                {calle.seccion}
                              </td>
                              <td className="px-4 py-3 text-sm text-yellow-300 whitespace-nowrap">
                                {calle.numero_inicio} - {calle.numero_fin}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                  calle.paridad === 'I' ? 'bg-blue-300 text-blue-900' :
                                  calle.paridad === 'P' ? 'bg-green-300 text-green-900' :
                                  'bg-yellow-500 text-black'
                                }`}>
                                  {calle.paridad === 'I' ? 'Impares' : calle.paridad === 'P' ? 'Pares' : 'Ambos'}
                                </span>
                              </td>
                              <td className="px-4 py-3 space-x-2 text-sm text-right whitespace-nowrap">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(calle);
                                  }}
                                  className="font-medium text-yellow-500 hover:text-yellow-300"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(calle.id);
                                  }}
                                  className="font-medium text-red-400 hover:text-red-300"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-blue-900 border-t-4 border-yellow-500">
              <div className="text-sm font-medium text-yellow-300">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredByLetter.length)} de {filteredByLetter.length} calles
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === 1 
                      ? 'bg-blue-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg'
                  }`}
                >
                  ← Anterior
                </button>
                <span className="px-4 py-2 text-sm font-medium text-yellow-500 bg-blue-800 rounded-lg">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === totalPages 
                      ? 'bg-blue-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg'
                  }`}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 99999 }}>
          <div className="relative w-full max-w-md p-6 correos-card" style={{ zIndex: 100000 }}>
            <h2 className="mb-4 text-2xl correos-title">
              {editMode ? "Editar Calle" : "Nueva Calle"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Sección
                </label>
                <input
                  type="number"
                  value={currentCalle.seccion}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, seccion: parseInt(e.target.value) })
                  }
                  className="correos-input"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Tipo de Vía
                </label>
                <input
                  type="text"
                  value={currentCalle.tipo_via}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, tipo_via: e.target.value })
                  }
                  className="correos-input"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold correos-subtitle">
                  Nombre de la Calle
                </label>
                <input
                  type="text"
                  value={currentCalle.nombre_calle}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, nombre_calle: e.target.value })
                  }
                  className="correos-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-bold correos-subtitle">
                    Número Inicio
                  </label>
                  <input
                    type="number"
                    value={currentCalle.numero_inicio}
                    onChange={(e) =>
                      setCurrentCalle({
                        ...currentCalle,
                        numero_inicio: parseInt(e.target.value),
                      })
                    }
                    className="correos-input"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold correos-subtitle">
                    Número Fin
                  </label>
                  <input
                    type="number"
                    value={currentCalle.numero_fin}
                    onChange={(e) =>
                      setCurrentCalle({
                        ...currentCalle,
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
                  Paridad
                </label>
                <select
                  value={currentCalle.paridad}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, paridad: e.target.value })
                  }
                  className="correos-input"
                  required
                >
                  <option value="I">Impares</option>
                  <option value="P">Pares</option>
                  <option value="A">Ambos/Todos</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
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
                  {editMode ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
