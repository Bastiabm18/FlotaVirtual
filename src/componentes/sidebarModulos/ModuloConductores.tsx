'use client';

import { useState, useEffect, useTransition } from 'react';
import { useUI } from '@/contexto/ContextoUI';
import { getConductores, crearConductor, actualizarConductor, desvincularConductor } from '@/actions/usuario/actions';
import { ConductorData } from '@/types/rutas';
import { 
  FiArrowLeft, 
  FiPlus, 
  FiEdit2, 
  FiUserX, 
  FiLoader, 
  FiCheckCircle, 
  FiX, 
  FiAlertCircle 
} from 'react-icons/fi';

export default function ModuloConductores() {
  const { volverAlMenu } = useUI();
  const [conductores, setConductores] = useState<ConductorData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Control de vistas (Listado, Nuevo Form, Editar Form)
  const [vista, setVista] = useState<'lista' | 'nuevo' | 'editar'>('lista');
  const [conductorEditando, setConductorEditando] = useState<ConductorData | null>(null);

  // Campos del formulario
  const [form, setForm] = useState({
    nombre: '',
    apellidopat: '',
    apellidomat: '',
    rut: '',
    edad: '',
    fecha_nacimiento: '',
    tipo_licencia: 'A5',
  });

  const cargarDatos = async () => {
    setCargando(true);
    const res = await getConductores();
    if (res.data) setConductores(res.data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setForm({
      nombre: '',
      apellidopat: '',
      apellidomat: '',
      rut: '',
      edad: '',
      fecha_nacimiento: '',
      tipo_licencia: 'A5',
    });
    setConductorEditando(null);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setVista('nuevo');
  };

  const abrirEditar = (c: ConductorData) => {
    setConductorEditando(c);
    setForm({
      nombre: c.nombre,
      apellidopat: c.apellidopat,
      apellidomat: c.apellidomat,
      rut: c.rut,
      edad: String(c.edad),
      fecha_nacimiento: c.fecha_nacimiento,
      tipo_licencia: c.tipo_licencia,
    });
    setVista('editar');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.rut || !form.edad) return;

    startTransition(async () => {
      const payload = {
        nombre: form.nombre.trim(),
        apellidopat: form.apellidopat.trim(),
        apellidomat: form.apellidomat.trim(),
        rut: form.rut.trim(),
        edad: Number(form.edad),
        fecha_nacimiento: form.fecha_nacimiento,
        tipo_licencia: form.tipo_licencia,
      };

      let res;
      if (vista === 'nuevo') {
        res = await crearConductor(payload);
      } else if (vista === 'editar' && conductorEditando) {
        res = await actualizarConductor(conductorEditando.id, payload);
      }

      if (res?.exito) {
        setVista('lista');
        limpiarFormulario();
        cargarDatos();
      } else {
        alert(`Error: ${res?.error}`);
      }
    });
  };

  const handleDesvincular = (id: string) => {
    if (!confirm('¿Estás seguro de desvincular a este conductor? Pasará a estado inactivo.')) return;

    startTransition(async () => {
      const res = await desvincularConductor(id);
      if (res.exito) {
        cargarDatos();
      } else {
        alert(`Error al desvincular: ${res.error}`);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <button
        onClick={() => { if (vista !== 'lista') { setVista('lista'); } else { volverAlMenu(); } }}
        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
      >
        <FiArrowLeft /> {vista !== 'lista' ? 'Volver al listado' : 'Volver al menú principal'}
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {vista === 'lista' && 'Gestión de Conductores'}
          {vista === 'nuevo' && 'Registrar Conductor'}
          {vista === 'editar' && 'Editar Conductor'}
        </h2>
        {vista === 'lista' && (
          <button
            onClick={abrirNuevo}
            className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-xs flex items-center gap-1 border border-blue-500/30 cursor-pointer"
          >
            <FiPlus /> Nuevo
          </button>
        )}
      </div>

      {/* VISTA: FORMULARIO NUEVO / EDITAR */}
      {vista !== 'lista' && (
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto pr-1">
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Nombre *</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Apellido Paterno</label>
              <input
                type="text"
                value={form.apellidopat}
                onChange={(e) => setForm({ ...form, apellidopat: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Apellido Materno</label>
              <input
                type="text"
                value={form.apellidomat}
                onChange={(e) => setForm({ ...form, apellidomat: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">RUT *</label>
            <input
              type="text"
              required
              placeholder="12.345.678-9"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Edad *</label>
              <input
                type="number"
                required
                value={form.edad}
                onChange={(e) => setForm({ ...form, edad: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Tipo Licencia</label>
              <select
                value={form.tipo_licencia}
                onChange={(e) => setForm({ ...form, tipo_licencia: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="A3">A3</option>
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="Clase B">Clase B</option>
                <option value="Clase C">Clase C</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400">Fecha de Nacimiento</label>
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? <FiLoader className="animate-spin" /> : <><CheckCircleIcon /> Guardar Conductor</>}
          </button>
        </form>
      )}

      {/* VISTA: LISTADO */}
      {vista === 'lista' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {cargando ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <FiLoader className="animate-spin text-lg" />
            </div>
          ) : conductores.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No hay conductores activos registrados.</p>
          ) : (
            conductores.map((c) => (
              <div
                key={c.id}
                className="group p-3 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {c.nombre} {c.apellidopat} {c.apellidomat}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                      Licencia: {c.tipo_licencia}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate">RUT: {c.rut}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => abrirEditar(c)}
                    title="Gestionar / Editar"
                    className="p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDesvincular(c.id)}
                    title="Desvincular"
                    className="p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <FiUserX size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon() {
  return <FiCheckCircle size={14} />;
}