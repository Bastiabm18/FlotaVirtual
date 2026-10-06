import { FiCpu, FiCloud, FiRadio, FiLock, FiCheckCircle } from 'react-icons/fi';

const urlFondoIntegraciones = '/web 4.png'; // Reemplaza o ajusta con tu asset en public

export default function SeccionIntegracionServicios() {
  return (
    <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="space-y-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <FiCpu size={20} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-['Special_Elite']">
          Integración de Servicios Externos y APIs
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
          Diseñado con una arquitectura modular y flexible capaz de enlazarse con ecosistemas externos. Desde datos meteorológicos en tiempo real para la planificación de rutas hasta pasarelas GPS de múltiples proveedores y conexiones a bases de datos corporativas independientes por cada organización.
        </p>
        <ul className="space-y-2 text-xs text-zinc-300">
          <li className="flex items-center gap-2">
            <FiCloud className="text-sky-400" /> Monitoreo climático y alertas meteorológicas en ruta.
          </li>
          <li className="flex items-center gap-2">
            <FiRadio className="text-sky-400" /> Compatibilidad con múltiples protocolos y proveedores GPS.
          </li>
          <li className="flex items-center gap-2">
            <FiLock className="text-sky-400" /> Conexiones de bases de datos aisladas y seguras por empresa.
          </li>
        </ul>
      </div>

      {/* Contenedor visual con imagen de fondo completa */}
      <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 h-64 md:h-80 flex items-center justify-center relative overflow-hidden group">
        
        {/* Capa de imagen de fondo ajustada */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-40 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${urlFondoIntegraciones}')` }} 
        />

        {/* Degradado superpuesto en tonos azules/sky corporativos */}
        <div className="absolute inset-0 bg-zinc-900/20 pointer-events-none" />

        <div className="text-center space-y-2 z-10">
          <span className="text-xs font-mono text-zinc-400 block drop-shadow-md">[ Vista Previa: Conectividad API ]</span>
          <div className="px-4 py-2 bg-zinc-900/90 border border-zinc-700/50 rounded-xl text-xs text-zinc-200 shadow-2xl backdrop-blur-sm inline-block">
            🔌 Ecosistema Multitarea y Multiempresa
          </div>
        </div>
      </div>
    </section>
  );
}