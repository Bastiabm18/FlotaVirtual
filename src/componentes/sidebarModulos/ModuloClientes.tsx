'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { 
  getClientesListado, 
  guardarCliente, 
  cambiarEstadoCliente, 
   
} from '@/actions/usuario/actions';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiX, 
  FiLoader, 
  FiUsers, 
  FiBriefcase, 
  FiUser 
} from 'react-icons/fi';
import { ClienteData } from '@/types/usuario';

export default function ModuloClientes() {
  const { volverAlMenu } = useUI();
  const [clientes, setClientes] = useState<ClienteData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Control de vista y edición
  const [modoFormulario, setModoFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteData | null>(null);

  // Formulario fields
  const [nombre, setNombre] = useState('');
  const [esEmpresa, setEsEmpresa] = useState(true);
  const [estadoCliente, setEstadoCliente] = useState(true);

  // Confirmación de desactivación
  const [confirmandoBaja, setConfirmandoBaja] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    const res = await getClientesListado();
    if (res.data) setClientes(res.data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirNuevo = () => {
    setClienteEditando(null);
    setNombre('');
    setEsEmpresa(true);
    setEstadoCliente(true);
    setModoFormulario(true);
  };

  const abrirEditar = (cli: ClienteData) => {
    setClienteEditando(cli);
    setNombre(cli.nombre_cliente);
    setEsEmpresa(cli.es_empresa);
    setEstadoCliente(cli.estado_cliente);
    setModoFormulario(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    startTransition(async () => {
      const res = await guardarCliente({
        id: clienteEditando ? clienteEditando.id : undefined,
        nombre_cliente: nombre.trim(),
        es_empresa: esEmpresa,
        estado_cliente: estadoCliente,
      });

      if (res.exito) {
        setModoFormulario(false);
        cargarDatos();
      } else {
        alert(`Error al guardar cliente: ${res.error}`);
      }
    });
  };

  const ejecutarCambioEstado = (id: number, nuevoEstado: boolean) => {
    startTransition(async () => {
      const res = await cambiarEstadoCliente(id, nuevoEstado);
      if (res.exito) {
        setConfirmandoBaja(null);
        cargarDatos();
      } else {
        alert(`Error al actualizar estado: ${res.error}`);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (modoFormulario) { setModoFormulario(false); } else { volverAlMenu(); } }}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <FiArrowLeft /> {modoFormulario ? 'Volver al listado' : 'Volver al menú principal'}
        </button>

        {!modoFormulario && (
          <button
            onClick={abrirNuevo}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <FiPlus size={14} /> Nuevo Cliente
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {modoFormulario ? (clienteEditando ? 'Editar Cliente' : 'Registrar Nuevo Cliente') : 'Gestión de Clientes'}
        </h2>
      </div>

      {modoFormulario ? (
        /* VISTA: FORMULARIO CREAR / EDITAR */
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Nombre o Razón Social *</label>
            <input
              required
              type="text"
              placeholder="Ej: Forestal Arauco S.A."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Tipo de Cliente *</label>
              <select
                value={esEmpresa ? 'true' : 'false'}
                onChange={(e) => setEsEmpresa(e.target.value === 'true')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="true">Empresa / Persona Jurídica</option>
                <option value="false">Persona Natural</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Estado *</label>
              <select
                value={estadoCliente ? 'true' : 'false'}
                onChange={(e) => setEstadoCliente(e.target.value === 'true')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !nombre.trim()}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiCheckCircle size={14} /> {clienteEditando ? 'Actualizar Cliente' : 'Guardar Cliente'}</>}
          </button>
        </form>
      ) : (
        /* VISTA: LISTADO DE CLIENTES */
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {cargando ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <FiLoader className="animate-spin text-lg" />
            </div>
          ) : clientes.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay clientes registrados en el sistema.</p>
          ) : (
            clientes.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.es_empresa ? (
                      <FiBriefcase className="text-emerald-400" size={16} />
                    ) : (
                      <FiUser className="text-blue-400" size={16} />
                    )}
                    <span className="text-xs font-bold text-white">{c.nombre_cliente}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    c.estado_cliente 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {c.estado_cliente ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">
                    Tipo: <strong className="text-zinc-300">{c.es_empresa ? 'Empresa' : 'Particular'}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => abrirEditar(c)}
                      disabled={isPending}
                      className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <FiEdit2 size={12} /> Editar
                    </button>

                    {confirmandoBaja === c.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ejecutarCambioEstado(c.id, !c.estado_cliente)}
                          disabled={isPending}
                          title={c.estado_cliente ? "Confirmar desactivación" : "Confirmar activación"}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all"
                        >
                          <FiCheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmandoBaja(null)}
                          disabled={isPending}
                          title="Cancelar"
                          className="p-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmandoBaja(c.id)}
                        disabled={isPending}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all ${
                          c.estado_cliente 
                            ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30' 
                            : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        <FiTrash2 size={12} /> {c.estado_cliente ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}