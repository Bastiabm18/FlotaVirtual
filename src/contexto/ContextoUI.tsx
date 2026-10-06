'use client';

import { Coordenada, ModoCreacionRuta, PoligonoRutaOption } from '@/types/rutas';
import { ModuloActivo } from '@/types/sistema';
import React, { createContext, useContext, useState } from 'react';



interface ContextoUIProps {
  moduloActivo: ModuloActivo;
  setModuloActivo: (modulo: ModuloActivo) => void;
  elementoSeleccionadoId: string | number | null;
  setElementoSeleccionadoId: (id: string | number | null) => void;
  volverAlMenu: () => void;
  // PROPS PARA DIBUJAR POLIGONOS
  modoDibujoPoligono: boolean;
  puntosDibujo: Coordenada[];
  iniciarDibujoPoligono: () => void;
  agregarPuntoPoligono: (pt: Coordenada) => void;
  cancelarDibujoPoligono: () => void;
  deshacerUltimoPunto: () => void;
  poligonoCerradoVisualmente: boolean;
  cerrarFormaVisualmente: () => void;
  abrirFormaVisualmente: () => void;

  // PROPS PARA RUTAS
  poligonoOrigenRuta: PoligonoRutaOption | null;
  setPoligonoOrigenRuta: (poligono: PoligonoRutaOption | null) => void;
  poligonoDestinoRuta: PoligonoRutaOption | null;
  setPoligonoDestinoRuta: (poligono: PoligonoRutaOption | null) => void;
  modoCreacionRuta: ModoCreacionRuta;
  setModoCreacionRuta: (modo: ModoCreacionRuta) => void;
  alCalcularRuta: (geojson: any) => void;
  rutaGeojsonCalculada: any;
  limpiarEstadoRuta: () => void;

  // PROPS CAPA MAPA DE EXCESOS
 excesoSeleccionadoMapa: any | null;
 setExcesoSeleccionadoMapa: (exceso: any | null) => void;

 // PROPS VIAJES CON/SIN DESVIOS
   viajeSeleccionadoMapa: number | null;  // <- Solo el ID del viaje
  setViajeSeleccionadoMapa: (id: number | null) => void;

}

const ContextoUI = createContext<ContextoUIProps | null>(null);

export const ProveedorUI = ({ children }: { children: React.ReactNode }) => {
  const [moduloActivo, setModuloActivo] = useState<ModuloActivo>('menu');
  const [elementoSeleccionadoId, setElementoSeleccionadoId] = useState<string | number | null>(null);
  const [excesoSeleccionadoMapa , setExcesoSeleccionadoMapa] = useState<any |null>(null);

const volverAlMenu = () => {
  setModuloActivo('menu');
  setModoDibujoPoligono(false);   // <-- Apaga el dibujo de polígonos
  setPuntosDibujo([]);            // <-- Borra los puntos temporales
  setPoligonoCerradoVisualmente(false);
  setViajeSeleccionadoMapa(null); // ELIMINAMOS EL VIAJE DEL MAPA AL VOLVER A MENU
};


  // MODO DIBUJO DE POLIGONOS
const [modoDibujoPoligono, setModoDibujoPoligono] = useState(false);
  const [puntosDibujo, setPuntosDibujo] = useState<Coordenada[]>([]);
  const [poligonoCerradoVisualmente, setPoligonoCerradoVisualmente] = useState(false);

const cerrarFormaVisualmente = () => setPoligonoCerradoVisualmente(true);
const abrirFormaVisualmente = () => setPoligonoCerradoVisualmente(false);

  const iniciarDibujoPoligono = () => {
    setModoDibujoPoligono(true);
    setPuntosDibujo([]);
    setPoligonoCerradoVisualmente(false);
  };

  const agregarPuntoPoligono = (pt: Coordenada) => {
    setPuntosDibujo((prev) => [...prev, pt]);
  };

  const cancelarDibujoPoligono = () => {
    setModoDibujoPoligono(false);
    setPuntosDibujo([]);
    setPoligonoCerradoVisualmente(false);
  };

  const deshacerUltimoPunto = () => {
  setPuntosDibujo((prev) => prev.slice(0, -1));
};
  //FIN  MODO DIBUJO DE POLIGONOS

  // MODO CREACIÓN DE RUTAS
  const [poligonoOrigenRuta, setPoligonoOrigenRuta] = useState<PoligonoRutaOption | null>(null);
  const [poligonoDestinoRuta, setPoligonoDestinoRuta] = useState<PoligonoRutaOption | null>(null);
  const [modoCreacionRuta, setModoCreacionRuta] = useState<ModoCreacionRuta>(null);
  const [rutaGeojsonCalculada, setRutaGeojsonCalculada] = useState<any>(null);

  const alCalcularRuta = (geojson: any) => {
    setRutaGeojsonCalculada(geojson);
  };

  const limpiarEstadoRuta = () => {
    setPoligonoOrigenRuta(null);
    setPoligonoDestinoRuta(null);
    setModoCreacionRuta(null);
    setRutaGeojsonCalculada(null);
  };

  //FIN CREAR RUTAS

  // RUTA DE VIAJE Y DESVIOS 
   const [viajeSeleccionadoMapa, setViajeSeleccionadoMapa] = useState<number | null>(null); 

  return (
    <ContextoUI.Provider
      value={{
        moduloActivo,
        setModuloActivo,
        elementoSeleccionadoId,
        setElementoSeleccionadoId,
        volverAlMenu,
        // PROPS PARA DIBUJAR POLIGONOS
       modoDibujoPoligono,
        puntosDibujo,
        iniciarDibujoPoligono,
        agregarPuntoPoligono,
        cancelarDibujoPoligono,
        deshacerUltimoPunto,
        poligonoCerradoVisualmente,
        cerrarFormaVisualmente,
        abrirFormaVisualmente,
        
        // PROPS PARA RUTAS
        poligonoOrigenRuta,
        setPoligonoOrigenRuta,
        poligonoDestinoRuta,
        setPoligonoDestinoRuta,
        modoCreacionRuta,
        setModoCreacionRuta,
        alCalcularRuta,
        rutaGeojsonCalculada,
        limpiarEstadoRuta,

        //props capa excesos
        excesoSeleccionadoMapa,
        setExcesoSeleccionadoMapa,

          //PROPS VIAJES CON DESVIOS 
        viajeSeleccionadoMapa,
        setViajeSeleccionadoMapa,


      }}
    >
      {children}
    </ContextoUI.Provider>
  );
};

export const useUI = () => {
  const context = useContext(ContextoUI);
  if (!context) throw new Error('useUI debe usarse dentro de ProveedorUI');
  return context;
};