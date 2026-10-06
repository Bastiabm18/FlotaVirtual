'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getClimaPorCoordenadas } from '@/actions/clima/actions';
import { FiLoader, FiAlertTriangle, FiMapPin, FiWind, FiDroplet } from 'react-icons/fi';

interface WidgetClimaProps {
  mapaInstancia: any; // Instancia de Mapbox GL map
}

export default function WidgetClima({ mapaInstancia }: WidgetClimaProps) {
  const [cargando, setCargando] = useState(true);
  const [datosClima, setDatosClima] = useState<any>(null);
  const [error, setError] = useState(false);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ultimaPosRef = useRef<{ lat: number; lon: number } | null>(null);

  const consultarClima = useCallback(async (lat: number, lon: number) => {
    setCargando(true);
    setError(false);

    const res :any = await getClimaPorCoordenadas(lat, lon);
    //console.log(res);
    if (res.exito && res.data) {
      setDatosClima(res.data);
    } else {
      setError(true);
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    if (!mapaInstancia) return;

    const manejarMovimientoMapa = () => {
      // Validar por seguridad que la función exista en la instancia actual
      if (typeof mapaInstancia.getCenter !== 'function') return;

      const center = mapaInstancia.getCenter();
      const lat = Math.round(center.lat * 100) / 100;
      const lon = Math.round(center.lng * 100) / 100;

      if (ultimaPosRef.current && ultimaPosRef.current.lat === lat && ultimaPosRef.current.lon === lon) {
        return;
      }

      ultimaPosRef.current = { lat, lon };

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        consultarClima(lat, lon);
      }, 1500);
    };

    // Si Mapbox ya cargó, inicializamos directo; si no, esperamos al evento 'load'
    const iniciarWidget = () => {
      if (typeof mapaInstancia.getCenter !== 'function') return;
      
      const initialCenter = mapaInstancia.getCenter();
      const initLat = Math.round(initialCenter.lat * 100) / 100;
      const initLon = Math.round(initialCenter.lng * 100) / 100;
      
      ultimaPosRef.current = { lat: initLat, lon: initLon };
      consultarClima(initLat, initLon);

      mapaInstancia.on('moveend', manejarMovimientoMapa);
    };

    if (mapaInstancia.loaded()) {
      iniciarWidget();
    } else {
      mapaInstancia.on('load', iniciarWidget);
    }

    return () => {
      if (mapaInstancia && typeof mapaInstancia.off === 'function') {
        mapaInstancia.off('load', iniciarWidget);
        mapaInstancia.off('moveend', manejarMovimientoMapa);
      }
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [mapaInstancia, consultarClima]);

  return (
    <>
      {/* 1. MIRA CENTRAL (CROSSHAIR) EN EL MAPA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[800] opacity-60">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="12" x2="9" y2="12" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="12" x2="24" y2="12" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="0" x2="12" y2="9" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="15" x2="12" y2="24" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-[3px] bg-zinc-700 rounded-full" />
      </div>

      {/* 2. WIDGET INFERIOR DERECHA */}
      <div className="absolute bottom-4 right-4 z-[800] bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 shadow-xl rounded-2xl p-3 text-white min-w-[260px] max-w-[320px] pointer-events-auto">
        {cargando && !datosClima ? (
          <div className="flex items-center justify-center py-4 text-zinc-400 gap-2 text-xs">
            <FiLoader className="animate-spin text-base text-purple-400" />
            <span>Actualizando clima...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-2 text-red-400 gap-2 text-xs">
            <FiAlertTriangle />
            <span>Sin datos de clima</span>
          </div>
        ) : datosClima ? (
          <div className={`space-y-2 transition-opacity duration-300 ${cargando ? 'opacity-40' : 'opacity-100'}`}>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 border-b border-zinc-800 pb-1.5">
              <FiMapPin className="text-purple-400 shrink-0" />
              <span className="truncate font-medium">{datosClima.ciudad}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={`https://openweathermap.org/img/wn/${datosClima.icono}@2x.png`}
                  alt="Clima"
                  className="w-12 h-12 -my-2 drop-shadow"
                />
                <div>
                  <div className="text-lg font-bold tracking-tight">{datosClima.temperatura}°C</div>
                  <div className="text-[11px] text-zinc-400 capitalize">{datosClima.descripcion}</div>
                </div>
              </div>

              <div className="h-9 w-[1px] bg-zinc-800" />

              <div className="text-[11px] space-y-0.5 text-zinc-300">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">Max:</span> <b>{datosClima.maxima}°C</b>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">Min:</span> <b>{datosClima.minima}°C</b>
                </div>
              </div>

              <div className="text-[11px] space-y-0.5 text-zinc-300">
                <div className="flex items-center gap-1">
                  <FiDroplet className="text-blue-400 text-xs" /> <b>{datosClima.humedad}%</b>
                </div>
                <div className="flex items-center gap-1">
                  <FiWind className="text-zinc-400 text-xs" /> <b>{datosClima.viento} km/h</b>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}