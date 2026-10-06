'use client';

import React from 'react';
import { FiAlertTriangle, FiClock, FiShield } from 'react-icons/fi';

interface PopupExcesoProps {
  patente?: string;
  velocidad: number;
  fecha: string;
}

export default function PopupExceso({ patente, velocidad, fecha }: PopupExcesoProps) {
  return (
    <div className="p-3 rounded-md min-w-[180px] text-zinc-300 bg-zinc-900/80 font-sans ">
      <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs pb-1 border-b border-zinc-200">
        <FiAlertTriangle size={14} />
        <span>Exceso de Velocidad</span>
      </div>
      <div className="pt-1.5 space-y-1 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-zinc-300 flex items-center gap-1">
            <FiShield size={11} /> Móvil:
          </span>
          <span className="font-bold">{patente || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-300">Velocidad:</span>
          <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
            {velocidad} km/h
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-400 pt-1">
          <FiClock size={10} />
          <span>{new Date(fecha).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}