import { PopUpEquipoProps } from "@/types/rutas";


export function PopUpEquipo({ patente, marca, anio, chasis, heading }: PopUpEquipoProps) {
  return (
    <div className="p-3 text-zinc-100 font-sans bg-zinc-800/60 backdrop-blur-md rounded-lg border border-zinc-700/50 shadow-xl min-w-[200px]">
      <div className="font-bold text-sm border-b border-zinc-700 pb-2 flex justify-between items-center gap-2">
        <span className="tracking-wide text-white">{patente}</span>
        <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded-full border border-red-800/50 font-medium">
          {marca}
        </span>
      </div>
      
      <div className="text-xs text-zinc-300 mt-2.5 flex flex-col gap-1.5">
        <div className="flex justify-between">
          <span className="text-zinc-400">Año:</span>
          <span className="font-semibold text-zinc-200">{anio}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Chasis:</span>
          <span className="font-mono text-[11px] text-zinc-300 bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800">
            {chasis}
          </span>
        </div>
        
        <div className="text-emerald-400 flex items-center justify-between mt-1 pt-1.5 border-t border-zinc-700/50 font-medium">
          <span className="text-zinc-400">Rumbo:</span>
          <span>{heading}°</span>
        </div>
      </div>
    </div>
  );
}