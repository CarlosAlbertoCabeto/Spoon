import React from 'react';
import { CacheTimer } from '@/shared/components/ui/CacheTimer/cacheTimer';
import type { ProgramacionDia } from '../types/programacion.types';

interface CalendarioSemanalProps {
  dias: Record<string, ProgramacionDia>;
  diaSeleccionado: string;
  onDiaSeleccionado: (dia: string) => void;
}

export const CalendarioSemanal: React.FC<CalendarioSemanalProps> = ({
  dias,
  diaSeleccionado,
  onDiaSeleccionado
}) => {
  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="grid grid-cols-7 gap-0">
        {diasSemana.map((dia) => (
          <button
            key={dia}
            onClick={() => onDiaSeleccionado(dia)}
            className={`p-4 text-center border-b border-r border-neutral-200 ${
              dia === diaSeleccionado 
                ? 'bg-[#FFF4E6] text-[#F4821F]' 
                : 'hover:bg-neutral-50'
            }`}
          >
            <span className="block text-sm font-medium capitalize">
              {dia}
            </span>
            <span className="block text-xs text-neutral-500 mt-1">
              {dias[dia]?.combinaciones.length || 0} combos
            </span>
            <div className="mt-2 text-xs font-mono bg-neutral-100 rounded px-2 py-1">
              <CacheTimer />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};