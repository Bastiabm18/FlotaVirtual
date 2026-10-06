'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Función principal: Obtiene la lista de viajes finalizados consumiendo la RPC de la BD.
 */
export async function obtenerViajesFinalizados() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase.rpc('fn_obtener_viajes_finalizados');

  if (error) {
    console.error('Error al obtener viajes finalizados por RPC:', error.message);
    return { exito: false, data: [] };
  }

  return { exito: true, data: data || [] };
}

/**
 * Función principal: Obtiene el detalle completo (ruta teórica, real y desvíos) para el mapa vía RPC.
 */
export async function obtenerDetalleViajeFinalizado(idViaje: number) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  console.log(`Obteniendo detalle para viaje: ${idViaje}`);
  
  const { data, error } = await supabase.rpc('get_detalle_viaje_finalizado', {
    p_id_viaje: idViaje,
  });

  // LOG PARA DEPURACIÓN 
  console.log('Datos devueltos por RPC:', JSON.stringify(data, null, 2));
  if (error) {
    console.error(`Error al obtener detalle del viaje ${idViaje} por RPC:`, error.message);
    return { exito: false, data: null };
  }

  return { exito: true, data: data };
}