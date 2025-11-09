import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen correos-gradient-bg">
      <nav className="bg-blue-900 border-b-4 border-yellow-500 shadow-2xl">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl correos-title">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="correos-subtitle">
                Bienvenido, {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="px-4 py-2 text-sm font-medium correos-btn-danger"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card Gestión de Calles */}
          <Link href="/admin/calles">
            <div className="p-6 transition-all transform correos-card hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl correos-title">Calles</h2>
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <p className="correos-subtitle">
                Gestionar calles, agregar, editar y eliminar registros
              </p>
            </div>
          </Link>

          {/* Card Gestión de Secciones */}
          <Link href="/admin/secciones">
            <div className="p-6 transition-all transform correos-card hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl correos-title">Secciones</h2>
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                  />
                </svg>
              </div>
              <p className="correos-subtitle">
                Ver y modificar las secciones del callejero
              </p>
            </div>
          </Link>

          {/* Card Estadísticas */}
          <Link href="/admin/estadisticas">
            <div className="p-6 transition-all transform correos-card hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl correos-title">Estadísticas</h2>
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="correos-subtitle">
                Resumen y estadísticas del callejero
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
