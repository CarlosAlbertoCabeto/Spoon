import { useState, useEffect } from 'react';
import { Calendar } from "@/shared/components/ui/Calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/Dialog";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { ProgramacionCombinacion } from '../../types/menu.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shared/components/ui/Alert-Dialog/Alert-dialog';

interface ModalProgramacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fecha: Date, cantidad: number) => void;
  onDelete?: (index: number) => void;
  fechaInicial?: Date;
  cantidadInicial?: number;
  modo?: 'crear' | 'editar';
  programacionIndex?: number;
  programacionExistente?: ProgramacionCombinacion[];
}

export function ModalProgramacion({ 
  isOpen, 
  onClose, 
  onConfirm,
  onDelete,
  fechaInicial,
  cantidadInicial = 1,
  modo = 'crear',
  programacionIndex,
  programacionExistente = []
}: ModalProgramacionProps) {
  const [fecha, setFecha] = useState<Date | undefined>(fechaInicial);
  const [cantidad, setCantidad] = useState<number>(cantidadInicial);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFecha(fechaInicial);
      setCantidad(cantidadInicial);
    }
  }, [isOpen, fechaInicial, cantidadInicial]);

  const handleConfirm = () => {
    if (fecha && cantidad > 0) {
      onConfirm(fecha, cantidad);
      resetForm();
    }
  };

  const resetForm = () => {
    setFecha(undefined);
    setCantidad(1);
  };

  const handleDelete = (index: number) => {
    setIndexToDelete(index);
    setAlertDialogOpen(true);
  };

  const confirmDelete = () => {
    if (indexToDelete !== null && onDelete) {
      onDelete(indexToDelete);
    }
    setAlertDialogOpen(false);
    setIndexToDelete(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modo === 'crear' ? 'Programar Combinación' : 'Editar Programación'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={fecha}
                onSelect={setFecha}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
                initialFocus
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Cantidad
              </label>
              <Input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {programacionExistente.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Programaciones Existentes:</label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                  {programacionExistente.map((prog, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span>{prog.fecha.toLocaleDateString()}: {prog.cantidadProgramada} unid.</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(idx)}
                        className="h-6 px-2"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!fecha || cantidad < 1}
            >
              {modo === 'crear' ? 'Confirmar' : 'Actualizar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la programación seleccionada y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}