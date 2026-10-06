export default function HeroPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-16 text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
        <span> Innovación y Control Total en Terreno</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
        ¿Qué es capaz de hacer <span className="text-orange-500">nuestro sistema</span>?
      </h1>
      <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Una solución completa desarrollada a la medida para el monitoreo satelital, la gestión de flotas, control de mantenimientos mecánicos y optimización de operaciones logísticas en tiempo real.
      </p>
    </section>
  );
}