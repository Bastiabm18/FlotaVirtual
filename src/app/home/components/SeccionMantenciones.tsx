import { FiTool, FiCheckCircle } from 'react-icons/fi';

export default function SeccionMantenciones() {

  const urlFondoMecanica='/web 3.png';
  return (
    <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {/* Contenedor visual / Imagen simulada */}
{/* Contenedor visual mejorado con imagen de fondo completa */}
      <div className="order-2 md:order-1 bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 h-64 md:h-80 flex items-center justify-center relative overflow-hidden group">
        
        {/* Capa de imagen de fondo ajustada con efecto hover */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-40 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${urlFondoMecanica}')` }} 
        />

        {/* Degradado superpuesto en tonos naranjas para mantener la consistencia */}
        <div className="absolute inset-0 bg-zinc-900/20 pointer-events-none" />

        <div className="text-center space-y-2 z-10">
          <span className="text-xs font-mono text-zinc-400 block drop-shadow-md">[ Vista Previa: Panel Mecánico ]</span>
          <div className="px-4 py-2 bg-zinc-900/90 border border-zinc-700/50 rounded-xl text-xs text-zinc-200 shadow-2xl backdrop-blur-sm inline-block">
             Control de Fallas y Bloqueo Preventivo
          </div>
        </div>
      </div>

      <div className="order-1 md:order-2 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <FiTool size={20} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Gestión Integral de Mantenciones y Mecánica
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
          Control exhaustivo del estado técnico de cada vehículo. Registro rápido de fallas mecánicas en terreno, asignación de mecánicos responsables, seguimiento de repuestos y estados activos para garantizar la operatividad de toda la flota.
        </p>
        <ul className="space-y-2 text-xs text-zinc-300">
          <li className="flex items-center gap-2">
            <FiCheckCircle className="text-orange-400" /> Confirmaciones inline y cierre seguro de tareas.
          </li>
          <li className="flex items-center gap-2">
            <FiCheckCircle className="text-orange-400" /> Historial de intervenciones por equipo.
          </li>
        </ul>
      </div>
    </section>
  );
}