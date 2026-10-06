'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapa } from '@/contexto/ContextoMapa';
import { getPoligonos } from '@/actions/mapa/actions';
import { FeatureCollection, Polygon } from 'geojson';
// CON CREATEROOT AGREGAMOS EL POPUP DE REACT DENTRO DEL MAPA SIN EL ESTAS CAGAO
import { createRoot } from 'react-dom/client';
import PopupGeocerca from '@/componentes/mapa/marcadores/PopupGeocerca';

export default function MapaGeocercas() {
  const { mapaRef, estaListo, capasVisibles } = useMapa();
  const popupRef = useRef<mapboxgl.Popup | null>(null); // PARA GUARDAR EL POPUP Y PODER CERRARLO DESPUES Y ASIGNARLO 

  // 1. Cargar y dibujar polígonos desde la Base de Datos
  useEffect(() => {
    if (!estaListo || !mapaRef.current) return;

    const mapa = mapaRef.current;

    async function agregarCapaGeocercas() {
      try {
        const { data, error } = await getPoligonos();

      //  console.log('Datos obtenidos de geocercas:', data);

        if (error || !data || data.length === 0) {
          console.error('Error al cargar polígonos o datos vacíos:', error);
          return;
        }

        const geojsonGeocercas: FeatureCollection<Polygon> = {
          type: 'FeatureCollection',
          features: data.map((poligono) => ({
            type: 'Feature',
            id: poligono.id,
            properties: {
              id_poligono: poligono.id_poligono,
              nombre: poligono.nombre,
              descripcion: poligono.descripcion,
              color: poligono.color || '#AF75D1',        // <- Color dinámico con respaldo por defecto
              color_borde: poligono.color_borde || '#9A13E8', // <- Borde dinámico con respaldo
    
            },
            geometry: typeof poligono.geojson === 'string' 
              ? JSON.parse(poligono.geojson) 
              : poligono.geojson,
          })),
        };

        const visibilidad = capasVisibles.geocercas ? 'visible' : 'none';

        if (mapa.getSource('geocercas-fuente')) {
          (mapa.getSource('geocercas-fuente') as mapboxgl.GeoJSONSource).setData(geojsonGeocercas);
        } else {
          mapa.addSource('geocercas-fuente', {
            type: 'geojson',
            data: geojsonGeocercas,
          });

          // Capa Relleno
          mapa.addLayer({
            id: 'capa-geocercas-poligonos',
            type: 'fill',
            source: 'geocercas-fuente',
            layout: {
              visibility: visibilidad,
            },
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.3,
            },
          });

          // Capa Borde
          mapa.addLayer({
            id: 'capa-geocercas-bordes',
            type: 'line',
            source: 'geocercas-fuente',
            layout: {
              visibility: visibilidad,
            },
            paint: {
              'line-color': ['get', 'color_borde'],
              'line-width': 2,
              'line-dasharray': [2, 2],
            },
          });

          // --- AGREGAR POPUP DEL POLIGONO  ---
          mapa.on('click', 'capa-geocercas-poligonos', (e) => {
            if (!e.features || e.features.length === 0) return;

            const props = e.features[0].properties;
            const coordinates = e.lngLat;

            if (!props) return;

            const contenedorDOM = document.createElement('div');
            const root = createRoot(contenedorDOM);
            root.render(
              <PopupGeocerca 
                nombre={props.nombre} 
                descripcion={props.descripcion} 
                idPoligono={props.id_poligono} 
              />
            );

            if (popupRef.current) {
              popupRef.current.remove();
            }

            popupRef.current = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: false,
            })
              .setLngLat(coordinates)
              .setDOMContent(contenedorDOM)
              .addTo(mapa);
          });

          mapa.on('mouseenter', 'capa-geocercas-poligonos', () => {
            mapa.getCanvas().style.cursor = 'pointer';
          });

          mapa.on('mouseleave', 'capa-geocercas-poligonos', () => {
            mapa.getCanvas().style.cursor = '';
          });
          // ---------------------------------


        }
      } catch (err) {
        console.error('Error inesperado en agregarCapaGeocercas:', err);
      }
    }

    agregarCapaGeocercas();

    const alCambiarEstilo = () => {
      agregarCapaGeocercas();
    };

    mapa.on('style.load', alCambiarEstilo);

    // AQUÍ ESTÁ LA CLAVE: Limpieza al desmontar el componente (cuando entras a modo creación)
    return () => {
      mapa.off('style.load', alCambiarEstilo);

      if (mapa.getLayer('capa-geocercas-poligonos')) {
        mapa.removeLayer('capa-geocercas-poligonos');
      }
      if (mapa.getLayer('capa-geocercas-bordes')) {
        mapa.removeLayer('capa-geocercas-bordes');
      }
      if (mapa.getSource('geocercas-fuente')) {
        mapa.removeSource('geocercas-fuente');
      }
    };
  }, [estaListo, mapaRef]);

  // 2. Controlar la visibilidad al conmutar el switch desde ContextoMapa
  useEffect(() => {
    if (!estaListo || !mapaRef.current) return;
    const mapa = mapaRef.current;

    const estadoVisibilidad = capasVisibles.geocercas ? 'visible' : 'none';

    if (mapa.getLayer('capa-geocercas-poligonos')) {
      mapa.setLayoutProperty('capa-geocercas-poligonos', 'visibility', estadoVisibilidad);
    }
    if (mapa.getLayer('capa-geocercas-bordes')) {
      mapa.setLayoutProperty('capa-geocercas-bordes', 'visibility', estadoVisibilidad);
    }
    // PARA ELIMINAR ELPOPUP SI SE CAMBIA LA VISIBILIDAD DE LA CAPA
    if (popupRef.current) {
        popupRef.current.remove(); // <-
      }
  }, [capasVisibles.geocercas, estaListo, mapaRef]);

  return null;
}