'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useMapa } from '@/contexto/ContextoMapa'
import { useUI } from '@/contexto/ContextoUI'
import { obtenerRutaMapbox } from '@/actions/mapa/actions'
import { FeatureCollection, Polygon } from 'geojson'

function obtenerCentroide(geometry: Polygon): [number, number] {
  const coords = geometry.coordinates[0]
  let lngSum = 0
  let latSum = 0
  coords.forEach(([lng, lat]) => {
    lngSum += lng
    latSum += lat
  })
  return [lngSum / coords.length, latSum / coords.length]
}

export default function MapaCrearRuta() {
  const { mapaRef, estaListo } = useMapa()
  // Consumimos todo del contexto UI directamente
  const {
    poligonoOrigenRuta: poligonoOrigen,
    poligonoDestinoRuta: poligonoDestino,
    modoCreacionRuta: modo,
    alCalcularRuta,
  } = useUI()

// Ref para memorizar los últimos puntos procesados y frenar peticiones duplicadas
const ultimaRutaRef = useRef<string>('');
  

  const [puntosManuales, setPuntosManuales] = useState<[number, number][]>([])

  // 1. Renderizar polígonos seleccionados (Origen / Destino)
  useEffect(() => {
    if (!estaListo || !mapaRef.current) return
    const mapa = mapaRef.current

    const features = []
    if (poligonoOrigen) {
      const geo = typeof poligonoOrigen.geojson === 'string' ? JSON.parse(poligonoOrigen.geojson) : poligonoOrigen.geojson
      features.push({
        type: 'Feature',
        properties: { rol: 'origen', nombre: poligonoOrigen.nombre },
        geometry: geo,
      })
    }
    if (poligonoDestino) {
      const geo = typeof poligonoDestino.geojson === 'string' ? JSON.parse(poligonoDestino.geojson) : poligonoDestino.geojson
      features.push({
        type: 'Feature',
        properties: { rol: 'destino', nombre: poligonoDestino.nombre },
        geometry: geo,
      })
    }

    const geojsonSeleccionados: FeatureCollection = {
      type: 'FeatureCollection',
      features: features as any,
    }

    const fuente = mapa.getSource('poligono-seleccionados-fuente') as mapboxgl.GeoJSONSource

    if (fuente) {
      fuente.setData(geojsonSeleccionados)
    } else {
      mapa.addSource('poligono-seleccionados-fuente', {
        type: 'geojson',
        data: geojsonSeleccionados,
      })

      mapa.addLayer({
        id: 'capa-poligonos-seleccionados-relleno',
        type: 'fill',
        source: 'poligono-seleccionados-fuente',
        paint: {
          'fill-color': ['match', ['get', 'rol'], 'origen', '#DE9000', 'destino', '#DEB96D', '#DEB96D'],
          'fill-opacity': 0.4,
        },
      })

      mapa.addLayer({
        id: 'capa-poligonos-seleccionados-borde',
        type: 'line',
        source: 'poligono-seleccionados-fuente',
        paint: {
          'line-color': ['match', ['get', 'rol'], 'origen', '#DE9000', 'destino', '#DEB96D', '#DEB96D'],
          'line-width': 3,
        },
      })
    }
  }, [poligonoOrigen, poligonoDestino, estaListo, mapaRef])

// 2. Trazar la ruta devuelta por Mapbox
const calcularYTrazarRuta = useCallback(
  async (puntos: [number, number][]) => {
    if (puntos.length < 2 || !mapaRef.current) return;

    const clavePuntos = JSON.stringify(puntos);
    if (ultimaRutaRef.current === clavePuntos) return;
    ultimaRutaRef.current = clavePuntos;

    const mapa = mapaRef.current;
    const res = await obtenerRutaMapbox(puntos);

    if (!res.exito || !res.data) return;
    const { geojson } = res.data;

    const geojsonRuta: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: geojson,
        },
      ],
    };

    const fuente = mapa.getSource('trazo-ruta-fuente') as mapboxgl.GeoJSONSource;

    if (fuente) {
      fuente.setData(geojsonRuta);
    } else {
      mapa.addSource('trazo-ruta-fuente', {
        type: 'geojson',
        data: geojsonRuta,
      });

      mapa.addLayer({
        id: 'capa-trazo-ruta',
        type: 'line',
        source: 'trazo-ruta-fuente',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#F54927',
          'line-width': 5,
        },
      });
    }

    if (geojson.coordinates && geojson.coordinates.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      geojson.coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
      mapa.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }

    if (alCalcularRuta) {
      setTimeout(() => {
        alCalcularRuta(geojson);
      }, 0);
    }
  },
  [mapaRef, alCalcularRuta]
);
// 3. Modo AUTOMÁTICO
useEffect(() => {
  if (modo !== 'AUTOMATICO' || !poligonoOrigen || !poligonoDestino) return

  const geoOrigen = typeof poligonoOrigen.geojson === 'string' ? JSON.parse(poligonoOrigen.geojson) : poligonoOrigen.geojson
  const geoDestino = typeof poligonoDestino.geojson === 'string' ? JSON.parse(poligonoDestino.geojson) : poligonoDestino.geojson

  const centroideOrigen = obtenerCentroide(geoOrigen)
  const centroideDestino = obtenerCentroide(geoDestino)

  if (mapaRef.current) {
    const bounds = new mapboxgl.LngLatBounds()
    bounds.extend(centroideOrigen)
    bounds.extend(centroideDestino)
    mapaRef.current.fitBounds(bounds, { padding: 80 })
  }

  //  CORRECCIÓN: Se envuelve en setTimeout para diferir la Server Action fuera del render
  setTimeout(() => {
    calcularYTrazarRuta([centroideOrigen, centroideDestino])
  }, 0)
}, [modo, poligonoOrigen?.id, poligonoDestino?.id, calcularYTrazarRuta])

  // 4. Modo MANUAL
useEffect(() => {
  if (modo !== 'MANUAL' || !estaListo || !mapaRef.current) return
  const mapa = mapaRef.current

  const alHacerClic = (e: mapboxgl.MapMouseEvent) => {
    const nuevaCoord: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    
    // CORRECCIÓN: Calcular primero y sacar de la función de estado
    setPuntosManuales((prev) => {
      const actualizados = [...prev, nuevaCoord]
      
      if (actualizados.length >= 2) {
        setTimeout(() => {
          calcularYTrazarRuta(actualizados)
        }, 0)
      }
      
      return actualizados
    })
  }

  mapa.on('click', alHacerClic)
  return () => {
    mapa.off('click', alHacerClic)
  }
}, [modo, estaListo, mapaRef, calcularYTrazarRuta])

  // resetear la ref al limpiar el modo, para que no frene la petición si se vuelve a entrar en modo automático con los mismos puntos
  useEffect(() => {
  if (!modo) {
    ultimaRutaRef.current = '';
  }
}, [modo]);

// Renderizar puntos manuales en el mapa (Feedback desde el 1er click)
useEffect(() => {
  if (!estaListo || !mapaRef.current) return;
  const mapa = mapaRef.current;

  const geojsonPuntos: FeatureCollection = {
    type: 'FeatureCollection',
    features: puntosManuales.map((coord, index) => ({
      type: 'Feature',
      properties: { id: index },
      geometry: {
        type: 'Point',
        coordinates: coord,
      },
    })),
  };

  const fuente = mapa.getSource('puntos-manuales-fuente') as mapboxgl.GeoJSONSource;

  if (fuente) {
    fuente.setData(geojsonPuntos);
  } else {
    mapa.addSource('puntos-manuales-fuente', {
      type: 'geojson',
      data: geojsonPuntos,
    });

    mapa.addLayer({
      id: 'capa-puntos-manuales',
      type: 'circle',
      source: 'puntos-manuales-fuente',
      paint: {
        'circle-radius': 7,
        'circle-color': '#ef4444',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
  }
}, [puntosManuales, estaListo, mapaRef]);



//LIMPIAR LAS CAPAS AL SALIR

useEffect(() => {
  if (!modo) {
    ultimaRutaRef.current = '';
    setPuntosManuales([]);
    
    if (mapaRef.current) {
      const mapa = mapaRef.current;
      if (mapa.getSource('puntos-manuales-fuente')) {
        (mapa.getSource('puntos-manuales-fuente') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      if (mapa.getSource('trazo-ruta-fuente')) {
        (mapa.getSource('trazo-ruta-fuente') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    }
  }
}, [modo, mapaRef]);
  return null
}