'use server';

import { createClient } from '@/lib/supabase/server';
import { ConductorData } from '@/types/rutas';
import { DatosUsuarioCompleto } from '@/types/usuario';
import { ClienteData } from '@/types/usuario';
import { cookies,headers  } from 'next/headers';



export async function obtenerPerfilUsuario(): Promise<{
  exito: boolean;
  usuario: DatosUsuarioCompleto | null;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Verificar sesión activa desde el servidor
    const { data: { user }, error: errorAuth } = await supabase.auth.getUser();

    if (errorAuth || !user) {
      return { exito: false, usuario: null, error: 'Sesión no válida o expirada' };
    }

    // 2. Consultar perfil en la tabla 'usuarios'
    const { data: perfil, error: errorPerfil } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (errorPerfil) {
      console.error('[Server Action Error - Perfil]:', errorPerfil.message);
    }

    // 3. Mapear respuesta limpia para el cliente
    const usuarioLimpio: DatosUsuarioCompleto = {
      id: user.id,
      email: user.email || '',
      nombre: perfil?.nombre || user.user_metadata?.nombre_completo || user.user_metadata?.full_name || 'Usuario',
      empresa: perfil?.empresa || user.user_metadata?.empresa || 'Sin Empresa',
      avatarUrl: perfil?.avatar_url || user.user_metadata?.avatar_url,
      proveedor: perfil?.proveedor || user.app_metadata?.provider || 'email',
    };

    return {
      exito: true,
      usuario: usuarioLimpio,
    };
  } catch (err: any) {
    console.error('[Server Action Error - Exception]:', err.message);
    return {
      exito: false,
      usuario: null,
      error: 'Error interno al consultar el perfil del usuario',
    };
  }
}

export async function actualizarPerfilUsuario(payload: {
  nombre: string;
  empresa: string;
}): Promise<{ exito: boolean; error: string | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: errorAuth } = await supabase.auth.getUser();
    if (errorAuth || !user) {
      return { exito: false, error: 'Sesión no válida o expirada' };
    }

    // Actualizamos o insertamos el perfil en la tabla 'usuarios' vinculada por el ID de auth
    const { error } = await supabase
      .from('usuarios')
      .upsert({
        id: user.id,
        email: user.email, // Requerido por la tabla si es nuevo registro
        nombre: payload.nombre.trim(),
        empresa: payload.empresa.trim(),
      });

    if (error) {
      return { exito: false, error: error.message };
    }

    return { exito: true, error: null };
  } catch (err: any) {
    return { exito: false, error: err.message || 'Error interno al actualizar perfil' };
  }
}


//========================================================
//=========================CONDUCTORES===============================
//========================================================



export async function getConductores(): Promise<{ data: ConductorData[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc('get_conductores_activos');

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// 2. Crear un nuevo conductor
export async function crearConductor(payload: Omit<ConductorData, 'id' | 'estado_conductor' | 'fecha_ingreso'>): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('conductores').insert({
    nombre: payload.nombre,
    apellidopat: payload.apellidopat,
    apellidomat: payload.apellidomat,
    rut: payload.rut,
    edad: payload.edad,
    fecha_nacimiento: payload.fecha_nacimiento,
    tipo_licencia: payload.tipo_licencia,
  });

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}

// 3. Actualizar datos completos de un conductor
export async function actualizarConductor(id: string, payload: Omit<ConductorData, 'id' | 'estado_conductor' | 'fecha_ingreso'>): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('conductores')
    .update({
      nombre: payload.nombre,
      apellidopat: payload.apellidopat,
      apellidomat: payload.apellidomat,
      rut: payload.rut,
      edad: payload.edad,
      fecha_nacimiento: payload.fecha_nacimiento,
      tipo_licencia: payload.tipo_licencia,
    })
    .eq('id', id);

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}

// 4. Desvincular (Cambiar estado a false de forma lógica)
export async function desvincularConductor(id: string): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('conductores')
    .update({ estado_conductor: false })
    .eq('id', id);

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}


//========================================================
//=========================CONDUCTORES===============================
//========================================================


// ========================CLIENTES==============================



export async function getClientesListado(): Promise<{ data: ClienteData[] | null; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('cliente')
    .select('id, nombre_cliente, es_empresa, estado_cliente')
    .order('id', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function guardarCliente(payload: {
  id?: number;
  nombre_cliente: string;
  es_empresa: boolean;
  estado_cliente: boolean;
}): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (payload.id) {
    // Actualizar
    const { error } = await supabase
      .from('cliente')
      .update({
        nombre_cliente: payload.nombre_cliente,
        es_empresa: payload.es_empresa,
        estado_cliente: payload.estado_cliente,
      })
      .eq('id', payload.id);

    if (error) return { exito: false, error: error.message };
  } else {
    // Insertar
    const { error } = await supabase.from('cliente').insert({
      nombre_cliente: payload.nombre_cliente,
      es_empresa: payload.es_empresa,
      estado_cliente: payload.estado_cliente,
    });

    if (error) return { exito: false, error: error.message };
  }

  return { exito: true, error: null };
}

export async function cambiarEstadoCliente(id: number, estado_cliente: boolean): Promise<{ exito: boolean; error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('cliente')
    .update({ estado_cliente })
    .eq('id', id);

  if (error) return { exito: false, error: error.message };
  return { exito: true, error: null };
}


//*********************************************************************** */

type Resultado = { exito: boolean; error: string | null };

export async function iniciarSesion(email: string, password: string): Promise<Resultado> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { exito: false, error: error.message };

    return { exito: true, error: null };
  } catch (err: any) {
    return { exito: false, error: err.message || 'Error al iniciar sesión.' };
  }
}

export async function registrarUsuario(payload: {
  email: string;
  password: string;
  nombre: string;
  empresa: string;
}): Promise<Resultado> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          nombre_completo: payload.nombre.trim(),
          empresa: payload.empresa.trim(),
        },
      },
    });
    if (error) return { exito: false, error: error.message };

    return { exito: true, error: null };
  } catch (err: any) {
    return { exito: false, error: err.message || 'Error al registrar.' };
  }
}

export async function obtenerUrlGoogle(): Promise<{ url: string | null; error: string | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const origin =
      (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (error || !data.url) {
      return { url: null, error: error?.message || 'No se pudo iniciar con Google.' };
    }

    return { url: data.url, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Error al conectar con Google.' };
  }
}

export async function cerrarSesion(): Promise<Resultado> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.signOut();
  return { exito: !error, error: error?.message ?? null };
}