'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { AsignacionEquipoDetalle, ConductorData, EstadoProductoOption, ProductoData } from '@/types/rutas';
import { EquipoAsignadoDisponible, PoligonoOption, ClienteOption , ViajeDetalle, ProductoOption } from '@/types/viajes';

// 1. Obtener listado de equipos con su estado y conductor actual mediante una query estructurada
export async function getEquiposAsignaciones(): Promise<{ data: AsignacionEquipoDetalle[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc('get_equipo_asignaciones');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as AsignacionEquipoDetalle[], error: null };
}
// 2. Obtener conductores disponibles (id_estado_conductor = 1, asumiendo 1 es 'Disponible')
export async function getConductoresDisponibles(): Promise<{ data: ConductorData[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('conductores')
    .select('*')
    .eq('estado_conductor', true)
    .eq('id_estado_conductor', 1); // 1 = Disponible

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// 3. Asignar Conductor a Equipo (Crea asignación y actualiza estados de ambos)
export async function asignarConductorEquipo(id_equipo: number, id_conductor: string): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // A. Crear el registro en la tabla intermedia
  const { error: errAsig } = await supabase.from('asignacion_equipo_conductor').insert({
    id_equipo,
    id_conductor,
    estado: true,
  });

  if (errAsig) return { exito: false, error: errAsig.message };

  // B. Cambiar estado del equipo a 'Asignado' (ID 2, según orden de inserción habitual)
  await supabase.from('equipo').update({ id_estado_equipo: 2 }).eq('id_equipo', id_equipo);
  

  // C. Cambiar estado del conductor a 'En Conducción' (ID 2)
  await supabase.from('conductores').update({ id_estado_conductor: 2 }).eq('id', id_conductor);

  return { exito: true, error: null };
}

// 4. Finalizar Asignación (Cierra la asignación y libera ambos recursos a 'Disponible')
export async function finalizarAsignacion(id_asignacion: number, id_equipo: number, id_conductor: string): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // A. Cerrar asignación intermedia
  const { error: errAsig } = await supabase
    .from('asignacion_equipo_conductor')
    .update({ estado: false, fecha_fin: new Date().toISOString() })
    .eq('id', id_asignacion);

  if (errAsig) return { exito: false, error: errAsig.message };

  // B. Liberar equipo a 'Disponible' (ID 1)
  await supabase.from('equipo').update({ id_estado_equipo: 1 }).eq('id_equipo', id_equipo);

  // C. Liberar conductor a 'Disponible' (ID 1)
  await supabase.from('conductores').update({ id_estado_conductor: 1 }).eq('id', id_conductor);

  return { exito: true, error: null };
}

//==============================================================
//============================GESTIONAR VIAJES =================
//==============================================================

export async function getViajesActivos(): Promise<{ data: ViajeDetalle[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc('get_viajes_activos');

  if (error) return { data: null, error: error.message };
  return { data: data as ViajeDetalle[], error: null };
}

export async function getEquiposDisponiblesViaje(): Promise<{ data: EquipoAsignadoDisponible[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc('get_equipos_disponibles_para_viaje');

  if (error) return { data: null, error: error.message };
  return { data: data as EquipoAsignadoDisponible[], error: null };
}

export async function getPoligonosList(): Promise<{ data: PoligonoOption[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('poligonos').select('id, nombre').eq('estado', true);
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getClientesList(): Promise<{ data: ClienteOption[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('cliente').select('id, nombre_cliente').eq('estado_cliente', true);
 //console.log(data);
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getProductosList(): Promise<{ data: ProductoOption[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('producto').select('id, nombre_producto').eq('estado', true);
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function crearViaje(payload: {
  id_equipo: number;
  id_conductor: string;
  id_origen: string;
  id_destino: string;
  id_cliente: number;
  id_producto: number;
  guia_numero: string;
  cantidad: number;
  peso: number;
}): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Crear la guía de carga primero
  const { data: guiaData, error: errGuia } = await supabase
    .from('guia')
    .insert({
      producto: payload.guia_numero,
      cantidad: payload.cantidad,
      peso: payload.peso,
    })
    .select('id')
    .single();

  if (errGuia || !guiaData) {
    return { exito: false, error: errGuia?.message || 'Error al registrar la guía' };
  }

  // 2. Crear el registro del viaje
  const { error: errViaje } = await supabase.from('viajes').insert({
    id_equipo: payload.id_equipo,
    id_conductor: payload.id_conductor,
    id_origen: payload.id_origen,
    id_destino: payload.id_destino,
    id_cliente: payload.id_cliente,
    id_producto: payload.id_producto,
    id_guia: guiaData.id,
    estado_viaje: 1, // En Ejecución
  });

  if (errViaje) return { exito: false, error: errViaje.message };

  return { exito: true, error: null };
}

export async function finalizarViaje(id_viaje: number): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('viajes')
    .update({ 
      estado_viaje: 2, // Finalizado
      fecha_hora_lle_des: new Date().toISOString() 
    })
    .eq('id_viaje', id_viaje);

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}


//==============================================================
//===============FIN =============GESTIONAR VIAJES =============
//==============================================================

//================ PRODUCTOS===========================================


export async function getProductosListado(): Promise<{ data: ProductoData[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('producto')
    .select(`
      id,
      nombre_producto,
      id_estado_producto,
      estado,
      estado_producto:id_estado_producto (
        nombre_estado
      )
    `)
    .order('id', { ascending: false });

  if (error) return { data: null, error: error.message };

  const formateado: ProductoData[] = (data || []).map((p: any) => ({
    id: p.id,
    nombre_producto: p.nombre_producto,
    id_estado_producto: p.id_estado_producto,
    nombre_estado_producto: p.estado_producto?.nombre_estado || 'Desconocido',
    estado: p.estado ?? true,
  }));

  return { data: formateado, error: null };
}

export async function getEstadosProductoList(): Promise<{ data: EstadoProductoOption[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('estado_producto').select('id, nombre_estado');
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function guardarProducto(payload: {
  id?: number;
  nombre_producto: string;
  id_estado_producto: number;
  estado: boolean;
}): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (payload.id) {
    // Actualizar
    const { error } = await supabase
      .from('producto')
      .update({
        nombre_producto: payload.nombre_producto,
        id_estado_producto: payload.id_estado_producto,
        estado: payload.estado,
      })
      .eq('id', payload.id);

    if (error) return { exito: false, error: error.message };
  } else {
    // Insertar
    const { error } = await supabase.from('producto').insert({
      nombre_producto: payload.nombre_producto,
      id_estado_producto: payload.id_estado_producto,
      estado: payload.estado,
    });

    if (error) return { exito: false, error: error.message };
  }

  return { exito: true, error: null };
}

export async function cambiarEstadoProducto(id: number, estado: boolean): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('producto')
    .update({ estado })
    .eq('id', id);

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}
//================FIN PRODUCTOS===========================================