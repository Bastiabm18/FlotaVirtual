// hooks/useEquiposRealtime.ts
'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EquipoRealtimePayload } from '@/types/rutas';



export function useEquiposRealtime(
  activo: boolean,
  onUpdate: (equipo: EquipoRealtimePayload) => void
) {
  // ref para que el callback siempre esté actualizado sin forzar
  // una nueva suscripción cada vez que el padre re-renderiza
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (!activo) return;

    const supabase = createClient();

    const canal = supabase
      .channel('equipo-posiciones')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'equipo' },
        (payload) => {
          callbackRef.current(payload.new as EquipoRealtimePayload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [activo]);
}