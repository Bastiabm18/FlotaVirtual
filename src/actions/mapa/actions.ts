'use server'

import { createClient } from '@/lib/supabase/server'
import { RutaData,PoligonoData, EquipoData, TipoPoligonoOption} from '@/types/rutas'
import { Polygon } from 'geojson';
import { cookies } from 'next/headers';

export async function getRutas(): Promise<{ data: RutaData[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase =  createClient(cookieStore)

  const { data, error } = await supabase.rpc('obtener_rutas_ori_des')

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as RutaData[], error: null }
}


export async function getPoligonos(): Promise<{ data: PoligonoData[] | null; error: string | null }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.rpc('obtener_poligonos_tipo')

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as PoligonoData[], error: null }

}

// --- ACTUALIZAR (Nombre y Descripción) ---
export async function actualizarPoligono(id: string, nombre: string, descripcion: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('poligonos') // o la tabla base correspondiente en Supabase
    .update({ nombre, descripcion })
    .eq('id', id)

  if (error) return { exito: false, error: error.message }
  return { exito: true, error: null }
}


export async function getTiposPoligono(): Promise<{ data: TipoPoligonoOption[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('tipo_poligono')
    .select('id, tipo_poligono, color, color_borde');

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function crearPoligonoConTipo(payload: {
  nombre: string;
  descripcion: string;
  geojson: Polygon;
  id_tipo_poligono: number;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Generar fecha y hora actual (ej: 20260607143022)
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  
  const timestamp = `${anio}${mes}${dia}${horas}${minutos}${segundos}`;
  const idPoligono = `POLY${timestamp}`;

  const { error } = await supabase.from('poligonos').insert({

    nombre: payload.nombre,
    id_poligono: idPoligono,
    descripcion: payload.descripcion,
    geometria: JSON.stringify(payload.geojson),
    id_tipo_poligono: payload.id_tipo_poligono,
  });

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}

export async function actualizarPoligonoCompleto(id: string, nombre: string, descripcion: string, id_tipo_poligono: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('poligonos')
    .update({ nombre, descripcion, id_tipo_poligono })
    .eq('id', id);

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}
export async function actualizarRuta(id: string, nombre: string, descripcion: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase
    .from('rutas')
    .update({ nombre, descripcion })
    .eq('id', id)

  if (error) return { exito: false, error: error.message }
  return { exito: true, error: null }
}

// --- ELIMINAR ---
export async function eliminarPoligono(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from('poligonos').delete().eq('id', id)
  console.log('Error al eliminar polígono:', error)
  if (error) return { exito: false, error: error.message }
  return { exito: true, error: null }
}

export async function eliminarRuta(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.from('rutas').delete().eq('id', id)

  if (error) return { exito: false, error: error.message }
  return { exito: true, error: null }
}

export async function crearPoligono(payload: {
  nombre: string;
  descripcion: string;
  geojson: Polygon;
}): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.rpc('crear_poligono', {
    p_nombre: payload.nombre,
    p_descripcion: payload.descripcion,
    p_geojson: payload.geojson,
  });

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}


// 

// --- MAPBOX DIRECTIONS API ---
export async function obtenerRutaMapbox(coordenadas: [number, number][]) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const coordsString = coordenadas.map((c) => `${c[0]},${c[1]}`).join(';')
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&overview=full&access_token=${token}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (!data.routes || data.routes.length === 0) {
      return { exito: false, data: null, error: 'No se encontró una ruta entre los puntos.' }
    }

    return {
      exito: true,
      data: {
        geojson: data.routes[0].geometry,
        distancia: data.routes[0].distance,
        duracion: data.routes[0].duration,
      },
      error: null,
    }
  } catch (err) {
    return { exito: false, data: null, error: 'Error al conectar con Mapbox Directions API' }
  }
}

export async function crearRuta(payload: {
  nombre: string;
  descripcion?: string;
  geoJsonGeometry: any; // El LineString en formato GeoJSON
  id_poligono_origen: string;
  id_poligono_destino: string;
}): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Llamar a la función RPC para crear la ruta y obtener su ID generado
  const { data: rutaId, error: errorRuta } = await supabase.rpc('crear_ruta', {
    p_nombre: payload.nombre,
    p_descripcion: payload.descripcion || null,
    p_geojson: payload.geoJsonGeometry,
  });

  if (errorRuta || !rutaId) {
    return { exito: false, error: errorRuta?.message || 'Error al guardar la ruta' };
  }

  // 2. Insertar en la tabla intermedia ruta_poligonos usando el ID devuelto
  const { error: errorRel } = await supabase.from('ruta_poligonos').insert({
    id_ruta: rutaId,
    id_poligono_origen: payload.id_poligono_origen,
    id_poligono_destino: payload.id_poligono_destino,
  });

  if (errorRel) {
    return { exito: false, error: errorRel.message };
  }

  return { exito: true, error: null };
}

export async function getEquipos(): Promise<{ data: EquipoData[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc('obtener_equipos');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as EquipoData[], error: null };
}