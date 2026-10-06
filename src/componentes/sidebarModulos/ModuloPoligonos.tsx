'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { useMapa } from '@/contexto/ContextoMapa';
import { 
  getPoligonos, 
  crearPoligonoConTipo, 
  actualizarPoligonoCompleto, 
  eliminarPoligono, 
  getTiposPoligono, 
   
} from '@/actions/mapa/actions';
import { PoligonoData, TipoPoligonoOption } from '@/types/rutas';
import { Polygon } from 'geojson';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiLoader, 
  FiCheck, 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle,
  FiTag 
} from 'react-icons/fi';

export default function ModuloPoligonos() {
  const { volverAlMenu, modoDibujoPoligono, puntosDibujo, 
  iniciarDibujoPoligono, 
  cancelarDibujoPoligono,
  poligonoCerradoVisualmente, 
  cerrarFormaVisualmente, 
  abrirFormaVisualmente } = useUI();
  const { mapaRef } = useMapa();

  const [poligonos, setPoligonos] = useState<PoligonoData[]>([]);
  const [tiposPoligono, setTiposPoligono] = useState<TipoPoligonoOption[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estado para creación de nuevo polígono
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [descNueva, setDescNueva] = useState('');
  const [tipoNuevoId, setTipoNuevoId] = useState<number>(1);

  // Estado para edición rápida de existentes
  const [editando, setEditando] = useState<PoligonoData | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTipoId, setFormTipoId] = useState<number>(1);

  const sePuedeCerrar = puntosDibujo.length >= 3;

  const cargarDatos = async () => {
    setCargando(true);
    const [resPolis, resTipos] = await Promise.all([
      getPoligonos(),
      getTiposPoligono()
    ]);

    if (resPolis.data) setPoligonos(resPolis.data);
    if (resTipos.data) {
      setTiposPoligono(resTipos.data);
      if (resTipos.data.length > 0) {
        setTipoNuevoId(resTipos.data[0].id);
      }
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const enfocarGeocerca = (poligono: PoligonoData) => {
    if (!poligono.geojson?.coordinates?.[0]?.length) return;
    const [lng, lat] = poligono.geojson.coordinates[0][0];
    mapaRef.current?.flyTo({ center: [lng, lat], zoom: 14, pitch: 30 });
  };

  const handleGuardarPoligonoCreado = () => {
    if (!sePuedeCerrar || !nombreNuevo.trim()) return;

    const primerPunto: [number, number] = [puntosDibujo[0].lng, puntosDibujo[0].lat];
    const vertices: [number, number][] = puntosDibujo.map((p) => [p.lng, p.lat]);
    const anilloCerrado = [...vertices, primerPunto];

    const geojson: Polygon = {
      type: 'Polygon',
      coordinates: [anilloCerrado],
    };

    startTransition(async () => {
      const res = await crearPoligonoConTipo({
        nombre: nombreNuevo.trim(),
        descripcion: descNueva.trim(),
        geojson,
        id_tipo_poligono: Number(tipoNuevoId),
      });

      if (res.exito) {
        setNombreNuevo('');
        setDescNueva('');
        cancelarDibujoPoligono();
        cargarDatos();
      } else {
        alert(`Error al guardar: ${res.error}`);
      }
    });
  };

  const handleEditar = (p: PoligonoData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditando(p);
    setFormNombre(p.nombre);
    setFormDesc(p.descripcion || '');
    
    // Buscar ID correspondiente al tipo actual del polígono
    const matchTipo = tiposPoligono.find(t => t.tipo_poligono === p.tipo_poligono);
    setFormTipoId(matchTipo ? matchTipo.id : (tiposPoligono[0]?.id || 1));
  };

  const guardarEdicion = () => {
    if (!editando) return;
    startTransition(async () => {
      const res = await actualizarPoligonoCompleto(
        editando.id, 
        formNombre, 
        formDesc, 
        Number(formTipoId)
      );
      if (res.exito) {
        setEditando(null);
        cargarDatos();
      } else {
        alert(`Error al actualizar: ${res.error}`);
      }
    });
  };

  const handleEliminar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar este polígono?')) return;

    startTransition(async () => {
      const res = await eliminarPoligono(id);
      if (res.exito) cargarDatos();
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <button
        onClick={volverAlMenu}
        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
      >
        <FiArrowLeft /> Volver al menú principal
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Polígonos / Geocercas</h2>
        {!modoDibujoPoligono && (
          <button
            onClick={iniciarDibujoPoligono}
            className="p-1.5 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 rounded-lg text-xs flex items-center gap-1 border border-orange-500/30 cursor-pointer"
          >
            <FiPlus /> Crear
          </button>
        )}
      </div>

      {/* PANEL MODO DIBUJO ACTIVO */}
      {modoDibujoPoligono && (
        <div className="p-3 bg-zinc-800/90 border border-orange-500/50 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Modo Dibujo Activo</span>
            <button onClick={cancelarDibujoPoligono} className="text-zinc-400 hover:text-white cursor-pointer">
              <FiX size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-300 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
            <FiAlertCircle className="text-orange-400 shrink-0" size={14} />
            <span>Haz clic en el mapa para añadir puntos. ({puntosDibujo.length} seleccionados)</span>
          </div>

          <input
            type="text"
            placeholder="Nombre del polígono *"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-semibold">Tipo de Polígono *</label>
            <select
              value={tipoNuevoId}
              onChange={(e) => setTipoNuevoId(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {tiposPoligono.map((t) => (
                <option key={t.id} value={t.id}>{t.tipo_poligono}</option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Descripción (opcional)"
            value={descNueva}
            onChange={(e) => setDescNueva(e.target.value)}
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-orange-500"
          />
          {sePuedeCerrar && (
              <button
                type="button"
                onClick={poligonoCerradoVisualmente ? abrirFormaVisualmente : cerrarFormaVisualmente}
                className="w-full py-1.5 rounded-lg text-xs font-medium border bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30"
              >
                {poligonoCerradoVisualmente ? 'Reabrir Trazo' : 'Cerrar Forma Visualmente'}
              </button>
          )}

          <button
            onClick={handleGuardarPoligonoCreado}
            disabled={!sePuedeCerrar || !nombreNuevo.trim() || isPending}
            className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              sePuedeCerrar && nombreNuevo.trim()
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            {isPending ? (
              <FiLoader className="animate-spin" />
            ) : (
              <>
                <FiCheckCircle size={14} />
                {sePuedeCerrar ? 'Cerrar Polígono y Guardar' : `Requiere al menos 3 puntos (${puntosDibujo.length}/3)`}
              </>
            )}
          </button>
        </div>
      )}

      {/* FORMULARIO DE EDICIÓN RÁPIDA */}
      {editando && (
        <div className="p-3 bg-zinc-800/90 border border-orange-500/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400">Editar Polígono</span>
            <button onClick={() => setEditando(null)} className="text-zinc-400 hover:text-white"><FiX size={14} /></button>
          </div>
          <input
            type="text"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
          />
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-semibold">Tipo de Polígono</label>
            <select
              value={formTipoId}
              onChange={(e) => setFormTipoId(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-xs text-white"
            >
              {tiposPoligono.map((t) => (
                <option key={t.id} value={t.id}>{t.tipo_poligono}</option>
              ))}
            </select>
          </div>
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
            className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><FiCheck /> Guardar</>}
          </button>
        </div>
      )}

      {/* LISTADO DE POLÍGONOS */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {cargando ? (
          <div className="flex justify-center p-8 text-zinc-500"><FiLoader className="animate-spin text-lg" /></div>
        ) : poligonos.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">No hay polígonos registrados.</p>
        ) : (
          poligonos.map((p) => (
            <div
              key={p.id}
              onClick={() => enfocarGeocerca(p)}
              className="group p-3 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{p.nombre}</p>
                  {p.tipo_poligono && (
                    <span 
                      className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium border"
                      style={{ 
                        backgroundColor: `${p.color || '#333'}22`, 
                        borderColor: `${p.color || '#555'}55`,
                        color: p.color || '#ccc' 
                      }}
                    >
                      <FiTag size={10} /> {p.tipo_poligono}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 truncate">{p.descripcion || 'Sin descripción'}</p>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  onClick={(e) => handleEditar(p, e)}
                  title="Editar"
                  className="p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-orange-400 rounded-lg transition-colors cursor-pointer"
                >
                  <FiEdit2 size={13} />
                </button>
                <button
                  onClick={(e) => handleEliminar(p.id, e)}
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