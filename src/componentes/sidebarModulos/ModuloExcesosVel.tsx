'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { obtenerResumenExcesos, obtenerDetalleExcesosMovil } from '@/actions/excesos/actions';
import { 
  FiArrowLeft, 
  FiAlertTriangle, 
  FiCalendar, 
  FiActivity, 
  FiChevronRight, 
  FiClock, 
  FiLoader, 
  FiMapPin
} from 'react-icons/fi';

export default function ModuloExcesosVel() {
 const { volverAlMenu, excesoSeleccionadoMapa, setExcesoSeleccionadoMapa } = useUI(); // Asegúrate de tener setter en tu contexto UI
  const [resumen, setResumen] = useState<any[]>([]);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Fechas por defecto: Último mes
  const hoy = new Date().toISOString().split('T')[0];
  const haceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [fechaDesde, setFechaDesde] = useState(haceUnMes);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [limiteVelocidad, setLimiteVelocidad] = useState(100);

  // Detalle del equipo seleccionado
  const [patenteSeleccionada, setPatenteSeleccionada] = useState<string | null>(null);
  const [detalleExcesos, setDetalleExcesos] = useState<any[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const cargarResumen = useCallback(async () => {
    setCargandoResumen(true);
    const desdeIso = fechaDesde ? `${fechaDesde}T00:00:00Z` : undefined;
    const hastaIso = fechaHasta ? `${fechaHasta}T23:59:59Z` : undefined;

    const res = await obtenerResumenExcesos(desdeIso, hastaIso, Number(limiteVelocidad));
    if (res.exito) {
      setResumen(res.data);
    }
    setCargandoResumen(false);
  }, [fechaDesde, fechaHasta, limiteVelocidad]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const seleccionarMovil = (patente: string) => {
    setPatenteSeleccionada(patente);
    setCargandoDetalle(true);

    const desdeIso = fechaDesde ? `${fechaDesde}T00:00:00Z` : undefined;
    const hastaIso = fechaHasta ? `${fechaHasta}T23:59:59Z` : undefined;

    startTransition(async () => {
      const res = await obtenerDetalleExcesosMovil(patente, desdeIso, hastaIso, Number(limiteVelocidad));
      if (res.exito) {
        setDetalleExcesos(res.data);
      }
      setCargandoDetalle(false);
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Cabecera y botón de retorno */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (patenteSeleccionada) {
              setPatenteSeleccionada(null);
            } else {
              volverAlMenu();
              setExcesoSeleccionadoMapa(null);
            }
          }}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <FiArrowLeft /> {patenteSeleccionada ? 'Volver al listado' : 'Volver al menú principal'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <FiAlertTriangle className="text-amber-400" size={15} />
          {patenteSeleccionada ? `Excesos: ${patenteSeleccionada}` : 'Control Excesos de Velocidad'}
        </h2>
      </div>

      {/* Filtros compactos adaptados al sidebar */}
      {!patenteSeleccionada && (
        <div className="p-2.5 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                <FiCalendar size={10} /> Desde
              </label>
              <input 
                type="date" 
                value={fechaDesde} 
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-[11px] text-white outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                <FiCalendar size={10} /> Hasta
              </label>
              <input 
                type="date" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-[11px] text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <FiActivity size={10} className="text-amber-400" /> Límite km/h:
            </span>
            <input 
              type="number" 
              value={limiteVelocidad} 
              onChange={(e) => setLimiteVelocidad(Number(e.target.value))}
              className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg p-1 text-center font-bold text-white text-xs outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Contenido Dinámico (Listado o Detalle) */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {cargandoResumen ? (
          <div className="flex justify-center p-8 text-zinc-500">
            <FiLoader className="animate-spin text-lg" />
          </div>
        ) : !patenteSeleccionada ? (
          // LISTADO DE EQUIPOS RESUMEN
          resumen.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay registros de excesos en este rango.</p>
          ) : (
            resumen.map((item) => (
              <div
                key={item.patente_movil}
                onClick={() => seleccionarMovil(item.patente_movil)}
                className="p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">{item.patente_movil}</span>
                    <span className="text-[10px] text-zinc-400">Ver historial de infracciones</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-md font-bold border border-amber-500/20">
                    {item.total_excesos} excesos
                  </span>
                  <FiChevronRight className="text-zinc-500 group-hover:text-white transition-colors" size={14} />
                </div>
              </div>
            ))
          )
        ) :(
          cargandoDetalle || isPending ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <FiLoader className="animate-spin text-lg" />
            </div>
          ) : detalleExcesos.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay detalles disponibles para este móvil.</p>
          ) : (
            detalleExcesos.map((det) => (
              <div
                key={det.id}
                className="p-2.5 bg-zinc-800/40 border border-zinc-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
                    <FiClock size={12} className="text-zinc-500" />
                    <span>{new Date(det.fecha_reporte).toLocaleString()}</span>
                  </div>
                  <span className="bg-red-500/10 text-red-400 font-bold px-2 py-0.5 rounded text-[11px] border border-red-500/20">
                    {det.velocidad_equipo} km/h
                  </span>
                </div>
                
                <div className="text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-800/60 flex justify-between items-center">
                  <span>Lat: {det.latitud?.toFixed(5)} | Lon: {det.longitud?.toFixed(5)}</span>
                  
                  {/* Botón añadido para aislar y ver el exceso en el mapa limpio */}
                <button
                
                    onClick={() => setExcesoSeleccionadoMapa({ ...det, patente_movil: patenteSeleccionada })}
                    className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <FiMapPin size={11} /> Ver en mapa
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}