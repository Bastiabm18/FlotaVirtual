'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { 
  getProductosListado, 
  getEstadosProductoList, 
  guardarProducto, 
  cambiarEstadoProducto, 

} from '@/actions/gestion/actions';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiX, 
  FiLoader, 
  FiBox, 
  FiTag 
} from 'react-icons/fi';
import { EstadoProductoOption, ProductoData } from '@/types/rutas';

export default function ModuloProducto() {
  const { volverAlMenu } = useUI();
  const [productos, setProductos] = useState<ProductoData[]>([]);
  const [estadosProd, setEstadosProd] = useState<EstadoProductoOption[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Control de vista y edición
  const [modoFormulario, setModoFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoData | null>(null);

  // Formulario fields
  const [nombreProducto, setNombreProducto] = useState('');
  const [idEstadoProd, setIdEstadoProd] = useState<number>(1);
  const [estadoLogico, setEstadoLogico] = useState(true);

  // Confirmación de cambio de estado / desactivación
  const [confirmandoBaja, setConfirmandoBaja] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    const [resProd, resEst] = await Promise.all([
      getProductosListado(),
      getEstadosProductoList(),
    ]);

    if (resProd.data) setProductos(resProd.data);
    if (resEst.data) setEstadosProd(resEst.data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirNuevo = () => {
    setProductoEditando(null);
    setNombreProducto('');
    setIdEstadoProd(estadosProd[0]?.id || 1);
    setEstadoLogico(true);
    setModoFormulario(true);
  };

  const abrirEditar = (prod: ProductoData) => {
    setProductoEditando(prod);
    setNombreProducto(prod.nombre_producto);
    setIdEstadoProd(prod.id_estado_producto);
    setEstadoLogico(prod.estado);
    setModoFormulario(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreProducto.trim()) return;

    startTransition(async () => {
      const res = await guardarProducto({
        id: productoEditando ? productoEditando.id : undefined,
        nombre_producto: nombreProducto.trim(),
        id_estado_producto: Number(idEstadoProd),
        estado: estadoLogico,
      });

      if (res.exito) {
        setModoFormulario(false);
        cargarDatos();
      } else {
        alert(`Error al guardar producto: ${res.error}`);
      }
    });
  };

  const ejecutarCambioEstado = (id: number, nuevoEstado: boolean) => {
    startTransition(async () => {
      const res = await cambiarEstadoProducto(id, nuevoEstado);
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
            <FiPlus size={14} /> Nuevo Producto
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {modoFormulario ? (productoEditando ? 'Editar Producto' : 'Registrar Nuevo Producto') : 'Gestión de Productos'}
        </h2>
      </div>

      {modoFormulario ? (
        /* VISTA: FORMULARIO CREAR / EDITAR */
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Nombre del Producto *</label>
            <input
              required
              type="text"
              placeholder="Ej: Madera de Pino dimensionada"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Estado Interno (Catálogo) *</label>
              <select
                value={idEstadoProd}
                onChange={(e) => setIdEstadoProd(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {estadosProd.map((est) => (
                  <option key={est.id} value={est.id}>{est.nombre_estado}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Disponibilidad del Sistema *</label>
              <select
                value={estadoLogico ? 'true' : 'false'}
                onChange={(e) => setEstadoLogico(e.target.value === 'true')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="true">Disponible (Activo)</option>
                <option value="false">No Disponible (Inactivo)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !nombreProducto.trim()}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiCheckCircle size={14} /> {productoEditando ? 'Actualizar Producto' : 'Guardar Producto'}</>}
          </button>
        </form>
      ) : (
        /* VISTA: LISTADO DE PRODUCTOS */
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {cargando ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <FiLoader className="animate-spin text-lg" />
            </div>
          ) : productos.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay productos registrados en el sistema.</p>
          ) : (
            productos.map((prod) => (
              <div
                key={prod.id}
                className="p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiBox className="text-emerald-400" size={16} />
                    <span className="text-xs font-bold text-white">{prod.nombre_producto}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    prod.estado 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {prod.estado ? 'Disponible' : 'No Disponible'}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-zinc-400">
                    <FiTag size={12} />
                    <span>Clasificación: <strong className="text-zinc-300">{prod.nombre_estado_producto}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => abrirEditar(prod)}
                      disabled={isPending}
                      className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <FiEdit2 size={12} /> Editar
                    </button>

                    {confirmandoBaja === prod.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ejecutarCambioEstado(prod.id, !prod.estado)}
                          disabled={isPending}
                          title={prod.estado ? "Confirmar marcar como no disponible" : "Confirmar marcar como disponible"}
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
                        onClick={() => setConfirmandoBaja(prod.id)}
                        disabled={isPending}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all ${
                          prod.estado 
                            ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30' 
                            : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        <FiTrash2 size={12} /> {prod.estado ? 'No Disponible' : 'Disponible'}
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