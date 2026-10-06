'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertOctagon, FiMapPin, FiX } from 'react-icons/fi';
import { DesvioToastItem } from '@/types/rutas';


interface ToastDesviosProps {
  desviosActivos: DesvioToastItem[];
  onCerrarToast: (id_equipo: string) => void;
}

export default function ToastDesvios({ desviosActivos, onCerrarToast }: ToastDesviosProps) {
    console.log(desviosActivos);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {desviosActivos.map((item) => (
          <motion.div
            key={item.id_equipo}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto bg-zinc-900/95 border border-red-500/40 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl shadow-red-950/40 text-white flex items-start gap-3 relative overflow-hidden"
          >
            {/* Indicador lateral visual */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse" />

            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 shrink-0 mt-0.5">
              <FiAlertOctagon size={20} />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  ¡Desvío de Ruta!
                </span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(item.fechaUltimo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <p className="text-xs font-semibold text-white">
                Equipo: <span className="font-mono text-amber-400">{item.id_equipo}</span>
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-300">
                <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold border border-red-500/30">
                  {item.cantidad} {item.cantidad === 1 ? 'desvío registrado' : 'desvíos acumulados'}
                </span>
                <span className="text-zinc-400 flex items-center gap-0.5">
                  <FiMapPin size={11} /> {item.ultimaDistancia}m fuera
                </span>
              </div>
            </div>

            <button
              onClick={() => onCerrarToast(item.id_equipo)}
              className="text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer"
            >
              <FiX size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}