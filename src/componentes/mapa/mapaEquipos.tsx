'use client';

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { useMapa } from '@/contexto/ContextoMapa';
import { getEquipos } from '@/actions/mapa/actions';
import { crearElementoPulso } from '@/componentes/mapa/marcadores/MarcadorEquipoPulso';
import { PopUpEquipo } from './PopUpEquipo';
import { useEquiposRealtime } from '@/hooks/useEquiposRealtime';
import { useAnimarPosicion } from '@/hooks/useAnimarPosicion';
import { EquipoData, EquipoRealtimePayload } from '@/types/rutas';



export default function MapaEquipos() {
  const { mapaRef, estaListo, capasVisibles } = useMapa();

  const marcadoresRef = useRef<Map<number, mapboxgl.Marker>>(new Map());
  const popupsGlbRef = useRef<Map<number, mapboxgl.Popup>>(new Map());
  const equiposDataRef = useRef<Map<number, EquipoData>>(new Map());
 // console.log(equiposDataRef);
  const { animar } = useAnimarPosicion();

  function construirGeojson() {
    return {
      type: 'FeatureCollection',
      features: Array.from(equiposDataRef.current.values()).map((eq) => ({

        type: 'Feature',
        id: eq.id_equipo,
        properties: {
          id_equipo: eq.id_equipo,
          patente: eq.patente_equipo,
          marca: eq.marca_equipo,
          heading: eq.heading_equipo || 0,
        },
        geometry: {
          type: 'Point',
          coordinates: [eq.longitud_equipo, eq.latitud_equipo],
        },
      })),
    } as any;
  }

  // aplica una posición puntual (llamado en cada frame de la animación)
  function pintarFrame(idEquipo: number, lng: number, lat: number, heading: number) {
    const mapa = mapaRef.current;
    if (!mapa) return;

    const eq = equiposDataRef.current.get(idEquipo);
    if (!eq) return;

    // actualizamos el registro en memoria con la posición intermedia
    equiposDataRef.current.set(idEquipo, {
      ...eq,
      longitud_equipo: lng,
      latitud_equipo: lat,
      heading_equipo: heading,
    });

    const coord: [number, number] = [lng, lat];

    const marcador = marcadoresRef.current.get(idEquipo);
    if (marcador) marcador.setLngLat(coord);

    const popupGlb = popupsGlbRef.current.get(idEquipo);
    if (popupGlb) popupGlb.setLngLat(coord);

    const fuente = mapa.getSource('equipos-fuente') as mapboxgl.GeoJSONSource | undefined;
    if (fuente) fuente.setData(construirGeojson());
  }

  // llamado cuando llega un evento realtime — dispara la animación de A → B
  function actualizarPosicionEquipo(actualizado: EquipoRealtimePayload) {

    const anterior = equiposDataRef.current.get(actualizado.id_equipo);

    // si no teníamos el equipo en memoria (raro, pero por si acaso), lo pintamos directo sin animar
    if (!anterior) {
      equiposDataRef.current.set(actualizado.id_equipo, actualizado as EquipoData);
      const mapa = mapaRef.current;
      const fuente = mapa?.getSource('equipos-fuente') as mapboxgl.GeoJSONSource | undefined;
      if (fuente) fuente.setData(construirGeojson());
      return;
    }

    animar(
      actualizado.id_equipo,
      {
        lng: anterior.longitud_equipo,
        lat: anterior.latitud_equipo,
        heading: anterior.heading_equipo || 0,
      },
      {
        lng: actualizado.longitud_equipo,
        lat: actualizado.latitud_equipo,
        heading: actualizado.heading_equipo || 0,
      },
      (coord) => {
        pintarFrame(actualizado.id_equipo, coord.lng, coord.lat, coord.heading);
      }
    );
  }

  // ---------------------------------------------------------------------------
  // EFECTO 1: Carga inicial (sin cambios respecto a la versión anterior)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!estaListo || !mapaRef.current) return;

    const mapa = mapaRef.current;
    let isMounted = true;

    async function cargarDatosYCapas() {
      try {
        const { data, error } = await getEquipos();
        if (!isMounted || error || !data || data.length === 0) return;

        marcadoresRef.current.forEach((m) => m.remove());
        marcadoresRef.current.clear();
        popupsGlbRef.current.forEach((p) => p.remove());
        popupsGlbRef.current.clear();
        equiposDataRef.current.clear();

        data.forEach((eq) => {
          equiposDataRef.current.set(eq.id_equipo, eq as EquipoData);

          const el = crearElementoPulso(eq.patente_equipo);
          const contenedorHtml = document.createElement('div');
          const root = createRoot(contenedorHtml);

          root.render(
            <PopUpEquipo
              patente={eq.patente_equipo}
              marca={eq.marca_equipo}
              anio={eq.anio_equipo}
              chasis={eq.num_chasis_equipo}
              heading={eq.heading_equipo || 0}
            />
          );

          const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(contenedorHtml);

          const marcadorHTML = new mapboxgl.Marker({ element: el })
            .setLngLat([eq.longitud_equipo, eq.latitud_equipo])
            .setPopup(popup)
            .addTo(mapa);

          marcadoresRef.current.set(eq.id_equipo, marcadorHTML);
        });

        const geojsonEquipos = construirGeojson();
      //  console.log('geoJson'+geojsonEquipos);
        if (mapa.getSource('equipos-fuente')) {
          (mapa.getSource('equipos-fuente') as mapboxgl.GeoJSONSource).setData(geojsonEquipos);
        } else {
          mapa.addSource('equipos-fuente', { type: 'geojson', data: geojsonEquipos });

          if (!(mapa as any).hasModel('camion_na.glb')) {
            (mapa as any).addModel('camion_na.glb', '/camion_na.glb');
          }

          mapa.addLayer({
            id: 'capa-equipos',
            type: 'model',
            source: 'equipos-fuente',
            slot: 'middle',
            minzoom: 16,
            layout: { 'model-id': ['literal', 'camion_na.glb'] },
            paint: {
              'model-scale': [10, 10, 10],
              'model-rotation': [0, 0, ['+', ['get', 'heading'], 90]],
            },
          });
        }

        const actualizarVisualizacion = () => {
          const zoomActual = mapa.getZoom();
          const vehiculosActivos = capasVisibles.vehiculos;

          if (mapa.getLayer('capa-equipos')) {
            mapa.setLayoutProperty('capa-equipos', 'visibility', vehiculosActivos ? 'visible' : 'none');
          }

          marcadoresRef.current.forEach((m) => {
            const el = m.getElement();
            if (el) el.style.display = (!vehiculosActivos || zoomActual >= 16) ? 'none' : 'flex';
          });

          if (vehiculosActivos && zoomActual >= 16) {
            if (popupsGlbRef.current.size === 0) {
              equiposDataRef.current.forEach((eq) => {
                const contenedorHtml = document.createElement('div');
                const root = createRoot(contenedorHtml);

                root.render(
                  <PopUpEquipo
                    patente={eq.patente_equipo}
                    marca={eq.marca_equipo}
                    anio={eq.anio_equipo}
                    chasis={eq.num_chasis_equipo}
                    heading={eq.heading_equipo || 0}
                  />
                );

                const popupGlb = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 35 })
                  .setLngLat([eq.longitud_equipo, eq.latitud_equipo])
                  .setDOMContent(contenedorHtml)
                  .addTo(mapa);

                popupsGlbRef.current.set(eq.id_equipo, popupGlb);
              });
            }
          } else {
            popupsGlbRef.current.forEach((p) => p.remove());
            popupsGlbRef.current.clear();
          }
        };

        mapa.on('zoom', actualizarVisualizacion);
        actualizarVisualizacion();
      } catch (err) {
        console.error('Error al cargar equipos en el mapa:', err);
      }
    }

    cargarDatosYCapas();

    const alCambiarEstilo = () => cargarDatosYCapas();
    mapa.on('style.load', alCambiarEstilo);

    return () => {
      isMounted = false;
      mapa.off('style.load', alCambiarEstilo);

      marcadoresRef.current.forEach((m) => m.remove());
      marcadoresRef.current.clear();
      popupsGlbRef.current.forEach((p) => p.remove());
      popupsGlbRef.current.clear();

      if (mapa.getLayer('capa-equipos')) mapa.removeLayer('capa-equipos');
      if (mapa.getSource('equipos-fuente')) mapa.removeSource('equipos-fuente');
    };
  }, [estaListo, mapaRef]);

  // ---------------------------------------------------------------------------
  // EFECTO 2: Suscripción Realtime, ahora vía hook separado
  // ---------------------------------------------------------------------------
  useEquiposRealtime(estaListo, actualizarPosicionEquipo);

  // ---------------------------------------------------------------------------
  // EFECTO 3: Reacción al switch de capa visible (sin cambios)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!estaListo || !mapaRef.current) return;

    const mapa = mapaRef.current;
    const zoomActual = mapa.getZoom();
    const vehiculosActivos = capasVisibles.vehiculos;

    if (mapa.getLayer('capa-equipos')) {
      mapa.setLayoutProperty('capa-equipos', 'visibility', vehiculosActivos ? 'visible' : 'none');
    }

    marcadoresRef.current.forEach((m) => {
      const el = m.getElement();
      if (el) el.style.display = (!vehiculosActivos || zoomActual >= 16) ? 'none' : 'flex';
    });

    if (!vehiculosActivos) {
      popupsGlbRef.current.forEach((p) => p.remove());
      popupsGlbRef.current.clear();
    }
  }, [capasVisibles.vehiculos, estaListo, mapaRef]);

  return null;
}