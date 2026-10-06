export default function PresentacionAuth() {
  const tokenMapbox = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const urlFondoMapbox = `./portada.png`;

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Visual de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90  scale-105"
        style={{ backgroundImage: `url('${urlFondoMapbox}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />

      <div className="absolute top-3 items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/20 text-orange-400 text-xs font-semibold">
        <a href="/home">Sobre la Plataforma</a>
      </div>
      {/* Card Informativa */}
      <div className="relative z-10 max-w-lg p-8 bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800/80 shadow-2xl">
        <span className="text-xs uppercase tracking-widest font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Monitoreo en Tiempo Real
        </span>
        <h3 className="text-3xl font-bold mt-4 mb-3 leading-tight">
          Control preciso de tu flota en cualquier lugar.
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Plataforma GIS de alto rendimiento renderizada por GPU. Visualiza la posición
          exacta, rumbo y telemetría de tus camiones con latencia casi cero mediante WebSockets.
        </p>
        <div className="mt-6 flex items-center gap-6 text-xs text-zinc-400">
          <div>
            <span className="block text-xl font-bold text-white">60 FPS</span>
            Rendimiento WebGL
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div>
            <span className="block text-xl font-bold text-white">&lt; 100ms</span>
            Latencia Realtime
          </div>
        </div>
      </div>
    </div>
  );
}