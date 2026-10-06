'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { useMapa } from '@/contexto/ContextoMapa';
import { getRutas, actualizarRuta, eliminarRuta, crearRuta, getPoligonos } from '@/actions/mapa/actions';
import { RutaData } from '@/types/rutas';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiLoader, FiCheck, FiX } from 'react-icons/fi';

export default function ModuloRutas() {
  const { 
    volverAlMenu, 
    poligonoOrigenRuta, 
    setPoligonoOrigenRuta, 
    poligonoDestinoRuta, 
    setPoligonoDestinoRuta, 
    modoCreacionRuta, 
    setModoCreacionRuta, 
    rutaGeojsonCalculada, 
    limpiarEstadoRuta 
  } = useUI();

  const { mapaRef } = useMapa();

  const [rutas, setRutas] = useState<RutaData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [editando, setEditando] = useState<RutaData | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    const res = await getRutas();
    if (res.data) setRutas(res.data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const enfocarRuta = (ruta: RutaData) => {
    if (!ruta.geojson?.coordinates?.length) return;
    const [lng, lat] = ruta.geojson.coordinates[0];
    mapaRef.current?.flyTo({ center: [lng, lat], zoom: 13 });
  };

  const handleEditar = (r: RutaData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditando(r);
    setFormNombre(r.nombre);
    setFormDesc(r.descripcion || '');
  };

  const guardarEdicion = () => {
    if (!editando) return;
    startTransition(async () => {
      const res = await actualizarRuta(editando.id, formNombre, formDesc);
      if (res.exito) {
        setEditando(null);
        cargarDatos();
      }
    });
  };

  const handleEliminar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;

    startTransition(async () => {
      const res = await eliminarRuta(id);
      if (res.exito) cargarDatos();
    });
  };

  // PARA LISTAR LOS POLIGONOS DISPONIBLES PARA ORIGEN Y DESTINO
  const [modoCreando, setModoCreando] = useState(false);
  const [listaPoligonos, setListaPoligonos] = useState<any[]>([]);

  // Cargar la lista de polígonos para los select desplegables
  useEffect(() => {
    const cargarPoligonos = async () => {
      const res = await getPoligonos();
      if (res.data) setListaPoligonos(res.data);
    };
    cargarPoligonos();
  }, []);

  // Nombre calculado automáticamente basado en origen y destino
  const nombreAutomatico = poligonoOrigenRuta && poligonoDestinoRuta 
    ? `${poligonoOrigenRuta.nombre} - ${poligonoDestinoRuta.nombre}`
    : '';

  return (
    <div className="flex flex-col h-full space-y-4">
      <button
        onClick={()=> {  
          setModoCreando(false);
          limpiarEstadoRuta();
          volverAlMenu();
        }}
        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
      >
        <FiArrowLeft /> Volver al menú principal
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Rutas</h2>
        <button
          onClick={() => {
            setModoCreando(true);
            limpiarEstadoRuta();
            setModoCreacionRuta('MANUAL');
          }}
          className="p-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg text-xs flex items-center gap-1 border border-purple-500/30 cursor-pointer"
        >
          <FiPlus /> Crear
        </button>
      </div>

      {editando && (
        <div className="p-3 bg-zinc-800/90 border border-purple-500/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400">Editar Ruta</span>
            <button onClick={() => setEditando(null)} className="text-zinc-400 hover:text-white"><FiX size={14} /></button>
          </div>
          <input
            type="text"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
          />
          <textarea
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="Descripción"
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white resize-none"
          />
          <button
            onClick={guardarEdicion}
            disabled={isPending}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiCheck /> Guardar</>}
          </button>
        </div>
      )}

      {modoCreando && (
        <div className="p-3 bg-zinc-800/90 border border-purple-500/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400">Crear Nueva Ruta</span>
            <button 
              onClick={() => {
                setModoCreando(false);
                limpiarEstadoRuta();
              }} 
              className="text-zinc-400 hover:text-white"
            >
              <FiX size={14} />
            </button>
          </div>

          {/* Select Polígono Origen */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Polígono Origen</label>
            <select
              value={poligonoOrigenRuta?.id || ''}
              onChange={(e) => {
                const sel = listaPoligonos.find((p) => String(p.id) === e.target.value);
                setPoligonoOrigenRuta(sel || null);
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
            >
              <option value="">-- Seleccionar Origen --</option>
              {listaPoligonos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Select Polígono Destino */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Polígono Destino</label>
            <select
              value={poligonoDestinoRuta?.id || ''}
              onChange={(e) => {
                const sel = listaPoligonos.find((p) => String(p.id) === e.target.value);
                setPoligonoDestinoRuta(sel || null);
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
            >
              <option value="">-- Seleccionar Destino --</option>
              {listaPoligonos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre automático generado (Solo visualización) */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Nombre de la Ruta (Automático)</label>
            <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2 text-xs text-purple-300 font-medium truncate">
              {nombreAutomatico || <span className="text-zinc-600 italic">Selecciona origen y destino</span>}
            </div>
          </div>

          {/* Descripción opcional */}
          <textarea
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white resize-none"
          />

          {/* Seleccionar Modo (Automático o Manual) */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setModoCreacionRuta('AUTOMATICO')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                modoCreacionRuta === 'AUTOMATICO'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              Automático
            </button>
            <button
              type="button"
              onClick={() => setModoCreacionRuta('MANUAL')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                modoCreacionRuta === 'MANUAL'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              Manual
            </button>
          </div>

          {/* Botón Guardar en Base de Datos */}
          <button
            onClick={() => {
              if (!nombreAutomatico || !rutaGeojsonCalculada) return;
              startTransition(async () => {
                const res = await crearRuta({
                  nombre: nombreAutomatico,
                  descripcion: formDesc,
                  geoJsonGeometry: rutaGeojsonCalculada,
                  id_poligono_origen: String(poligonoOrigenRuta?.id || ''),
                  id_poligono_destino: String(poligonoDestinoRuta?.id || ''),
                });
                if (res.exito) {
                  setModoCreando(false);
                  limpiarEstadoRuta();
                  setFormDesc('');
                  cargarDatos();
                }
              });
            }}
            disabled={isPending || !rutaGeojsonCalculada || !nombreAutomatico}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiCheck /> Guardar Ruta</>}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {cargando ? (
          <div className="flex justify-center p-8 text-zinc-500"><FiLoader className="animate-spin text-lg" /></div>
        ) : rutas.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">No hay rutas registradas.</p>
        ) : (
          rutas.map((r) => (
            <div
              key={r.id}
              onClick={() => enfocarRuta(r)}
              className="group p-3 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-200 truncate">{r.nombre}</p>
                <p className="text-[11px] text-zinc-400 truncate">{r.descripcion || 'Sin descripción'}</p>
                <p className="text-[11px] text-blue-400 font-semibold">Distancia: {r.largo_km.toFixed(2)} km</p>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  onClick={(e) => handleEditar(r, e)}
                  title="Editar"
                  className="p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-purple-400 rounded-lg transition-colors cursor-pointer"
                >
                  <FiEdit2 size={13} />
                </button>
                <button
                  onClick={(e) => handleEliminar(r.id, e)}
                  title="Eliminar"
                  className="p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}