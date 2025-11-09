import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Estadisticas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchEstadisticas();
    }
  }, [status, router]);

  const fetchEstadisticas = async () => {
    try {
      const res = await fetch("/api/admin/estadisticas");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session || !stats) return null;

  return (
    <div className="min-h-screen correos-gradient-bg">
      <nav className="bg-blue-900 border-b-4 border-yellow-500 shadow-2xl">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <button className="correos-subtitle hover:text-yellow-100">
                  ← Volver al Dashboard
                </button>
              </Link>
              <h1 className="text-xl correos-title">
                Estadísticas del Callejero
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Resumen General */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 correos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm correos-subtitle">Total Calles</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.totalCalles}</p>
              </div>
              <svg className="w-12 h-12 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>

          <div className="p-6 correos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm correos-subtitle">Secciones</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.totalSecciones}</p>
              </div>
              <svg className="w-12 h-12 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
          </div>

          <div className="p-6 correos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm correos-subtitle">Calles Únicas</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.callesUnicas}</p>
              </div>
              <svg className="w-12 h-12 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>

          <div className="p-6 correos-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm correos-subtitle">Tipos de Vía</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.tiposVia}</p>
              </div>
              <svg className="w-12 h-12 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Distribución por Sección */}
        <div className="mb-8 overflow-hidden correos-card">
          <div className="px-6 py-4 bg-blue-800">
            <h2 className="text-lg correos-title">Distribución por Sección</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {stats.porSeccion.map((sec) => (
                <div key={sec.seccion} className="p-4 text-center border-2 border-yellow-500 rounded-lg hover:bg-blue-800 transition-colors bg-blue-900">
                  <div className="text-2xl font-bold text-yellow-500">
                    {sec.seccion || 'Sin sección'}
                  </div>
                  <div className="text-sm correos-subtitle">{sec.count} calles</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tipos de Vía */}
        <div className="mb-8 overflow-hidden correos-card">
          <div className="px-6 py-4 bg-blue-800">
            <h2 className="text-lg correos-title">Tipos de Vía</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats.porTipoVia.map((tipo) => (
                <div key={tipo.tipo_via} className="flex items-center justify-between p-3 border-2 border-yellow-500 rounded-lg bg-blue-800">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 text-sm font-semibold text-black bg-yellow-500 rounded">
                      {tipo.tipo_via || 'Sin especificar'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-64 h-4 overflow-hidden bg-blue-700 rounded-full">
                      <div 
                        className="h-full bg-yellow-500"
                        style={{ width: `${(tipo.count / stats.totalCalles) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-yellow-500">{tipo.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paridad */}
        <div className="overflow-hidden correos-card">
          <div className="px-6 py-4 bg-blue-800">
            <h2 className="text-lg correos-title">Distribución por Paridad</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {stats.porParidad.map((par) => (
                <div key={par.paridad} className="p-6 text-center border-2 border-yellow-500 rounded-lg bg-blue-800">
                  <div className={`text-4xl font-bold mb-2 ${
                    par.paridad === 'I' ? 'text-blue-300' :
                    par.paridad === 'P' ? 'text-green-300' :
                    'text-yellow-500'
                  }`}>
                    {par.count}
                  </div>
                  <div className="text-sm font-semibold correos-subtitle">
                    {par.paridad === 'I' ? 'Impares' : 
                     par.paridad === 'P' ? 'Pares' : 
                     'Ambos/Todos'}
                  </div>
                  <div className="mt-2 text-xs text-yellow-400">
                    {((par.count / stats.totalCalles) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
