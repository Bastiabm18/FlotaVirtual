'use server';

import { createClient } from '@/lib/supabase/server'; // Ajusta según tu cliente de servidor
import { cookies } from 'next/headers';

export async function obtenerResumenExcesos(fechaDesde?: string, fechaHasta?: string, limiteVelocidad: number = 100) {
      const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase.rpc('fn_resumen_excesos_velocidad', {
    p_fecha_desde: fechaDesde || null,
    p_fecha_hasta: fechaHasta || null,
    p_limite_velocidad: limiteVelocidad,
  });

  if (error) {
    console.error('Error al obtener resumen de excesos:', error.message);
    return { exito: false, data: [] };
  }

  return { exito: true, data: data || [] };
}

export async function obtenerDetalleExcesosMovil(patente: string, fechaDesde?: string, fechaHasta?: string, limiteVelocidad: number = 100) {
      const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase.rpc('fn_detalle_excesos_movil', {
    p_patente: patente,
    p_fecha_desde: fechaDesde || null,
    p_fecha_hasta: fechaHasta || null,
    p_limite_velocidad: limiteVelocidad,
  });

  if (error) {
    console.error(`Error al obtener detalle de excesos para ${patente}:`, error.message);
    return { exito: false, data: [] };
  }

  return { exito: true, data: data || [] };
}