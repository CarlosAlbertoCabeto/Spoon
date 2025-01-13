'use client';

import { useState } from 'react';
import { InventarioHeader } from './components/InventarioHeader';
import { TarjetaPlato } from './components/TarjetaPlato';
import { ModalVenta } from './components/ModalVenta';
import { useVentasDia } from './hooks/useVentasDia';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { CacheTimer } from '@/shared/components/ui/CacheTimer/cacheTimer';
import { Loader2 } from 'lucide-react';
import type { Plato, Adicional } from './types/ventasdia.types';

export default function VentasDiaPage() {
  // Estados
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [platoSeleccionado, setPlatoSeleccionado] = useState<Plato | null>(null);

  // Hook principal
  const { 
    platos, 
    productosAdicionales,
    loading, 
    error, 
    registrarVenta 
  } = useVentasDia();

  // Manejadores
  const handleRegistrarVenta = (platoId: string) => {
    const plato = platos.find(p => p.id === platoId);
    if (plato) {
      setPlatoSeleccionado(plato);
      setModalVentaOpen(true);
    }
  };

  const handleConfirmarVenta = async (
    platoId: string, 
    cantidad: number, 
    adicionales: Adicional[]
  ) => {
    const resultado = await registrarVenta(platoId, cantidad, adicionales);
    if (resultado) {
      setModalVentaOpen(false);
      setPlatoSeleccionado(null);
    }
    return resultado;
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <InventarioHeader />
      
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Timer del caché */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">
                Tiempo restante del menú actual:
              </span>
              <CacheTimer />
            </div>
          </div>
        </div>

        {/* Grid de Platos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {platos.map(plato => (
            <TarjetaPlato
              key={plato.id}
              plato={plato}
              onRegistrarVenta={handleRegistrarVenta}
            />
          ))}
        </div>

        {platos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">
              No hay combinaciones disponibles en este momento
            </p>
          </div>
        )}
      </div>

      {/* Modal de Venta */}
      {modalVentaOpen && platoSeleccionado && (
        <ModalVenta
          plato={platoSeleccionado}
          productosAdicionales={productosAdicionales}
          onClose={() => {
            setModalVentaOpen(false);
            setPlatoSeleccionado(null);
          }}
          onConfirm={handleConfirmarVenta}
        />
      )}
    </div>
  );
}