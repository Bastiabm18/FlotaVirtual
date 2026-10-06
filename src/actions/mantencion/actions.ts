// ========================================================
// 1. SERVER ACTIONS (`src/actions/gestion/mantencion-actions.ts`)
// ========================================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { MantencionData } from '@/types/mantencion';
import { cookies } from 'next/headers';



export async function getMantencionesListado(): Promise<{ data: MantencionData[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('mantencion_equipo')
    .select(`
      id,
      id_equipo,
      fecha_ini,
      fecha_fin,
      estado,
      observaciones,
      equipo:id_equipo ( patente_equipo, marca_equipo ),
      tipo_mantencion:id_tipo_mantencion ( nombre_tipo ),
      mecanico:id_mecanico ( nombre_mecanico )
    `)
    .order('id', { ascending: false });

  if (error) return { data: null, error: error.message };

  const formateado: MantencionData[] = (data || []).map((m: any) => ({
    id: m.id,
    id_equipo: m.id_equipo,
    patente_equipo: m.equipo?.patente_equipo || 'S/N',
    marca_equipo: m.equipo?.marca_equipo || 'Desconocida',
    nombre_tipo: m.tipo_mantencion?.nombre_tipo || 'General',
    fecha_ini: m.fecha_ini,
    fecha_fin: m.fecha_fin,
    estado: m.estado,
    nombre_mecanico: m.mecanico?.nombre_mecanico || 'Sin asignar',
    observaciones: m.observaciones,
  }));

  return { data: formateado, error: null };
}

export async function crearMantencionFalla(payload: {
  id_equipo: number;
  id_mecanico: number;
  observaciones: string;
}): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Insertar mantención por falla (tipo 2)
  const { error: errMantencion } = await supabase.from('mantencion_equipo').insert({
    id_equipo: payload.id_equipo,
    id_tipo_mantencion: 2, // Falla mecánica
    id_mecanico: payload.id_mecanico,
    observaciones: payload.observaciones,
    estado: true,
  });

  if (errMantencion) return { exito: false, error: errMantencion.message };

  // 2. Cambiar estado del equipo a Mantención (ejemplo: id_estado_equipo = 2 para mantención)
  const { error: errEquipo } = await supabase
    .from('equipo')
    .update({ id_estado_equipo: 2 }) 
    .eq('id_equipo', payload.id_equipo);

  if (errEquipo) return { exito: false, error: errEquipo.message };

  return { exito: true, error: null };
}

export async function finalizarMantencion(idMantencion: number, idEquipo: number): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Finalizar registro de mantención
  const { error: errMant } = await supabase
    .from('mantencion_equipo')
    .update({ 
      estado: false, 
      fecha_fin: new Date().toISOString() 
    })
    .eq('id', idMantencion);

  if (errMant) return { exito: false, error: errMant.message };

  // 2. Devolver equipo a estado Operativo (ejemplo: id_estado_equipo = 1) y actualizar última mantención
  const { error: errEq } = await supabase
    .from('equipo')
    .update({ 
      id_estado_equipo: 1,
      ultima_mantencion: new Date().toISOString().split('T')[0]
    })
    .eq('id_equipo', idEquipo);

  if (errEq) return { exito: false, error: errEq.message };

  return { exito: true, error: null };
}