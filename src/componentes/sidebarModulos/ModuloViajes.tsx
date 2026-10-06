'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { 
  getViajesActivos, 
  getEquiposDisponiblesViaje, 
  getPoligonosList, 
  getClientesList, 
  getProductosList, 
  crearViaje, 
  finalizarViaje 
} from '@/actions/gestion/actions';
import { ViajeDetalle, EquipoAsignadoDisponible, PoligonoOption, ClienteOption, ProductoOption } from '@/types/viajes';
import { 
  FiArrowLeft, 
  FiNavigation, 
  FiPlus, 
  FiCheckCircle, 
  FiX, 
  FiLoader, 
  FiTruck, 
  FiUser, 
  FiMapPin, 
  FiBox 
} from 'react-icons/fi';

export default function ModuloViajes() {
  const { volverAlMenu } = useUI();
  const [viajes, setViajes] = useState<ViajeDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Control de vista: listado o formulario de creación
  const [creandoViaje, setCreandoViaje] = useState(false);

  // Listas desplegables para el formulario
  const [equiposDisp, setEquiposDisp] = useState<EquipoAsignadoDisponible[]>([]);
  const [poligonos, setPoligonos] = useState<PoligonoOption[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [productos, setProductos] = useState<ProductoOption[]>([]);

  // Formulario de nuevo viaje
  const [form, setForm] = useState({
    id_equipo: '',
    id_origen: '',
    id_destino: '',
    id_cliente: '',
    id_producto: '',
    guia_numero: '',
    cantidad: '',
    peso: '',
  });

  const [confirmandoFin, setConfirmandoFin] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    const res = await getViajesActivos();
    if (res.data) setViajes(res.data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirFormulario = async () => {
    setCargando(true);
    const [resEq, resPol, resCli, resProd] = await Promise.all([
      getEquiposDisponiblesViaje(),
      getPoligonosList(),
      getClientesList(),
      getProductosList(),
    ]);

    if (resEq.data) setEquiposDisp(resEq.data);
    if (resPol.data) setPoligonos(resPol.data);
    if (resCli.data) setClientes(resCli.data);
    if (resProd.data) setProductos(resProd.data);

    setForm({
      id_equipo: '',
      id_origen: '',
      id_destino: '',
      id_cliente: '',
      id_producto: '',
      guia_numero: '',
      cantidad: '',
      peso: '',
    });
    setCreandoViaje(true);
    setCargando(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const equipoElegido = equiposDisp.find(eq => eq.id_equipo === Number(form.id_equipo));
    if (!equipoElegido) return;

    startTransition(async () => {
      const res = await crearViaje({
        id_equipo: equipoElegido.id_equipo,
        id_conductor: equipoElegido.id_conductor,
        id_origen: form.id_origen,
        id_destino: form.id_destino,
        id_cliente: Number(form.id_cliente),
        id_producto: Number(form.id_producto),
        guia_numero: form.guia_numero,
        cantidad: Number(form.cantidad),
        peso: Number(form.peso),
      });

      if (res.exito) {
        setCreandoViaje(false);
        cargarDatos();
      } else {
        alert(`Error al crear viaje: ${res.error}`);
      }
    });
  };

  const ejecutarFinalizacion = (id_viaje: number) => {
    startTransition(async () => {
      const res = await finalizarViaje(id_viaje);
      if (res.exito) {
        setConfirmandoFin(null);
        cargarDatos();
      } else {
        alert(`Error al finalizar viaje: ${res.error}`);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (creandoViaje) { setCreandoViaje(false); } else { volverAlMenu(); } }}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <FiArrowLeft /> {creandoViaje ? 'Volver al listado' : 'Volver al menú principal'}
        </button>

        {!creandoViaje && (
          <button
            onClick={abrirFormulario}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <FiPlus size={14} /> Nuevo Viaje
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {creandoViaje ? 'Generar Nuevo Viaje' : 'Gestión de Viajes Activos'}
        </h2>
      </div>

      {creandoViaje ? (
        /* VISTA: FORMULARIO CREAR VIAJE */
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Equipo y Conductor Disponible *</label>
            {equiposDisp.length === 0 ? (
              <p className="text-xs text-amber-400 p-2 bg-amber-950/20 border border-amber-500/30 rounded-lg">
                No hay equipos con conductor asignado disponibles para iniciar viaje.
              </p>
            ) : (
              <select
                required
                value={form.id_equipo}
                onChange={(e) => setForm({ ...form, id_equipo: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Seleccione equipo --</option>
                {equiposDisp.map((eq) => (
                  <option key={eq.id_equipo} value={eq.id_equipo}>
                    [{eq.patente_equipo}] {eq.marca_equipo} - Cond: {eq.nombre_conductor}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Origen (Polígono) *</label>
              <select
                required
                value={form.id_origen}
                onChange={(e) => setForm({ ...form, id_origen: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Origen --</option>
                {poligonos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Destino (Polígono) *</label>
              <select
                required
                value={form.id_destino}
                onChange={(e) => setForm({ ...form, id_destino: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Destino --</option>
                {poligonos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Cliente *</label>
              <select
                required
                value={form.id_cliente}
                onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre_cliente}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Producto *</label>
              <select
                required
                value={form.id_producto}
                onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Producto --</option>
                {productos.map((pr) => (
                  <option key={pr.id} value={pr.id}>{pr.nombre_producto}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-white">Datos de la Guía de Carga</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400">Nº Guía *</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: G-00123"
                  value={form.guia_numero}
                  onChange={(e) => setForm({ ...form, guia_numero: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400">Cantidad *</label>
                <input
                  required
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400">Peso (kg) *</label>
                <input
                  required
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={form.peso}
                  onChange={(e) => setForm({ ...form, peso: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || equiposDisp.length === 0}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiNavigation size={14} /> Iniciar y Registrar Viaje</>}
          </button>
        </form>
      ) : (
        /* VISTA: LISTADO DE VIAJES ACTIVOS */
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {cargando ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <FiLoader className="animate-spin text-lg" />
            </div>
          ) : viajes.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay viajes en ejecución actualmente.</p>
          ) : (
            viajes.map((v) => (
              <div
                key={v.id_viaje}
                className="p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiNavigation className="text-emerald-400" size={16} />
                    <span className="text-xs font-bold text-white">Viaje #{v.id_viaje}</span>
                    <span className="text-[10px] text-zinc-400">({v.patente_equipo} - {v.marca_equipo})</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {v.nombre_estado_viaje}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <FiUser size={12} className="text-zinc-500 shrink-0" />
                    <span className="truncate">Cond: {v.nombre_conductor}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <FiTruck size={12} className="text-zinc-500 shrink-0" />
                    <span className="truncate">Cliente: {v.nombre_cliente}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <FiMapPin size={12} className="text-emerald-500 shrink-0" />
                    <span className="truncate">Orig: {v.nombre_origen}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <FiMapPin size={12} className="text-amber-500 shrink-0" />
                    <span className="truncate">Dest: {v.nombre_destino}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-zinc-400">
                    <FiBox size={12} />
                    <span>Guía: <strong>{v.guia_numero}</strong> ({v.nombre_producto} - {v.peso_carga} kg)</span>
                  </div>

                  {confirmandoFin === v.id_viaje ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => ejecutarFinalizacion(v.id_viaje)}
                        disabled={isPending}
                        title="Confirmar finalización de viaje"
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all"
                      >
                        <FiCheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmandoFin(null)}
                        disabled={isPending}
                        title="Cancelar"
                        className="p-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmandoFin(v.id_viaje)}
                      disabled={isPending}
                      className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      <FiCheckCircle size={12} /> Finalizar Viaje
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}