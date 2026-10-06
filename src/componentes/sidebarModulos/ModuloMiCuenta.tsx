'use client';

import { useState, useEffect, useTransition } from 'react';
import { obtenerPerfilUsuario, actualizarPerfilUsuario } from '@/actions/usuario/actions';
import { useUI } from '@/contexto/ContextoUI';
import { DatosUsuarioCompleto } from '@/types/usuario';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMail, 
  FiBriefcase, 
  FiShield, 
  FiLoader, 
  FiCheckCircle, 
  FiAlertCircle 
} from 'react-icons/fi';
import Image from 'next/image';

export default function ModuloMiCuenta() {
  const { volverAlMenu } = useUI();
  const [usuario, setUsuario] = useState<DatosUsuarioCompleto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  // Estados locales para los campos editables
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const res = await obtenerPerfilUsuario();
      if (res.exito && res.usuario) {
        setUsuario(res.usuario);
        setNombre(res.usuario.nombre);
        setEmpresa(res.usuario.empresa === 'Sin Empresa' ? '' : res.usuario.empresa);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMensaje({ texto: 'El nombre no puede estar vacío.', tipo: 'error' });
      return;
    }

    setMensaje(null);
    startTransition(async () => {
      const res = await actualizarPerfilUsuario({
        nombre,
        empresa: empresa || 'Sin Empresa',
      });

      if (res.exito) {
        setMensaje({ texto: '¡Perfil actualizado correctamente!', tipo: 'exito' });
      } else {
        setMensaje({ texto: res.error || 'Error al actualizar', tipo: 'error' });
      }
    });
  };

  if (cargando) {
    return (
      <div className="flex justify-center p-8 text-zinc-500">
        <FiLoader className="animate-spin text-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <button
        onClick={volverAlMenu}
        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
      >
        <FiArrowLeft /> Volver al menú principal
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Mi Cuenta</h2>
      </div>

      {/* Tarjeta de Avatar y Proveedor */}
      <div className="p-4 bg-zinc-800/40 border border-zinc-800 rounded-xl flex items-center gap-3">
        {usuario?.avatarUrl ? (
          <Image src={usuario.avatarUrl} alt="Avatar" width={12} height={12} className="w-12 h-12 rounded-full border border-zinc-700 object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FiUser size={20} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{usuario?.nombre}</p>
          <p className="text-[11px] text-zinc-400 capitalize">Proveedor: {usuario?.proveedor}</p>
        </div>
      </div>

      {/* Formulario de Edición */}
      <form onSubmit={handleGuardar} className="space-y-3">
        {mensaje && (
          <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
            mensaje.tipo === 'exito' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}>
            {mensaje.tipo === 'exito' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
            <span>{mensaje.texto}</span>
          </div>
        )}

        {/* Campo Correo (Bloqueado) */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
            <FiMail size={12} /> Correo Electrónico (No modificable)
          </label>
          <input
            type="email"
            disabled
            value={usuario?.email || ''}
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-500 cursor-not-allowed select-none"
          />
        </div>

        {/* Campo Nombre (Editable) */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-300 flex items-center gap-1">
            <FiUser size={12} /> Nombre Completo *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Campo Empresa (Editable) */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-300 flex items-center gap-1">
            <FiBriefcase size={12} /> Empresa
          </label>
          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nombre de tu empresa"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
        >
          {isPending ? <FiLoader className="animate-spin" /> : <><FiCheckCircle size={14} /> Guardar Cambios</>}
        </button>
      </form>
    </div>
  );
}