import Link from "next/link";
import BuscadorCallejero from './Componentes/BuscadorCallejero';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-900 bg-gray-100">
      {/* Encabezado */}
      <header className="fixed top-0 flex items-center justify-between w-full p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-800">Callejero Vélez-Málaga</h1>
        <nav>
          <ul className="flex gap-6 text-lg">
            <li>
              <Link href="/admin/login" className="transition duration-300 hover:text-blue-600">
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Contenido Principal */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 mt-24">
        <BuscadorCallejero/>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 mt-12 text-center text-white bg-gray-800 shadow-md">
        <p>&copy; 2025 Callejero Vélez-Málaga. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

