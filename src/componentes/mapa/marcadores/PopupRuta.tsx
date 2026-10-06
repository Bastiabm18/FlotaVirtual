'use client';

interface PopupRutaProps {
  nombre: string;
  descripcion: string;
  idRuta: string;
  largo: number;
}

export default function PopupRuta({ nombre, descripcion, idRuta,largo }: PopupRutaProps) {
  return (
    <div className="p-3 text-neutral-100 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-xl shadow-xl min-w-[220px] max-w-[280px] font-sans">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-700/60">
        <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">Ruta</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded">{idRuta}</span>
      </div>
      <h3 className="font-bold text-sm mb-1 text-neutral-100">{nombre}</h3>
      <p className="text-xs text-neutral-300 leading-relaxed">{descripcion || 'Sin descripción disponible.'}</p>
      <div className="mt-2">
        <span className="text-xs text-blue-400 font-semibold">Largo:</span>
        <span className="text-sm text-neutral-300 ml-1">{largo.toFixed(2)} km</span>
      </div>
    </div>
  );
}