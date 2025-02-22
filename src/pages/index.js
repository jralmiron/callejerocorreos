import { useState } from 'react';
import '../styles/globals.css';
import Link from "next/link";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-900 bg-gray-100">
      {/* Encabezado */}
      <header className="fixed top-0 flex items-center justify-between w-full p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-800">Callejero App</h1>
        <nav>
          <ul className="flex gap-6 text-lg">
            <li><Link href="/admin" className="transition duration-300 hover:text-blue-600">Admin</Link></li>
          </ul>
        </nav>
      </header>
      
      {/* Contenido Principal */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 mt-24 text-center">
        <h2 className="mb-4 text-5xl font-extrabold text-blue-900">Encuentra calles y secciones fácilmente</h2>
        <p className="max-w-xl mb-8 text-lg text-gray-600">Utiliza nuestra aplicación para buscar calles por nombre o número y obtener su sección correspondiente de manera rápida y sencilla.</p>
        {!showLogin ? (
          <button 
            className="px-8 py-4 text-lg font-semibold text-white transition duration-300 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg"
            onClick={() => setShowLogin(true)}
          >
            Usuario
          </button>
        ) : (
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-2xl font-bold text-blue-800">Iniciar Sesión</h3>
            <form>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="corporateId">
                  Introduce tu "C"
                </label>
                <input 
                  className="w-full px-3 py-2 leading-tight text-center text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" 
                  id="corporateId" 
                  type="text" 
                  placeholder="C Corporativo"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
                  Contraseña
                </label>
                <input 
                  className="w-full px-3 py-2 mb-3 leading-tight text-center text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" 
                  id="password" 
                  type="password" 
                  placeholder="tu contraseña"
                />
              </div>
              <div className="flex items-center justify-center">
                <Link href="/busqueda">
                  <button 
                    className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline" 
                    type="button"
                  >
                    Login
                  </button>
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full p-6 mt-12 text-center text-white bg-gray-800 shadow-md">
        <p>&copy; 2025 Callejero App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

