'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapa } from '@/contexto/ContextoMapa';
import { useUI } from '@/contexto/ContextoUI';
import { obtenerDetalleViajeFinalizado } from '@/actions/viajes/actions';
import mapboxgl from 'mapbox-gl';

export default function MapaViajeFinalizado() {
  const { mapaRef, estaListo } = useMapa();
  const { viajeSeleccionadoMapa } = useUI();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const viajeCargadoRef = useRef<number | null>(null);
  const [cargando, setCargando] = useState(false);

  const limpiarCapasAnteriores = () => {
    if (!mapaRef.current) return;
    const mapa = mapaRef.current;

    ['capa-ruta-teorica', 'capa-ruta-recorrida'].forEach((id) => {
      if (mapa.getLayer(id)) {
        mapa.removeLayer(id);
      }
    });
    
    ['fuente-ruta-teorica', 'fuente-ruta-recorrida'].forEach((id) => {
      if (mapa.getSource(id)) {
        mapa.removeSource(id);
      }
    });

    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }

    viajeCargadoRef.current = null;
  };

  const cargarDetalleViaje = async (idViaje: number) => {
    if (viajeCargadoRef.current === idViaje || cargando) {
      return;
    }

    if (!mapaRef.current) return;
    setCargando(true);

    try {
      limpiarCapasAnteriores();

      const res = await obtenerDetalleViajeFinalizado(idViaje);

      if (!res.exito || !res.data) {
        setCargando(false);
        return;
      }

      const detalle = res.data;
      const mapa = mapaRef.current;

      viajeCargadoRef.current = idViaje;

      if (detalle.ruta_teorica) {
        try {
          if (!mapa.getSource('fuente-ruta-teorica')) {
            mapa.addSource('fuente-ruta-teorica', {
              type: 'geojson',
              data: detalle.ruta_teorica,
            });
            mapa.addLayer({
              id: 'capa-ruta-teorica',
              type: 'line',
              source: 'fuente-ruta-teorica',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 2] },
            });
          } else {
            (mapa.getSource('fuente-ruta-teorica') as mapboxgl.GeoJSONSource)
              .setData(detalle.ruta_teorica);
          }
        } catch (error) {
          console.error('Error al dibujar ruta teórica:', error);
        }
      }

      if (detalle.ruta_recorrida) {
        try {
          if (!mapa.getSource('fuente-ruta-recorrida')) {
            mapa.addSource('fuente-ruta-recorrida', {
              type: 'geojson',
              data: detalle.ruta_recorrida,
            });
            mapa.addLayer({
              id: 'capa-ruta-recorrida',
              type: 'line',
              source: 'fuente-ruta-recorrida',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#10b981', 'line-width': 5 },
            });
          } else {
            (mapa.getSource('fuente-ruta-recorrida') as mapboxgl.GeoJSONSource)
              .setData(detalle.ruta_recorrida);
          }
        } catch (error) {
          console.error('Error al dibujar ruta recorrida:', error);
        }
      }

      if (detalle.desvios && Array.isArray(detalle.desvios) && detalle.desvios.length > 0) {
        detalle.desvios.forEach((desvio: any, index: number) => {
          const el = document.createElement('div');
          el.className = 'w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg';
      

          const marker = new mapboxgl.Marker(el)
            .setLngLat([desvio.lng, desvio.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 10 }).setHTML(`
                <div style="color: #000; font-size: 11px; padding: 4px;">
                  <strong>Desvío Detectado</strong><br/>
                  Distancia: ${Math.round(desvio.distancia)} metros<br/>
                  Fecha: ${new Date(desvio.fecha).toLocaleString()}
                </div>
              `)
            )
            .addTo(mapa);
          markersRef.current.push(marker);
        });
      }

      try {
        const bounds = new mapboxgl.LngLatBounds();
        let puntos = 0;

        if (detalle.ruta_teorica?.coordinates) {
          detalle.ruta_teorica.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
            puntos++;
          });
        }

        if (detalle.ruta_recorrida?.coordinates) {
          detalle.ruta_recorrida.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
            puntos++;
          });
        }

        if (detalle.desvios) {
          detalle.desvios.forEach((desvio: any) => {
            bounds.extend([desvio.lng, desvio.lat]);
            puntos++;
          });
        }

        if (puntos > 1) {
          mapa.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 15,
            duration: 1000,
          });
        }
      } catch (error) {
        console.warn('Error al ajustar el mapa:', error);
      }

    } catch (error) {
      console.error('Error en cargarDetalleViaje:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!estaListo || !mapaRef.current) return;

    if (viajeSeleccionadoMapa) {
      cargarDetalleViaje(viajeSeleccionadoMapa);
    } else {
      limpiarCapasAnteriores();
    }

    return () => {
      limpiarCapasAnteriores();
    };
  }, [estaListo, mapaRef, viajeSeleccionadoMapa]);

  return null;
}