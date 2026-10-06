'use client';

interface PopupGeocercaProps {
  nombre: string;
  descripcion: string;
  idPoligono: string;
}

export default function PopupGeocerca({ nombre, descripcion, idPoligono }: PopupGeocercaProps) {
  return (
    <div className="p-3 text-neutral-100 flex items-center justify-center flex-col bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-xl shadow-xl min-w-[220px] max-w-[280px] font-sans">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-700/60">
        <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">Geocerca</span>
      </div>
      <h3 className="font-bold text-sm mb-1 text-neutral-100">{nombre}</h3>
      <p className="text-xs text-neutral-300 leading-relaxed">{descripcion || 'Sin descripción disponible.'}</p>
    </div>
  );
}