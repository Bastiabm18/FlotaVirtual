// supabase/functions/fetch-gps-gpsimple/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BASE_URL = 'https://apiempresat.gpsimple.cl'

interface TelemetriaGPSimple {
  ppu: string
  ultimo_reporte: string
  latitud: string | number
  longitud: string | number
  velocidad: string | number
  angulo: string | number
}

interface ResultadoPatente {
  ppu: string
  status: 'ok' | 'error'
  detalle?: string
}

async function login(apiUser: string, apiPass: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/LOGIN_GS`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: apiUser, password: apiPass }),
  })

  const data = await res.json()

  if (!res.ok || !data?.token) {
    throw new Error(`LOGIN_GS falló (HTTP ${res.status}): ${data?.mensaje ?? 'sin token'}`)
  }

  return data.token as string
}

async function consultarPosicion(ppu: string, token: string): Promise<TelemetriaGPSimple | null> {
  const url = `${BASE_URL}/RT_GS_PT_O?PPU=${encodeURIComponent(ppu)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) return null

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  return data[0] as TelemetriaGPSimple
}

async function procesarEnLotes<T, R>(
  items: T[],
  tamanoLote: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const resultados: R[] = []
  for (let i = 0; i < items.length; i += tamanoLote) {
    const lote = items.slice(i, i + tamanoLote)
    const res = await Promise.all(lote.map(fn))
    resultados.push(...res)
  }
  return resultados
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const apiUser = Deno.env.get('GPS_SIMPLE_USER')!
  const apiPass = Deno.env.get('GPS_SIMPLE_PASS')!

  try {
    const token = await login(apiUser, apiPass)

    const { data: moviles, error: errMoviles } = await supabase
      .from('moviles')
      .select('patente_movil')
      .eq('activo', true)

    if (errMoviles) throw errMoviles
    if (!moviles || moviles.length === 0) {
      return new Response(JSON.stringify({ ok: true, msg: 'sin patentes activas' }), { status: 200 })
    }

    const resultados: ResultadoPatente[] = await procesarEnLotes(
      moviles,
      5,
      async ({ patente_movil }): Promise<ResultadoPatente> => {
        const ppu = patente_movil.trim()

        try {
          const t = await consultarPosicion(ppu, token)
          if (!t) {
            return { ppu, status: 'error', detalle: 'sin respuesta de la API' }
          }

          const { error: errInsert } = await supabase
            .from('historial_gps_simple')
            .upsert(
              {
                patente_movil: ppu,
                fecha_reporte: t.ultimo_reporte,
                latitud: Number(t.latitud),
                longitud: Number(t.longitud),
                velocidad: Number(t.velocidad),
                angulo: Number(t.angulo),
              },
              { onConflict: 'patente_movil,fecha_reporte', ignoreDuplicates: true }
            )

          if (errInsert) {
            return { ppu, status: 'error', detalle: errInsert.message }
          }

          return { ppu, status: 'ok' }
        } catch (e) {
          return { ppu, status: 'error', detalle: String(e) }
        }
      }
    )

    const exitos = resultados.filter((r) => r.status === 'ok').length
    const errores = resultados.filter((r) => r.status === 'error').length

    return new Response(
      JSON.stringify({ ok: true, exitos, errores, resultados }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error en fetch-gps-gpsimple:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})