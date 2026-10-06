'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapa } from '@/contexto/ContextoMapa';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUI } from '@/contexto/ContextoUI';

// 1. Módulos de lectura / visualización de la Base de Datos
import MapaRutas from '@/componentes/mapa/mapaRutas';
import MapaGeocercas from '@/componentes/mapa/mapaGeocercas';

// 2. Módulos de gestión / creación interactiva
import MapaCrearGeocerca from '@/componentes/mapa/mapaCrearGeocerca';
import MapaCrearRuta from '@/componentes/mapa/MapaCrearRuta';
import MapaEquipos from './mapaEquipos';
import WidgetClima from './clima/WidgetClima';
import MapaExcesos from './MapaExcesos'
import MapaViajeFinalizado from './mapaViajeFinalizado';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MapaLienzo() {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const { mapaRef, estaListo, setEstaListo, estiloActual } = useMapa();
  const { modoDibujoPoligono, modoCreacionRuta, excesoSeleccionadoMapa, viajeSeleccionadoMapa } = useUI();

  // Bandera estricta para saber si hay un flujo de creación activo
  const estaCreando = Boolean(modoDibujoPoligono || modoCreacionRuta);

  // Inicialización base de Mapbox
  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    const mapa = new mapboxgl.Map({
      container: contenedorRef.current,
      style: estiloActual,
      config:{basemap: {
            showIndoor: true
        }},
      center: [-72.9377, -37.1749], // sj
      zoom: 8,
      pitch: 30,
    });

    mapa.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );
    mapa.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    mapaRef.current = mapa;

    const aplicarDetallesCapaMapa = () => {
      try {
        mapa.setConfigProperty('basemap', 'lightPreset', 'light'); // si pones night o dusk se oscurece  // atardecer / noche

        //mapa.setTerrain({ source: 'mapbox-dem',exaggeration: 2 });
        // 1. ACTIVAR RELIEVES 3D (Terrain)
        if (!mapa.getSource('mapbox-dem')) {
          mapa.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });
          mapa.setTerrain({ source: 'mapbox-dem', exaggeration: 2 }); // Exageración del relieve (puedes ajustarla de 1 a 2)
        }

    //    // 2. Activar la Lluvia 
    //    mapa.setRain({
    //      density: 0.6,          // Cantidad de gotas (0 a 1)
    //      intensity: 0.8,        // Velocidad de caída
    //      opacity: 0.7,          // Visibilidad de las gotas
    //      color: '#a8adbc',      // Tono de las gotas
    //      direction: [0, 80]     // Inclinación de la lluvia
    //    });

      } catch (err) {
        console.warn('Error aplicando dusk fijo:', err);
      }
      setEstaListo(true);
      setTimeout(() => mapa.resize(), 200);
    };

    if (mapa.isStyleLoaded()) {
      aplicarDetallesCapaMapa();
    } else {
      mapa.once('style.load', aplicarDetallesCapaMapa);
    }

    return () => {
      mapa.remove();
      mapaRef.current = null;
      setEstaListo(false);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-64px)] bg-zinc-900">
      <div ref={contenedorRef} className="absolute inset-0 w-full h-full" />
      {estaListo && mapaRef.current && (
        <WidgetClima mapaInstancia={mapaRef.current} />
      )}
      {/* Capas de consulta de la BD: Se desmontan y ocultan inmediatamente al activar un flujo de creación */}
      {!estaCreando && !excesoSeleccionadoMapa && !viajeSeleccionadoMapa && (
        <>
          <MapaRutas />
          <MapaGeocercas />
          <MapaEquipos/>
        </>
      )}

        {viajeSeleccionadoMapa && <MapaViajeFinalizado />}


      {/* Capa exclusiva para aislar y mostrar el exceso seleccionado en el mapa */}
      {excesoSeleccionadoMapa && <MapaExcesos exceso={excesoSeleccionadoMapa} />}

      {/* Componentes independientes de creación y dibujo */}
      <MapaCrearGeocerca />
      <MapaCrearRuta />
    </div>
  );
}