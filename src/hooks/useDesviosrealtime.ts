// hooks/useDesviosRealtime.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DesvioRealtimePayload, DesvioToastItem } from '@/types/rutas';

export function useDesviosRealtime() {
  const [desviosActivos, setDesviosActivos] = useState<DesvioToastItem[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Canal explícito configurado con esquema y filtro de postgres_changes
    const canal = supabase
      .channel('cambios-desvios-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'desvio_viaje',
        },
        (payload) => {
          console.log('¡Payload recibido con éxito!', payload);
          const nuevoDesvio = payload.new as DesvioRealtimePayload;

          if (!nuevoDesvio) return;

          setDesviosActivos((prev) => {
            const indexExistente = prev.findIndex((d) => d.id_equipo === nuevoDesvio.id_equipo);

            if (indexExistente >= 0) {
              const actualizado = [...prev];
              actualizado[indexExistente] = {
                ...actualizado[indexExistente],
                cantidad: actualizado[indexExistente].cantidad + 1,
                ultimaDistancia: nuevoDesvio.distancia,
                fechaUltimo: nuevoDesvio.fecha_creacion || new Date().toISOString(),
              };
              return actualizado;
            } else {
              return [
                {
                  id_equipo: nuevoDesvio.id_equipo,
                  cantidad: 1,
                  ultimaDistancia: nuevoDesvio.distancia,
                  fechaUltimo: nuevoDesvio.fecha_creacion || new Date().toISOString(),
                },
                ...prev,
              ];
            }
          });
        }
      )
      .subscribe((status, err) => {
        console.log('Estado de suscripción:', status);
        if (err) console.error('Error en canal de desvíos:', err);
      });

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const cerrarToast = (id_equipo: string) => {
    setDesviosActivos((prev) => prev.filter((d) => d.id_equipo !== id_equipo));
  };

  return {
    desviosActivos,
    cerrarToast,
  };
}