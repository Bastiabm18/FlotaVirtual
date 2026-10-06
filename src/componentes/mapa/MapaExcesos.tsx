'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapa } from '@/contexto/ContextoMapa';
import { createRoot } from 'react-dom/client';
import MarcadorExceso from './marcadores/MarcadorExceso';
import PopupExceso from './marcadores/PopupExceso';

interface MapaExcesosProps {
  exceso: {
    id: number | string;
    latitud: number;
    longitud: number;
    velocidad_equipo: number;
    fecha_reporte: string;
    patente_movil?: string;
  } | null;
}

export default function MapaExcesos({ exceso }: MapaExcesosProps) {
  const { mapaRef, estaListo } = useMapa();

  useEffect(() => {
    if (!estaListo || !mapaRef.current || !exceso) return;

    const mapa = mapaRef.current;
    const { latitud, longitud, velocidad_equipo, fecha_reporte, patente_movil } = exceso;

    // 1. Centrar y hacer zoom en el punto exacto del exceso
    mapa.flyTo({
      center: [longitud, latitud],
      zoom: 15,
      pitch: 45,
      essential: true,
    });

    // 2. inyeccion del popup TSX USANDO CREATEROOT 
   const elMarcador = document.createElement('div');
    const rootMarcador = createRoot(elMarcador);
    rootMarcador.render(<MarcadorExceso velocidad={velocidad_equipo} />);

   const elPopup = document.createElement('div');
    const rootPopup = createRoot(elPopup);
    rootPopup.render(
      <PopupExceso 
        patente={patente_movil} 
        velocidad={velocidad_equipo} 
        fecha={fecha_reporte} 
      />
    );

   const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
      .setDOMContent(elPopup);

    // 4. Añadir el marcador al mapa
  const marcador = new mapboxgl.Marker(elMarcador)
      .setLngLat([longitud, latitud])
      .setPopup(popup)
      .addTo(mapa);

    // Abrir el popup por defecto
    popup.addTo(mapa);

    // Limpieza al desmontar o cambiar de exceso
    return () => {
      marcador.remove();
    };
  }, [estaListo, exceso, mapaRef]);

  return null;
}