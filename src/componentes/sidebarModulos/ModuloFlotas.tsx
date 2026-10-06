'use client';

import React, { useEffect, useState } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { createClient } from '@/lib/supabase/client';
import { FiArrowLeft, FiTruck, FiNavigation } from 'react-icons/fi';
import { MdOutlineTravelExplore } from "react-icons/md";
import { useMapa } from '@/contexto/ContextoMapa';

export interface Equipo {
  id_equipo: number;
  patente_equipo: string;
  marca_equipo: string;
  anio_equipo: number;
  latitud_equipo: number;
  longitud_equipo: number;
  heading_equipo: number;
  num_chasis_equipo: string;
}

export default function ModuloFlotas() {
  const { volverAlMenu } = useUI();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const { mapaRef } = useMapa(); // necesario para manejar el mapa desde este módulo, si es necesario

  useEffect(() => {
    const cargarEquipos = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('obtener_equipos');
      if (!error && data) {
        setEquipos(data);
      }
      setCargando(false);
    };

    cargarEquipos();
  }, []);

  return (
    <div className="space-y-4">
      {/* Cabecera del Módulo */}
      <div className="flex items-center gap-3">
        <button
          onClick={volverAlMenu}
          className="p-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-all cursor-pointer border border-zinc-700/50"
        >
          <FiArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-sm font-bold text-white">Gestión de Flotas</h2>
          <p className="text-[11px] text-zinc-400">Monitoreo GPS en tiempo real</p>
        </div>
      </div>

      {/* Listado de Equipos */}
      <div className="space-y-2 mt-2">
        {cargando ? (
          <div className="text-xs text-zinc-500 text-center py-6">Cargando unidades...</div>
        ) : equipos.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-6">No hay equipos registrados.</div>
        ) : (
          equipos.map((eq) => (
            <div
              key={eq.id_equipo}
              className="p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                    <FiTruck size={14} />
                  </div>
                  <span className="font-bold text-xs text-white tracking-wider">{eq.patente_equipo}</span>
                </div>
                {/* ---  BOTÓN para hacer el fly to --- */}
                   <button
                     onClick={() => {
                       if (mapaRef.current) {
                         mapaRef.current.flyTo({
                           center: [eq.longitud_equipo, eq.latitud_equipo],
                           zoom: 15,
                           essential: true,
                         });
                       }
                     }}
                     title="Ir a ubicación"
                     className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[10px] font-semibold rounded-lg border border-blue-500/30 transition-all cursor-pointer"
                   >
                     <MdOutlineTravelExplore  size={12} />
                     <span>Ir</span>
                   </button>
                   {/* -----------fin boton fly to-------------- */}
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                  {eq.marca_equipo} ({eq.anio_equipo})
                </span>
              </div>

              <div className="text-[11px] text-zinc-400 grid grid-cols-2 gap-1 pt-1 border-t border-zinc-800/80">
                <div>Chasis: <span className="text-zinc-300">{eq.num_chasis_equipo}</span></div>
                <div className="flex items-center gap-1 justify-end text-emerald-400">
                  <FiNavigation size={12} style={{ transform: `rotate(${eq.heading_equipo}deg)` }} />
                  <span>{eq.heading_equipo}° Dir.</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}