import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function EditarCalle() {
  const router = useRouter();
  const { id } = router.query;
  
  const [authenticated, setAuthenticated] = useState(false);
  const [authCredentials, setAuthCredentials] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [calle, setCalle] = useState({
    id: null,
    seccion: "",
    tipo_via: "",
    nombre_calle: "",
    numero_inicio: "",
    numero_fin: "",
    paridad: "A",
  });
  const [loadingCalle, setLoadingCalle] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    // Solo hacer fetch cuando tengamos el ID del router
    if (id && !isNaN(parseInt(id))) {
      fetchCalle();
    }
  }, [id]);

  const fetchCalle = async () => {
    try {
      const res = await fetch(`/api/calles/${id}`);
      const data = await res.json();
      
      if (res.ok && data) {
        setCalle(data);
      } else {
        alert("Calle no encontrada");
        router.push("/");
      }
    } catch (error) {
      console.error("Error al cargar calle:", error);
      alert("Error al cargar la calle");
      router.push("/");
    } finally {
      setLoadingCalle(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    // Validar credenciales (mismo usuario/contraseña del dashboard)
    if (authCredentials.username === "c205798" && authCredentials.password === "Correos.007") {
      setAuthenticated(true);
    } else {
      setAuthError("Usuario o contraseña incorrectos");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCalle(prev => ({
      ...prev,
      [name]: name === "seccion" || name === "numero_inicio" || name === "numero_fin" 
        ? parseInt(value) || "" 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Enviar las credenciales junto con los datos de la calle
      const res = await fetch(`/api/admin/calles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(`${authCredentials.username}:${authCredentials.password}`)}`,
        },
        body: JSON.stringify(calle),
      });

      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        const error = await res.json();
        alert(`Error al actualizar la calle: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar la calle");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCalle) {
    return (
      <div className="min-h-screen flex items-center justify-center correos-gradient-bg">
        <div className="text-xl text-yellow-500 font-bold">Cargando...</div>
      </div>
    );
  }

  // Modal de autenticación
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center correos-gradient-bg">
        <div className="w-full max-w-md p-8 correos-card">
          <div className="mb-6">
            <Link href="/" className="correos-link flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a la búsqueda
            </Link>
          </div>
          
          <h1 className="mb-2 text-3xl correos-title">
            Editar Calle
          </h1>
          <p className="mb-6 text-sm correos-subtitle">
            Calle a editar: <strong>{calle.tipo_via} {calle.nombre_calle}</strong>
          </p>
          
          <div className="mb-6 p-4 bg-yellow-500 border-4 border-yellow-600 rounded-lg">
            <p className="text-sm text-black font-semibold">
              🔒 Se requiere autenticación de administrador para editar esta calle.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-bold correos-subtitle">
                Usuario
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
                Contraseña
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
            
            <button
              type="submit"
              className="w-full correos-btn-primary text-lg"
            >
              Autenticar y continuar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Formulario de edición (solo visible después de autenticar)
  return (
    <div className="min-h-screen correos-gradient-bg py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="correos-link flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la búsqueda
          </Link>
        </div>

        <div className="correos-card p-8">
          <h1 className="mb-6 text-3xl correos-title">
            Editar Calle
          </h1>

          {updateSuccess && (
            <div className="mb-6 p-4 text-green-900 bg-green-300 border-4 border-green-500 rounded-lg font-semibold">
              ✅ Calle actualizada correctamente. Redirigiendo...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-bold correos-subtitle">
                Sección *
              </label>
              <input
                type="number"
                name="seccion"
                value={calle.seccion}
                onChange={handleChange}
                className="correos-input"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold correos-subtitle">
                Tipo de Vía *
              </label>
              <select
                name="tipo_via"
                value={calle.tipo_via}
                onChange={handleChange}
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
                <option value="RONDA">Ronda</option>
                <option value="CTRA">Carretera</option>
                <option value="TRAVESIA">Travesía</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold correos-subtitle">
                Nombre de la Calle *
              </label>
              <input
                type="text"
                name="nombre_calle"
                value={calle.nombre_calle}
                onChange={handleChange}
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
                  name="numero_inicio"
                  value={calle.numero_inicio}
                  onChange={handleChange}
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
                  name="numero_fin"
                  value={calle.numero_fin}
                  onChange={handleChange}
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
                name="paridad"
                value={calle.paridad}
                onChange={handleChange}
                className="correos-input"
                required
              >
                <option value="I">Impares (I)</option>
                <option value="P">Pares (P)</option>
                <option value="A">Ambos/Todos (A)</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 correos-btn-danger"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 correos-btn-primary disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
