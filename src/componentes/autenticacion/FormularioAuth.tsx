'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTruck, FiLock, FiMail, FiUser, FiBriefcase } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { iniciarSesion, obtenerUrlGoogle, registrarUsuario } from '@/actions/usuario/actions';

export default function FormularioAuth() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();


const manejarAutenticacion = async (e: React.FormEvent) => {
  e.preventDefault();
  setCargando(true);
  setError(null);

  if (esRegistro) {
    const res = await registrarUsuario({ email, password, nombre, empresa });
    if (!res.exito) {
      setError(res.error || 'Ocurrió un error en el registro.');
    } else {
      alert('Registro exitoso. Revisa tu correo o inicia sesión.');
      setEsRegistro(false);
    }
  } else {
    const res = await iniciarSesion(email, password);
    if (!res.exito) {
      setError(res.error || 'Credenciales inválidas.');
    } else {
      router.push('/miSeguimiento');
      router.refresh();
    }
  }

  setCargando(false);
};

const iniciarSesionConGoogle = async () => {
  setError(null);
  const { url, error } = await obtenerUrlGoogle();
  if (error || !url) {
    setError(error || 'Error al conectar con Google.');
    return;
  }
  window.location.href = url;
};

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
          <FiTruck className="text-2xl text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">MapaLogística</h1>
          <p className="text-xs text-zinc-400">Telemetría y Control de Flotas</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {esRegistro ? 'Crear una cuenta' : 'Bienvenido de nuevo'}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          {esRegistro
            ? 'Ingresa tus datos para registrar tu empresa'
            : 'Ingresa tus credenciales para acceder al mapa'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Botón Google OAuth */}
      <button
        type="button"
        onClick={iniciarSesionConGoogle}
        className="w-full mb-4 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-3 cursor-pointer"
      >
        <FcGoogle className="text-xl" />
        Continuar con Google
      </button>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <span className="relative bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-wider">
          O con email
        </span>
      </div>

      <form onSubmit={manejarAutenticacion} className="flex flex-col gap-4">
        {esRegistro && (
          <>
            <div>
              <label className="text-xs font-medium text-zinc-300 mb-1 block">Nombre Completo</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Bastián Barrios"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 mb-1 block">Empresa / Organización</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Transportes Biobío S.A."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-medium text-zinc-300 mb-1 block">Correo Electrónico</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@empresa.cl"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-300 mb-1 block">Contraseña</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {cargando ? 'Procesando...' : esRegistro ? 'Registrarse' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-400">
        {esRegistro ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta aún?'}{' '}
        <button
          onClick={() => setEsRegistro(!esRegistro)}
          className="text-blue-400 hover:underline font-medium cursor-pointer"
        >
          {esRegistro ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </button>
      </div>
    </div>
  );
}