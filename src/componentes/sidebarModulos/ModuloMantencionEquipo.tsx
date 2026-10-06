// Y aquí tienes el componente completo ajustado con el estado necesario para manejar la confirmación inline sin usar window.confirm:

'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { 
  getMantencionesListado, 
  finalizarMantencion, 
  crearMantencionFalla, 
} from '@/actions/mantencion/actions';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiTool, 
  FiCheckCircle, 
  FiLoader, 
  FiClock, 
  FiAlertTriangle,
  FiX 
} from 'react-icons/fi';
import { MantencionData } from '@/types/mantencion';

export default function ModuloMantencionEquipo() {
  const { volverAlMenu } = useUI();
  const [mantenciones, setMantenciones] = useState<MantencionData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [modoNuevo, setModoNuevo] = useState(false);
  const [idEquipoInput, setIdEquipoInput] = useState('');
  const [idMecanicoInput, setIdMecanicoInput] = useState('1');
  const [obsInput, setObsInput] = useState('');
  
  // Estado para controlar la confirmación inline con Check / X
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    const res = await getMantencionesListado();
    if (res.data) setMantenciones(res.data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearFalla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEquipoInput.trim()) return;

    startTransition(async () => {
      const res = await crearMantencionFalla({
        id_equipo: Number(idEquipoInput),
        id_mecanico: Number(idMecanicoInput),
        observaciones: obsInput.trim(),
      });

      if (res.exito) {
        setModoNuevo(false);
        setIdEquipoInput('');
        setObsInput('');
        cargarDatos();
      } else {
        alert(`Error: ${res.error}`);
      }
    });
  };

  const handleFinalizar = (idMantencion: number, idEquipo: number) => {
    startTransition(async () => {
      const res = await finalizarMantencion(idMantencion, idEquipo);
      if (res.exito) {
        setConfirmandoId(null);
        cargarDatos();
      } else {
        alert(`Error al finalizar: ${res.error}`);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (modoNuevo) { setModoNuevo(false); } else { volverAlMenu(); } }}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <FiArrowLeft /> {modoNuevo ? 'Volver al listado' : 'Volver al menú principal'}
        </button>

        {!modoNuevo && (
          <button
            onClick={() => setModoNuevo(true)}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <FiPlus size={14} /> Registrar Falla / Mantención
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {modoNuevo ? 'Nueva Mantención por Falla' : 'Control y Historial de Mantenciones'}
        </h2>
      </div>

      {modoNuevo ? (
        <form onSubmit={handleCrearFalla} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">ID del Equipo *</label>
            <input
              required
              type="number"
              placeholder="Ej: 1"
              value={idEquipoInput}
              onChange={(e) => setIdEquipoInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">ID del Mecánico Encargado *</label>
            <input
              required
              type="number"
              value={idMecanicoInput}
              onChange={(e) => setIdMecanicoInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Descripción / Motivo de la Falla *</label>
            <textarea
              required
              rows={3}
              placeholder="Detalle el problema mecánico reportado..."
              value={obsInput}
              onChange={(e) => setObsInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white resize-none focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !idEquipoInput.trim()}
            className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiAlertTriangle size={14} /> Registrar y Bloquear Equipo</>}
          </button>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {cargando ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <FiLoader className="animate-spin text-lg" />
            </div>
          ) : mantenciones.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay registros de mantenciones.</p>
          ) : (
            mantenciones.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiTool className="text-orange-400" size={16} />
                    <span className="text-xs font-bold text-white">
                      Equipo: {m.patente_equipo} ({m.marca_equipo})
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    m.estado 
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {m.estado ? 'En Mantención (Activa)' : 'Finalizada'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  <div>Tipo: <strong className="text-zinc-300">{m.nombre_tipo}</strong></div>
                  <div>Mecánico: <strong className="text-zinc-300">{m.nombre_mecanico}</strong></div>
                  <div className="col-span-2">Obs: <strong className="text-zinc-300">{m.observaciones || 'Sin observaciones'}</strong></div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <FiClock size={12} />
                    <span>Inicio: {new Date(m.fecha_ini).toLocaleDateString()}</span>
                  </div>

                  {m.estado && (
                    <div className="flex items-center gap-1.5">
                      {confirmandoId === m.id ? (
                        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-700">
                          <span className="text-[10px] text-zinc-300 px-1">¿Finalizar?</span>
                          <button
                            onClick={() => handleFinalizar(m.id, m.id_equipo)}
                            disabled={isPending}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer transition-colors"
                            title="Confirmar"
                          >
                            <FiCheckCircle size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmandoId(null)}
                            disabled={isPending}
                            className="p-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded cursor-pointer transition-colors"
                            title="Cancelar"
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmandoId(m.id)}
                          disabled={isPending}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <FiCheckCircle size={12} /> Finalizar Mantención
                        </button>
                      )}
                    </div>
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