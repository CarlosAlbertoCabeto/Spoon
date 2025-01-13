'use client';

import { Clock, AlertCircle, CalendarIcon } from 'lucide-react';
import { useCombinacionesProgramacion } from './hooks/useCombinacionesProgramacion';
import type { MenuCombinacion } from './types/programacion.types';

const getNombreCombinacion = (combinacion: any) => {
  try {
    if (combinacion.nombre) return combinacion.nombre;
    
    const partes = [];
    if (combinacion.entrada?.nombre) partes.push(combinacion.entrada.nombre);
    if (combinacion.principio?.nombre) partes.push(combinacion.principio.nombre);
    if (combinacion.proteina?.nombre) partes.push(combinacion.proteina.nombre);
    if (combinacion.bebida?.nombre) partes.push(combinacion.bebida.nombre);
    
    return partes.length > 0 ? partes.join(' + ') : 'Combinación sin nombre';
  } catch (error) {
    console.error('Error al obtener nombre de combinación:', error);
    return 'Combinación sin nombre';
  }
};

export default function ProgramacionSemanalPage() {
  const {
    combinacionesDisponibles,
    programacionSemanal,
    diaSeleccionado,
    setDiaSeleccionado,
    loading,
    agregarCombinacionAlDia,
    removerCombinacionDelDia,
    diasSemana
  } = useCombinacionesProgramacion();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, combinacion: MenuCombinacion) => {
    e.dataTransfer.setData('combinacion', JSON.stringify(combinacion));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const combinacion = JSON.parse(e.dataTransfer.getData('combinacion')) as MenuCombinacion;
      agregarCombinacionAlDia(diaSeleccionado, combinacion);
    } catch (error) {
      console.error('Error al soltar combinación:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#F4821F] border-r-[#F4821F] border-b-neutral-200 border-l-neutral-200 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Cargando programación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-800">
            Programación Semanal del Menú
          </h1>
          <button className="flex items-center px-4 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] transition-colors">
            <Clock className="w-4 h-4 mr-2" />
            Auto-programar
          </button>
        </div>
      </div>

      {/* Calendario Semanal */}
      <div className="bg-white rounded-lg border border-neutral-200 mb-6 overflow-hidden">
        <div className="grid grid-cols-7 gap-0">
          {diasSemana.map((dia) => (
            <button
              key={dia}
              onClick={() => setDiaSeleccionado(dia)}
              className={`p-4 text-center border-b border-r border-neutral-200 transition-colors
                ${dia === diaSeleccionado 
                  ? 'bg-[#FFF4E6] text-[#F4821F]' 
                  : 'hover:bg-neutral-50'}`}
            >
              <span className="block text-sm font-medium">{dia}</span>
              <span className="block text-xs text-neutral-500 mt-1">
                {programacionSemanal[dia]?.length || 0} combos
              </span>
              <div className="mt-2 text-xs font-mono bg-neutral-100 rounded px-2 py-1">
                00:00:00
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Principal */}
      <div className="grid grid-cols-3 gap-6">
        {/* Combinaciones Disponibles */}
        <div className="col-span-1 bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-semibold">Combinaciones Disponibles</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="text-neutral-500 text-sm">Cargando combinaciones...</p>
            ) : combinacionesDisponibles.length > 0 ? (
              <div className="space-y-2">
                {combinacionesDisponibles.map((combinacion) => (
                  <div
                    key={combinacion.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, combinacion)}
                    className="p-3 border rounded-lg hover:border-[#F4821F] cursor-move transition-colors"
                  >
                    <h3 className="text-sm font-medium">
                      {getNombreCombinacion(combinacion)}
                    </h3>
                    {combinacion.estado === 'agotado' && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                        Agotado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500 text-sm">No hay combinaciones disponibles</p>
                <p className="text-neutral-400 text-xs mt-1">
                  Crea combinaciones en el menú para programarlas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Área de Programación */}
        <div className="col-span-2 bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-semibold">Programación para {diaSeleccionado}</h2>
          </div>
          <div 
            className="p-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {programacionSemanal[diaSeleccionado]?.length > 0 ? (
              <div className="space-y-2">
                {programacionSemanal[diaSeleccionado].map((combinacion) => (
                  <div
                    key={combinacion.id}
                    className="p-3 border rounded-lg hover:border-[#F4821F] group transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium">
                          {getNombreCombinacion(combinacion)}
                        </h3>
                        {combinacion.descripcion && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {combinacion.descripcion}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removerCombinacionDelDia(diaSeleccionado, combinacion.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 text-sm px-2 py-1 rounded transition-all"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-h-[400px] border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
                  <p>Arrastra combinaciones aquí para programar el {diaSeleccionado.toLowerCase()}</p>
                  <p className="text-sm mt-2 text-neutral-400">o</p>
                  <button className="mt-2 px-4 py-2 text-sm text-[#F4821F] hover:bg-[#FFF4E6] rounded-lg transition-colors">
                    Seleccionar Combinaciones
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Programación Automática
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              El sistema puede sugerir combinaciones basadas en el historial de ventas.
              Las predicciones se actualizan cada semana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}