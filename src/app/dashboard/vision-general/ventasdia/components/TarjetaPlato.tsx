import { AlertCircle } from 'lucide-react';
import type { Plato } from '../types/ventasdia.types';

interface TarjetaPlatoProps {
  plato: Plato;
  onRegistrarVenta: (platoId: string) => void;
}

export const TarjetaPlato: React.FC<TarjetaPlatoProps> = ({ 
  plato, 
  onRegistrarVenta 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg border ${
        plato.estado === 'agotado' 
          ? 'border-red-200 bg-red-50' 
          : 'border-neutral-200 hover:border-[#F4821F]'
      } transition-all duration-200`}
    >
      <div className="p-3 border-b border-neutral-100">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-sm text-neutral-800 line-clamp-1">
            {plato.nombre}
          </h3>
          {plato.estado === 'agotado' && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Agotado
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
          {plato.descripcion}
        </p>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#F4821F]">
            ${plato.precio.toLocaleString()}
          </span>
          <span className={`text-sm font-medium ${
            plato.disponibles === 0 
              ? 'text-red-600' 
              : plato.disponibles <= 10 
                ? 'text-amber-600' 
                : 'text-green-600'
          }`}>
            {plato.disponibles} disponibles
          </span>
        </div>

        <button
          className={`w-full px-3 py-2 text-sm rounded-lg ${
            plato.estado === 'agotado'
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-[#F4821F] text-white hover:bg-[#CC6A10]'
          } transition-colors`}
          disabled={plato.estado === 'agotado'}
          onClick={() => onRegistrarVenta(plato.id)}
        >
          Registrar Venta
        </button>
      </div>
    </div>
  );
};