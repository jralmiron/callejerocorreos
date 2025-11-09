import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Secciones() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchSecciones();
    }
  }, [status, router]);

  const fetchSecciones = async () => {
    try {
      const res = await fetch("/api/admin/secciones");
      const data = await res.json();
      setSecciones(data);
    } catch (error) {
      console.error("Error al cargar secciones:", error);
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

  if (!session) return null;

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
                Gestión de Secciones
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="overflow-hidden correos-card">
          <table className="min-w-full divide-y divide-yellow-500">
            <thead className="bg-blue-800">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left correos-subtitle uppercase">
                  Sección
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left correos-subtitle uppercase">
                  Total de Calles
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right correos-subtitle uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-blue-900 divide-y divide-blue-800">
              {secciones.map((seccion) => (
                <tr key={seccion.seccion} className="hover:bg-blue-800 transition-colors">
                  <td className="px-6 py-4 text-lg font-bold text-yellow-500 whitespace-nowrap">
                    Sección {seccion.seccion}
                  </td>
                  <td className="px-6 py-4 correos-subtitle whitespace-nowrap">
                    {seccion._count.calles} calles
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link href={`/admin/calles?seccion=${seccion.seccion}`}>
                      <button className="text-yellow-500 hover:text-yellow-300 font-semibold">
                        Ver Calles →
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
