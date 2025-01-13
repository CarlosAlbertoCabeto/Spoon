import React, { useState } from 'react';
import { DataTable } from "@/shared/components/ui/Table";
import { Star, Badge, Clock, Calendar } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { ModalProgramacion } from '../modal-programacion/ModalProgramacion';
import { MenuCombinacion } from '../../types/menu.types';
import { Loader2 } from 'lucide-react';

interface TablaCombinacionesProps {
  combinaciones: MenuCombinacion[];
  isLoading?: boolean;
  onToggleFavorito?: (id: string) => void;
  onToggleEspecial?: (id: string) => void;
  onUpdateCantidad?: (id: string, cantidad: number) => void;
  onProgramar?: (id: string, fecha: Date, cantidad: number) => void;
}

export function TablaCombinaciones({ 
  combinaciones, 
  isLoading,
  onToggleFavorito,
  onToggleEspecial,
  onUpdateCantidad,
  onProgramar
}: TablaCombinacionesProps) {
  const [modalProgramacionOpen, setModalProgramacionOpen] = useState(false);
  const [combinacionSeleccionada, setCombinacionSeleccionada] = useState<string>('');

  const calcularPrecioCombinacion = (combinacion: MenuCombinacion) => {
    if (combinacion.especial && combinacion.precioEspecial) {
      return combinacion.precioEspecial;
    }

    const precioBase = combinacion.entrada.precio + 
                      combinacion.principio.precio + 
                      combinacion.proteina.precio + 
                      combinacion.bebida.precio;
                      
    const precioAcompañamientos = combinacion.acompanamiento.reduce(
      (total, item) => total + item.precio, 
      0
    );

    return precioBase + precioAcompañamientos;
  };

  const handleProgramar = (id: string) => {
    setCombinacionSeleccionada(id);
    setModalProgramacionOpen(true);
  };

  const handleConfirmProgramacion = (fecha: Date, cantidad: number) => {
    if (onProgramar) {
      onProgramar(combinacionSeleccionada, fecha, cantidad);
    }
    setModalProgramacionOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  if (!combinaciones.length) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        No hay combinaciones disponibles
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <DataTable.Root>
          <DataTable.Header>
            <DataTable.Row>
              <DataTable.HeaderCell>#</DataTable.HeaderCell>
              <DataTable.HeaderCell>Entrada</DataTable.HeaderCell>
              <DataTable.HeaderCell>Principio</DataTable.HeaderCell>
              <DataTable.HeaderCell>Proteína</DataTable.HeaderCell>
              <DataTable.HeaderCell>Acompañamientos</DataTable.HeaderCell>
              <DataTable.HeaderCell>Bebida</DataTable.HeaderCell>
              <DataTable.HeaderCell align="right">Precio</DataTable.HeaderCell>
              <DataTable.HeaderCell>Estado</DataTable.HeaderCell>
              <DataTable.HeaderCell>Cantidad</DataTable.HeaderCell>
              <DataTable.HeaderCell>Programación</DataTable.HeaderCell>
              <DataTable.HeaderCell>Acciones</DataTable.HeaderCell>
            </DataTable.Row>
          </DataTable.Header>
          <DataTable.Body>
            {combinaciones.map((combinacion, index) => (
              <DataTable.Row 
                key={combinacion.id}
                className={combinacion.especial ? 'bg-[var(--spoon-primary-light)]' : ''}
              >
                <DataTable.Cell>{index + 1}</DataTable.Cell>
                <DataTable.Cell>{combinacion.entrada.nombre}</DataTable.Cell>
                <DataTable.Cell>{combinacion.principio.nombre}</DataTable.Cell>
                <DataTable.Cell>{combinacion.proteina.nombre}</DataTable.Cell>
                <DataTable.Cell>
                  {combinacion.acompanamiento.map(item => item.nombre).join(', ')}
                </DataTable.Cell>
                <DataTable.Cell>{combinacion.bebida.nombre}</DataTable.Cell>
                <DataTable.Cell align="right" variant="numeric">
                  <span className={combinacion.especial ? 'text-[var(--spoon-primary-dark)]' : ''}>
                    ${calcularPrecioCombinacion(combinacion).toLocaleString()}
                  </span>
                </DataTable.Cell>
                <DataTable.Cell>
                  <div className="flex gap-2">
                    {combinacion.favorito && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--spoon-primary-light)] text-[var(--spoon-primary)]">
                        Favorito
                      </span>
                    )}
                    {combinacion.especial && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--spoon-primary)] text-white">
                        Especial
                      </span>
                    )}
                  </div>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Input
                    type="number"
                    min={0}
                    value={combinacion.cantidad}
                    onChange={(e) => onUpdateCantidad?.(combinacion.id, Number(e.target.value))}
                    className="w-24"
                  />
                </DataTable.Cell>
                <DataTable.Cell>
                  {combinacion.programacion?.map((prog, idx) => (
                    <div key={idx} className="text-sm">
                      {prog.fecha.toLocaleDateString()}: {prog.cantidadProgramada}
                    </div>
                  ))}
                </DataTable.Cell>
                <DataTable.Cell>
                  <div className="flex gap-2">
                    <Tooltip content={combinacion.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorito?.(combinacion.id)}
                        className={`p-1 hover:bg-[var(--spoon-primary-light)] ${
                          combinacion.favorito ? 'text-[var(--spoon-primary)]' : 'text-gray-400'
                        }`}
                      >
                        <Star className={`h-5 w-5 ${combinacion.favorito ? 'fill-current' : ''}`} />
                      </Button>
                    </Tooltip>
                    <Tooltip content={combinacion.especial ? "Quitar especial" : "Marcar como especial"}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleEspecial?.(combinacion.id)}
                        className={`p-1 hover:bg-[var(--spoon-primary-light)] ${
                          combinacion.especial ? 'text-[var(--spoon-primary)]' : 'text-gray-400'
                        }`}
                      >
                        <Badge className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProgramar(combinacion.id)}
                      className="text-[var(--spoon-primary)] border-[var(--spoon-primary)] hover:bg-[var(--spoon-primary-light)]"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Programar
                    </Button>
                  </div>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable.Body>
        </DataTable.Root>
      </div>

      <ModalProgramacion
        isOpen={modalProgramacionOpen}
        onClose={() => setModalProgramacionOpen(false)}
        onConfirm={handleConfirmProgramacion}
      />
    </>
  );
}