import Link from "next/link";
import BuscadorCallejero from './Componentes/BuscadorCallejero';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen correos-gradient-bg">
      {/* Encabezado */}
      <header className="fixed top-0 flex items-center justify-between w-full p-6 bg-blue-900 border-b-4 border-yellow-500 shadow-2xl">
        <h1 className="text-2xl font-bold text-yellow-500 drop-shadow-lg">Callejero Vélez-Málaga</h1>
        <nav>
          <ul className="flex gap-6 text-lg">
            <li>
              <Link href="/admin/login" className="font-semibold text-yellow-500 transition duration-300 hover:text-yellow-300">
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
      <footer className="w-full p-6 mt-12 text-center bg-blue-900 border-t-4 border-yellow-500 shadow-2xl">
        <p className="font-semibold text-yellow-500">&copy; 2025 Callejero Vélez-Málaga. Creado por ITACA.Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

