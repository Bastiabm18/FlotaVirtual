'use client';

import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface MarcadorExcesoProps {
  velocidad: number;
}

export default function MarcadorExceso({ velocidad }: MarcadorExcesoProps) {
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-600 border-2 border-white text-white shadow-xl animate-pulse cursor-pointer">
      <FiAlertTriangle size={16} />
    </div>
  );
}