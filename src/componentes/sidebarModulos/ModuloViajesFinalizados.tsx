'use client';

import { useState, useEffect } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { obtenerViajesFinalizados } from '@/actions/viajes/actions';
import { FiArrowLeft, FiLoader, FiMapPin, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

interface ViajeFinalizado {
  id_viaje: number;
  patente_equipo: string;
  fecha_hora_inicio: string;
  fecha_hora_sal_des: string;
  total_desvios: number;
}

export default function ModuloViajesFinalizados() {
  const { volverAlMenu, viajeSeleccionadoMapa, setViajeSeleccionadoMapa } = useUI();
  const [viajes, setViajes] = useState<ViajeFinalizado[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState<number | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const res = await obtenerViajesFinalizados();
      if (res.exito) {
        setViajes(res.data);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  const handleVerEnMapa = (idViaje: number) => {
    setViajeSeleccionadoId(idViaje);
    setViajeSeleccionadoMapa(idViaje);
  };

  const handleVolver = () => {
    setViajeSeleccionadoMapa(null);
    volverAlMenu();
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
        onClick={handleVolver}
        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
      >
        <FiArrowLeft /> Volver al menú principal
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Auditoría de Viajes</h2>
        {viajeSeleccionadoMapa && (
          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Visualizando
          </span>
        )}
      </div>

      <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
        {viajes?.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">No hay viajes finalizados registrados.</p>
        ) : (
          viajes?.map((v) => (
            <div 
              key={v.id_viaje}
              className={`p-3 rounded-xl border transition-all ${
                viajeSeleccionadoId === v.id_viaje && viajeSeleccionadoMapa
                  ? 'bg-emerald-800/40 border-emerald-500/60' 
                  : 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-white">Vehículo: {v.patente_equipo}</span>
                  <p className="text-[10px] text-zinc-400">ID Viaje: #{v.id_viaje}</p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border ${
                  Number(v.total_desvios) > 0 
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' 
                    : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                }`}>
                  {Number(v.total_desvios) > 0 ? <FiAlertTriangle size={10} /> : <FiCheckCircle size={10} />}
                  <span>{String(v.total_desvios)} desvíos</span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 space-y-0.5 mb-3">
                <p>Inicio: {new Date(v.fecha_hora_inicio).toLocaleString()}</p>
                <p>Fin: {new Date(v.fecha_hora_sal_des).toLocaleString()}</p>
              </div>

              <button
                onClick={() => handleVerEnMapa(v.id_viaje)}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <FiMapPin size={14} />
                {viajeSeleccionadoId === v.id_viaje && viajeSeleccionadoMapa 
                  ? 'Visualizando...' 
                  : 'Ver en Mapa'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}