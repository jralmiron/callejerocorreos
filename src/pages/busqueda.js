import BuscadorCallejero from "./Componentes/BuscadorCallejero";

export default function Busqueda() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                Callejero de Vélez-Málaga
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                Inicio
              </a>
              <a
                href="/admin/login"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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

      <footer className="py-6 mt-20 bg-white border-t">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <p className="text-gray-600">
            © 2025 Callejero Vélez-Málaga - Sistema de gestión de calles
          </p>
        </div>
      </footer>
    </div>
  );
}
