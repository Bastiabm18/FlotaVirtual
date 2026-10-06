'use client';

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapa } from '@/contexto/ContextoMapa';
import { useUI } from '@/contexto/ContextoUI';
import { FeatureCollection, Feature, Geometry } from 'geojson';

const SOURCE_DIBUJO = 'fuente-geocerca-borrador';
const LAYER_LINEA = 'capa-borrador-linea';
const LAYER_PUNTOS = 'capa-borrador-puntos';
const LAYER_RELLENO = 'capa-borrador-relleno';

export default function MapaCrearGeocerca() {
  const { mapaRef, estaListo } = useMapa();
  const { 
    puntosDibujo, 
    modoDibujoPoligono, 
    agregarPuntoPoligono, 
    poligonoCerradoVisualmente 
  } = useUI();

  // 1. CAPTURA DE CLICS EN EL MAPA Y CURSOR CROSSHAIR
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !estaListo) return;

    const alHacerClic = (e: mapboxgl.MapMouseEvent) => {
      if (!modoDibujoPoligono) return;
      if (poligonoCerradoVisualmente) return; 
      
      agregarPuntoPoligono({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    };

    if (modoDibujoPoligono) {
      mapa.getCanvas().style.cursor = 'crosshair';
      mapa.on('click', alHacerClic);
    } else {
      mapa.getCanvas().style.cursor = '';
      mapa.off('click', alHacerClic);
    }

    return () => {
      mapa.off('click', alHacerClic);
      if (mapa.getCanvas()) {
        mapa.getCanvas().style.cursor = '';
      }
    };
  }, [modoDibujoPoligono, agregarPuntoPoligono, poligonoCerradoVisualmente, estaListo, mapaRef]);

  // 2. RENDERIZADO DEL BORRADOR EN TIEMPO REAL
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !estaListo) return;

    // Si no está activo el modo dibujo, limpiamos capas y fuentes
    if (!modoDibujoPoligono) {
      if (mapa.getLayer(LAYER_LINEA)) mapa.removeLayer(LAYER_LINEA);
      if (mapa.getLayer(LAYER_PUNTOS)) mapa.removeLayer(LAYER_PUNTOS);
      if (mapa.getLayer(LAYER_RELLENO)) mapa.removeLayer(LAYER_RELLENO);
      if (mapa.getSource(SOURCE_DIBUJO)) mapa.removeSource(SOURCE_DIBUJO);
      return;
    }

    const coords: [number, number][] = puntosDibujo.map((p) => [p.lng, p.lat]);

    const geojson: FeatureCollection<Geometry> = {
      type: 'FeatureCollection',
      features: [
        // Relleno (solo si está cerrado visualmente)
        ...(poligonoCerradoVisualmente && coords.length >= 3
          ? [
              {
                type: 'Feature' as const,
                geometry: {
                  type: 'Polygon' as const,
                  coordinates: [[...coords, coords[0]]],
                },
                properties: {},
              },
            ]
          : []),
        // Línea (abierta o cerrada según el estado)
        ...(coords.length >= 2
          ? [
              {
                type: 'Feature' as const,
                geometry: {
                  type: 'LineString' as const,
                  coordinates: poligonoCerradoVisualmente && coords.length >= 3
                    ? [...coords, coords[0]]
                    : coords,
                },
                properties: {},
              },
            ]
          : []),
        // Puntos / Nodos
        ...puntosDibujo.map((p) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [p.lng, p.lat],
          },
          properties: {},
        })),
      ],
    };

    const fuente = mapa.getSource(SOURCE_DIBUJO) as mapboxgl.GeoJSONSource;

    if (fuente) {
      fuente.setData(geojson);
    } else {
      mapa.addSource(SOURCE_DIBUJO, {
        type: 'geojson',
        data: geojson,
      });

      mapa.addLayer({
        id: LAYER_RELLENO,
        type: 'fill',
        source: SOURCE_DIBUJO,
        paint: {
          'fill-color': '#f97316',
          'fill-opacity': 0.2,
        },
        filter: ['==', '$type', 'Polygon'],
      });

      mapa.addLayer({
        id: LAYER_LINEA,
        type: 'line',
        source: SOURCE_DIBUJO,
        paint: {
          'line-color': '#f97316',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
        },
        filter: ['==', '$type', 'LineString'],
      });

      mapa.addLayer({
        id: LAYER_PUNTOS,
        type: 'circle',
        source: SOURCE_DIBUJO,
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ea580c',
        },
        filter: ['==', '$type', 'Point'],
      });
    }
  }, [puntosDibujo, modoDibujoPoligono, poligonoCerradoVisualmente, estaListo, mapaRef]);

  return null;
}