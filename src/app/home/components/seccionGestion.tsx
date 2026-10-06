import { FiLayers, FiCpu, FiDatabase } from 'react-icons/fi';

export default function SeccionGestion() {
  return (
    <section className="max-w-6xl mx-auto px-6 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Administración, Clientes y Módulos Conectados
        </h2>
        <p className="text-xs md:text-sm text-zinc-400">
          Todo lo necesario para centralizar la operación diaria de la empresa bajo una arquitectura moderna y veloz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FiLayers size={16} />
          </div>
          <h3 className="font-bold text-sm text-white">Manejo de Viajes</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Planificación, asignación y seguimiento de rutas logísticas en tiempo real con integración directa a base de datos.
          </p>
        </div>

        <div className="p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FiDatabase size={16} />
          </div>
          <h3 className="font-bold text-sm text-white">Gestión de Productos y Clientes</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Control de inventarios, catálogos y carteras de clientes vinculadas directamente a la actividad de transporte.
          </p>
        </div>

        <div className="p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FiCpu size={16} />
          </div>
          <h3 className="font-bold text-sm text-white">Arquitectura Escalable</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Desarrollado con Next.js, Server Actions y Supabase, garantizando rendimiento óptimo y seguridad a toda prueba.
          </p>
        </div>
      </div>
    </section>
  );
}