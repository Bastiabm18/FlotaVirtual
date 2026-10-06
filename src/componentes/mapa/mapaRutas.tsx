'use client';

import { useEffect, useRef } from 'react';
import { useMapa } from '@/contexto/ContextoMapa';
import { getRutas } from '@/actions/mapa/actions';
import { FeatureCollection, LineString } from 'geojson';
import { createRoot } from 'react-dom/client';
import PopupRuta from '@/componentes/mapa/marcadores/PopupRuta';
import mapboxgl from 'mapbox-gl';

export default function MapaRutas() {
  const { mapaRef, estaListo } = useMapa();
  const popupRef = useRef<mapboxgl.Popup | null>(null);// para elpopup 

  useEffect(() => {
    //console.log('Estado de MapaRutas:', { estaListo, tieneMapa: !!mapaRef.current });
    if (!estaListo || !mapaRef.current) return;

    const mapa = mapaRef.current;

    async function agregarCapaRutas() {
      try {
        const { data, error } = await getRutas();
        console.log('Datos obtenidos de rutas:', data);

        if (error || !data || data.length === 0) {
          console.error('Error al cargar rutas o datos vacíos:', error);
          return;
        }

        // Armamos la FeatureCollection
        const geojsonRutas: FeatureCollection<LineString> = {
          type: 'FeatureCollection',
          features: data.map((ruta) => ({
            type: 'Feature',
            id: ruta.id,
            properties: {
              id_ruta: ruta.id_ruta,
              nombre: ruta.nombre,
              descripcion: ruta.descripcion,
              largo: ruta.largo_km,
            },
            geometry: ruta.geojson,
          })),
        };

        // Si la fuente ya existe, actualizamos los datos
        if (mapa.getSource('ruta-fuente')) {
          (mapa.getSource('ruta-fuente') as mapboxgl.GeoJSONSource).setData(geojsonRutas);
        } else {
          // Añadir fuente GeoJSON
          mapa.addSource('ruta-fuente', {
            type: 'geojson',
            data: geojsonRutas,
          });

          // Capa de resaltado exterior (Casing)
          mapa.addLayer({
            id: 'rutas-borde',
            type: 'line',
            source: 'ruta-fuente',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#1e40af',
              'line-width': 20,
              'line-opacity': 0.4,
            },
          });

          // Capa trazado principal
          mapa.addLayer({
            id: 'rutas-linea',
            type: 'line',
            source: 'ruta-fuente',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.9,
            },
          });

          // agregar popup al hacer click en la ruta

    mapa.on('click', 'rutas-linea', (e) => {
            if (!e.features || e.features.length === 0) return;
            const props = e.features[0].properties;
            if (!props) return;

            const contenedorDOM = document.createElement('div');
            const root = createRoot(contenedorDOM);
            root.render(
              <PopupRuta 
                nombre={props.nombre} 
                descripcion={props.descripcion} 
                idRuta={props.id_ruta} 
                largo={props.largo}
              />
            );

            if (popupRef.current) popupRef.current.remove();

            popupRef.current = new mapboxgl.Popup({ closeButton: true, closeOnClick: false })
              .setLngLat(e.lngLat)
              .setDOMContent(contenedorDOM)
              .addTo(mapa);
          });

          mapa.on('mouseenter', 'rutas-linea', () => {
            mapa.getCanvas().style.cursor = 'pointer';
          });

          mapa.on('mouseleave', 'rutas-linea', () => {
            mapa.getCanvas().style.cursor = '';
          });

        }
      } catch (err) {
        console.error('Error inesperado en agregarCapaRutas:', err);
      }
    }

    // Ejecución directa de la función
    agregarCapaRutas();

    // Evento de respaldo por si el usuario cambia dinámicamente el estilo del mapa
    const alCambiarEstilo = () => {
      agregarCapaRutas();
    };

    mapa.on('style.load', alCambiarEstilo);

    return () => {
      mapa.off('style.load', alCambiarEstilo);
      if (mapa.getLayer('rutas-linea')) {
      mapa.removeLayer('rutas-linea');
    }
    if (mapa.getLayer('rutas-borde')) {
      mapa.removeLayer('rutas-borde');
    }
    if (mapa.getSource('ruta-fuente')) {
      mapa.removeSource('ruta-fuente');
    }
    if (popupRef.current) {
        popupRef.current.remove(); // 
      }
    };
  }, [estaListo, mapaRef]);

  return null;
}