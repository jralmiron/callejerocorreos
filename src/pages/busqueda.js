import BuscadorCallejero from "./Componentes/BuscadorCallejero";

export default function Busqueda() {
  return (
    <div className="min-h-screen correos-gradient-bg">
      <nav className="bg-blue-900 border-b-4 border-yellow-500 shadow-2xl">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-500 drop-shadow-lg">
                Callejero de Vélez-Málaga
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-yellow-500 hover:text-yellow-300 font-semibold"
              >
                Inicio
              </a>
              <a
                href="/admin/login"
                className="correos-btn-primary"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <BuscadorCallejero />
      </main>

      <footer className="py-6 mt-20 bg-blue-900 border-t-4 border-yellow-500">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <p className="text-yellow-500 font-semibold">
            © 2025 Callejero Vélez-Málaga - Sistema de gestión de calles
          </p>
        </div>
      </footer>
    </div>
  );
}
