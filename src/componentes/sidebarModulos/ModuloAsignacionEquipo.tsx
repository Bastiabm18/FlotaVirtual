'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { 
  getEquiposAsignaciones, 
  getConductoresDisponibles, 
  asignarConductorEquipo, 
  finalizarAsignacion 
} from '@/actions/gestion/actions';
import { AsignacionEquipoDetalle, ConductorData } from '@/types/rutas';
import { 
  FiArrowLeft, 
  FiTruck, 
  FiUserCheck, 
  FiUserX, 
  FiLoader, 
  FiCheckCircle, 
  FiX 
} from 'react-icons/fi';

export default function ModuloAsignacionEquipo() {
  const { volverAlMenu } = useUI();
  const [asignaciones, setAsignaciones] = useState<AsignacionEquipoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Control para vista de asignación de conductor a un equipo específico
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<AsignacionEquipoDetalle | null>(null);
  const [conductoresDisp, setConductoresDisp] = useState<ConductorData[]>([]);
  const [conductorElegido, setConductorElegido] = useState<string>('');

  // Control para confirmar la finalización con botones en línea (sin confirm nativo)
  const [equipoConfirmandoFin, setEquipoConfirmandoFin] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    const res = await getEquiposAsignaciones();
    console.log(res);
    if (res.data) setAsignaciones(res.data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirAsignar = async (eq: AsignacionEquipoDetalle) => {
    setEquipoSeleccionado(eq);
    const res = await getConductoresDisponibles();
    if (res.data) setConductoresDisp(res.data);
    setConductorElegido('');
  };

  const ejecutarAsignacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoSeleccionado || !conductorElegido) return;

    startTransition(async () => {
      const res = await asignarConductorEquipo(equipoSeleccionado.id_equipo, conductorElegido);
      if (res.exito) {
        setEquipoSeleccionado(null);
        cargarDatos();
      } else {
        console.error(`Error al asignar: ${res.error}`);
      }
    });
  };

  const ejecutarFinalizacion = (id_asig: number | null, id_eq: number, id_cond: string | null) => {
    if (!id_asig || !id_cond) return;

    startTransition(async () => {
      const res = await finalizarAsignacion(id_asig, id_eq, id_cond);
      if (res.exito) {
        setEquipoConfirmandoFin(null);
        cargarDatos();
      } else {
        console.error(`Error al finalizar asignación: ${res.error}`);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <button
        onClick={() => { if (equipoSeleccionado) { setEquipoSeleccionado(null); } else { volverAlMenu(); } }}
        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
      >
        <FiArrowLeft /> {equipoSeleccionado ? 'Volver al listado' : 'Volver al menú principal'}
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {equipoSeleccionado ? `Asignar Conductor a [${equipoSeleccionado.patente_equipo}]` : 'Asignación de Equipos'}
        </h2>
      </div>

      {/* VISTA: SELECCIONAR CONDUCTOR PARA UN EQUIPO */}
      {equipoSeleccionado ? (
        <form onSubmit={ejecutarAsignacion} className="space-y-3">
          <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-white">Equipo: {equipoSeleccionado.marca_equipo}</p>
            <p className="text-[11px] text-zinc-400">Patente: {equipoSeleccionado.patente_equipo}</p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Seleccionar Conductor Disponible *</label>
            {conductoresDisp.length === 0 ? (
              <p className="text-xs text-amber-400 p-2 bg-amber-950/20 border border-amber-500/30 rounded-lg">
                No hay conductores con estado 'Disponible' en este momento.
              </p>
            ) : (
              <select
                required
                value={conductorElegido}
                onChange={(e) => setConductorElegido(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Seleccione un conductor --</option>
                {conductoresDisp.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellidopat} (RUT: {c.rut}) - Lic: {c.tipo_licencia}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || conductoresDisp.length === 0 || !conductorElegido}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiUserCheck size={14} /> Confirmar Asignación</>}
          </button>
        </form>
      ) : (
        /* VISTA: LISTADO DE EQUIPOS */
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {cargando ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <FiLoader className="animate-spin text-lg" />
            </div>
          ) : asignaciones.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay equipos registrados en el sistema.</p>
          ) : (
            asignaciones.map((eq) => (
              <div
                key={eq.id_equipo}
                className="p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiTruck className="text-emerald-400" size={16} />
                    <span className="text-xs font-bold text-white">{eq.patente_equipo}</span>
                    <span className="text-[10px] text-zinc-400">({eq.marca_equipo})</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    eq.nombre_estado_equipo === 'Disponible' 
                      ? 'bg-blue-500/20 text-emerald-300 border-blue-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {eq.nombre_estado_equipo}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-400">Conductor Asignado:</p>
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {eq.nombre_conductor || 'Sin conductor asignado'}
                    </p>
                  </div>

                  {eq.nombre_conductor ? (
                    equipoConfirmandoFin === eq.id_equipo ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => ejecutarFinalizacion(eq.id_asignacion, eq.id_equipo, eq.id_conductor)}
                          disabled={isPending}
                          title="Confirmar finalización"
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all"
                        >
                          <FiCheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => setEquipoConfirmandoFin(null)}
                          disabled={isPending}
                          title="Cancelar"
                          className="p-1.5 bg-red-700 hover:bg-red-600 text-red-300 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEquipoConfirmandoFin(eq.id_equipo)}
                        disabled={isPending}
                        className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
                      >
                        <FiUserX size={12} /> Finalizar
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => abrirAsignar(eq)}
                      disabled={isPending || eq.nombre_estado_equipo !== 'Disponible'}
                      title={eq.nombre_estado_equipo !== 'Disponible' ? 'No se puede asignar: El equipo está en mantención u ocupado' : 'Asignar conductor'}
                      className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiUserCheck size={12} /> Asignar
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