import { FiMap, FiActivity, FiShield } from 'react-icons/fi';
  const urlFondoMapbox = `./web 1.png`;

export default function SeccionSeguimiento() {
  return (
    <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="space-y-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <FiMap size={20} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Monitoreo GPS y Control de Excesos en Vivo
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
          Visualización cartográfica avanzada potenciada por Mapbox. Seguimiento interactivo de equipos, creación de geocercas personalizadas, rutas dinámicas y un módulo automatizado de detección y control de excesos de velocidad por móvil y rangos de fechas.
        </p>
        <ul className="space-y-2 text-xs text-zinc-300">
          <li className="flex items-center gap-2">
            <FiActivity className="text-purple-400" /> Historial detallado de coordenadas y velocidades.
          </li>
          <li className="flex items-center gap-2">
            <FiShield className="text-purple-400" /> Alertas tempranas y seguridad en ruta.
          </li>
        </ul>
      </div>

{/* Contenedor visual mejorado con ajuste completo de imagen */}
      <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 h-64 md:h-80 flex items-center justify-center relative overflow-hidden group">
        
        {/* Capa de imagen de fondo ajustada */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-40 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${urlFondoMapbox}')` }} 
        />

        {/* Degradado superpuesto para mantener contraste con el texto */}
        <div className="absolute inset-0 bg-zinc-900/20 pointer-events-none" />
        
        <div className="text-center space-y-2 z-10">
          <span className="text-xs font-mono text-zinc-400 block drop-shadow-md">[ Vista Previa: Mapa & Geocercas ]</span>
          <div className="px-4 py-2 bg-zinc-900/90 border border-zinc-700/50 rounded-xl text-xs text-zinc-200 shadow-2xl backdrop-blur-sm inline-block">
           Monitoreo Activo de Flota / Conexión Segura
          </div>
        </div>
      </div>
    </section>
  );
}