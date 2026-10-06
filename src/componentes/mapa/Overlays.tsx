'use client';

import { useState } from 'react';
import { useMapa, EstadoCapas } from '@/contexto/ContextoMapa';
import { 
  FiTruck, 
  FiMapPin, 
  FiLayers, 
  FiEye, 
  FiEyeOff, 
  FiMoon, 
  FiGlobe,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { FaRoute } from 'react-icons/fa';

export default function Overlays() {
  const { capasVisibles, alternarCapa, estiloActual, cambiarEstilo, estaListo } = useMapa();
  const [abierto, setAbierto] = useState(true);

  const opcionesCapas: { clave: keyof EstadoCapas; etiqueta: string; icono: any }[] = [
    { clave: 'vehiculos', etiqueta: 'Vehículos', icono: FiTruck },
    { clave: 'rutas', etiqueta: 'Rutas', icono: FaRoute  },
    { clave: 'geocercas', etiqueta: 'Geocercas', icono: FiLayers },
  ];

  return (
    <div className="absolute top-4 right-12 z-20 w-72 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl text-white overflow-hidden transition-all">
      {/* Trigger Header */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full p-3 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/80 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <FiLayers className="text-blue-400 text-sm" />
          <span>CAPAS Y ENTORNOS</span>
        </div>
        {abierto ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>

      {abierto && (
        <div className="p-4 space-y-5">
          {/* Engine Status */}
          <div className="flex items-center justify-between text-xs bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-zinc-400">Mapbox Engine:</span>
            <span className={`font-medium ${estaListo ? 'text-emerald-400' : 'text-amber-400'}`}>
              {estaListo ? 'Conectado' : 'Cargando tiles...'}
            </span>
          </div>

          {/* Capas Telemetría */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
              Visibilidad de Capas
            </span>
            <div className="flex flex-col gap-2">
              {opcionesCapas.map(({ clave, etiqueta, icono: Icono }) => {
                const activa = capasVisibles[clave];
                return (
                  <button
                    key={clave}
                    onClick={() => alternarCapa(clave)}
                    className={`flex items-center justify-between w-full p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      activa
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 font-medium'
                        : 'bg-zinc-800/30 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icono className="text-sm" />
                      <span>{etiqueta}</span>
                    </div>
                    {activa ? <FiEye /> : <FiEyeOff className="text-zinc-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estilos Base 
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
              Estilo de Mapa
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => cambiarEstilo('mapbox://styles/mapbox/dark-v11')}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  estiloActual.includes('dark')
                    ? 'bg-zinc-800 border-zinc-600 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                <FiMoon />
                Oscuro
              </button>
              <button
                onClick={() => cambiarEstilo('mapbox://styles/mapbox/satellite-streets-v12')}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  estiloActual.includes('satellite')
                    ? 'bg-zinc-800 border-zinc-600 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                <FiGlobe />
                Satelital
              </button>
            </div>
          </div>
          */}
        </div>
      )}
    </div>
  );
}