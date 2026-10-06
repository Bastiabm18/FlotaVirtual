// hooks/useAnimarPosicion.ts
'use client';

import { useRef } from 'react';

interface Coordenada {
  lng: number;
  lat: number;
  heading: number;
}

const DURACION_MS = 1200;

// interpolación angular corta (evita que el heading gire "por el lado largo",
// ej: de 350° a 10° debe girar +20°, no -340°)
function interpolarAngulo(desde: number, hasta: number, t: number) {
  let diferencia = ((hasta - desde + 540) % 360) - 180;
  return desde + diferencia * t;
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function useAnimarPosicion() {
  // guarda el frame activo por cada equipo, para poder cancelarlo si llega otro update antes de terminar
  const framesActivos = useRef<Map<number, number>>(new Map());

  function animar(
    idEquipo: number,
    desde: Coordenada,
    hasta: Coordenada,
    onFrame: (coord: Coordenada) => void
  ) {
    // si ya había una animación corriendo para este equipo, la cancelamos
    const frameAnterior = framesActivos.current.get(idEquipo);
    if (frameAnterior) cancelAnimationFrame(frameAnterior);

    const inicio = performance.now();

    function tick(ahora: number) {
      const progresoLineal = Math.min((ahora - inicio) / DURACION_MS, 1);
      const t = easeInOutQuad(progresoLineal);

      onFrame({
        lng: desde.lng + (hasta.lng - desde.lng) * t,
        lat: desde.lat + (hasta.lat - desde.lat) * t,
        heading: interpolarAngulo(desde.heading, hasta.heading, t),
      });

      if (progresoLineal < 1) {
        const id = requestAnimationFrame(tick);
        framesActivos.current.set(idEquipo, id);
      } else {
        framesActivos.current.delete(idEquipo);
      }
    }

    const id = requestAnimationFrame(tick);
    framesActivos.current.set(idEquipo, id);
  }

  return { animar };
}