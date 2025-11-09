import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen correos-gradient-bg">
      <div className="relative w-full max-w-md p-8 correos-card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl correos-title">
            Panel de Administración
          </h1>
          <Link href="/">
            <button className="text-yellow-500 hover:text-yellow-300 focus:outline-none">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
            </button>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm correos-subtitle">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="correos-input"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm correos-subtitle">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="correos-input"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full correos-btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/">
            <button className="correos-link text-sm">
              ← Volver a la búsqueda
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
