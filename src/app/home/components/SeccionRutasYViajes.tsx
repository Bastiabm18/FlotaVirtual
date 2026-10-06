import { FiNavigation, FiTrendingUp, FiLayers } from 'react-icons/fi';

const urlFondoRutas = '/web 2.png'; // Reemplaza con la ruta de tu imagen en public

export default function SeccionRutasYViajes() {
  return (
    <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      
      {/* Columna Visual con Imagen de Fondo Completa (Ahora a la Izquierda) */}
      <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 h-64 md:h-80 flex items-center justify-center relative overflow-hidden group">
        
        {/* Capa de imagen de fondo ajustada */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-40 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${urlFondoRutas}')` }} 
        />

        {/* Degradado superpuesto para contraste */}
        <div className="absolute inset-0 bg-zinc-900/20 pointer-events-none" />

        <div className="text-center space-y-2 z-10">
          <span className="text-xs font-mono text-zinc-400 block drop-shadow-md">[ Vista Previa: Rutas & Polígonos ]</span>
          <div className="px-4 py-2 bg-zinc-900/90 border border-zinc-700/50 rounded-xl text-xs text-zinc-200 shadow-2xl backdrop-blur-sm inline-block">
            🗺️ Planificación y Big Data Logístico
          </div>
        </div>
      </div>

      {/* Columna de Texto y Capacidades (Ahora a la Derecha) */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <span> Núcleo Logístico Avanzado</span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-['Special_Elite']">
          Gestión de Rutas, Polígonos y Optimización de Viajes
        </h2>
        
        <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
          Más que un simple mapa: el sistema combina de manera inteligente geocercas (polígonos de zonas de interés o riesgo) y trazos de rutas predefinidas para estructurar cada viaje. Al almacenar distancias, tiempos de tránsito y reportes históricos, la plataforma genera métricas de rendimiento logístico clave.
        </p>

        <ul className="space-y-2 text-xs text-zinc-300">
          <li className="flex items-center gap-2">
            <FiLayers className="text-purple-400" /> Delimitación automática de áreas operativas y geocercas.
          </li>
          <li className="flex items-center gap-2">
            <FiNavigation className="text-orange-400" /> Creación y asignación de trayectos óptimos por viaje.
          </li>
          <li className="flex items-center gap-2">
            <FiTrendingUp className="text-emerald-400" /> Analítica histórica de distancias y tiempos de tránsito.
          </li>
        </ul>
      </div>
      
    </section>
  );
}