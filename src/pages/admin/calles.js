import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Calles() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchCalles();
    }
  }, [status, router]);

  const fetchCalles = async () => {
    try {
      const res = await fetch("/api/admin/calles");
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

  const filteredCalles = calles.filter((calle) =>
    calle.nombre_calle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <button className="text-blue-600 hover:text-blue-800">
                  ← Volver al Dashboard
                </button>
              </Link>
              <h1 className="text-xl font-bold text-gray-800">
                Gestión de Calles
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Buscar calle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => openModal()}
              className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              + Nueva Calle
            </button>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Sección
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Tipo Vía
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Números
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Paridad
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCalles.map((calle) => (
                <tr key={calle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{calle.seccion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calle.tipo_via}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calle.nombre_calle}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {calle.numero_inicio} - {calle.numero_fin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      calle.paridad === 'I' ? 'bg-blue-100 text-blue-800' :
                      calle.paridad === 'P' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {calle.paridad === 'I' ? 'Impares' : calle.paridad === 'P' ? 'Pares' : 'Ambos'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => openModal(calle)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(calle.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-bold">
              {editMode ? "Editar Calle" : "Nueva Calle"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Sección
                </label>
                <input
                  type="number"
                  value={currentCalle.seccion}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, seccion: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Tipo de Vía
                </label>
                <input
                  type="text"
                  value={currentCalle.tipo_via}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, tipo_via: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Nombre de la Calle
                </label>
                <input
                  type="text"
                  value={currentCalle.nombre_calle}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, nombre_calle: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
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
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
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
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Paridad
                </label>
                <select
                  value={currentCalle.paridad}
                  onChange={(e) =>
                    setCurrentCalle({ ...currentCalle, paridad: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
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
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
