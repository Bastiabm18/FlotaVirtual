'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { PresetIluminacion } from '@/types/mapa';

// Definimos la estructura de las capas que controlará el Sidebar
export interface EstadoCapas {
  vehiculos: boolean;
  rutas: boolean;
  geocercas: boolean;
  trafico: boolean;
}

interface ContextoMapaProps {
  mapaRef: React.MutableRefObject<mapboxgl.Map | null>;
  estaListo: boolean;
  setEstaListo: (listo: boolean) => void;
  capasVisibles: EstadoCapas;
  alternarCapa: (capa: keyof EstadoCapas) => void;
  estiloActual: string;
  cambiarEstilo: (nuevoEstilo: string) => void;
  cambiarIluminacion?: (preset: PresetIluminacion) => void; 
}

const ContextoMapa = createContext<ContextoMapaProps | null>(null);

export const ProveedorMapa = ({ children }: { children: React.ReactNode }) => {
  const mapaRef = useRef<mapboxgl.Map | null>(null);
  const [estaListo, setEstaListo] = useState(false);
  const [estiloActual, setEstiloActual] = useState('mapbox://styles/bastiabm/cmsgbfzlj00s701s23373a85i');

  // Estado centralizado para el interruptor de capas
  const [capasVisibles, setCapasVisibles] = useState<EstadoCapas>({
    vehiculos: true,
    rutas: true,
    geocercas: true,
    trafico: false,
  });

  

  const alternarCapa = useCallback((capa: keyof EstadoCapas) => {
    setCapasVisibles((prev) => {
      const nuevoEstado = !prev[capa];
      
      // Si el mapa ya está inicializado, controlamos directamente la visibilidad en Mapbox
      if (mapaRef.current) {
        const idCapasMapbox: Record<keyof EstadoCapas, string[]> = {
          vehiculos: ['capa-equipos'], // <--- IDs reales de MapaEquipos
          rutas: ['rutas-borde', 'rutas-linea'], // <--- IDs reales de MapaRutas
          geocercas: ['capa-geocercas-poligonos', 'capa-geocercas-bordes'],
          trafico: ['capa-trafico-flujo'],
        };

        const ids = idCapasMapbox[capa] || [];
        ids.forEach((id) => {
          if (mapaRef.current?.getLayer(id)) {
            mapaRef.current.setLayoutProperty(
              id,
              'visibility',
              nuevoEstado ? 'visible' : 'none'
            );
          }
        });
      }

      return { ...prev, [capa]: nuevoEstado };
    });
  }, []);

  const cambiarEstilo = useCallback((nuevoEstilo: string) => {
    if (mapaRef.current && nuevoEstilo !== estiloActual) {
      setEstiloActual(nuevoEstilo);
      setEstaListo(false);
      mapaRef.current.setStyle(nuevoEstilo);
    }
  }, [estiloActual]);

  

  return (
    <ContextoMapa.Provider
      value={{
        mapaRef,
        estaListo,
        setEstaListo,
        capasVisibles,
        alternarCapa,
        estiloActual,
        cambiarEstilo,
      }}
    >
      {children}
    </ContextoMapa.Provider>
  );
};

export const useMapa = () => {
  const contexto = useContext(ContextoMapa);
  if (!contexto) {
    throw new Error('useMapa debe ser utilizado dentro de un ProveedorMapa');
  }
  return contexto;
};