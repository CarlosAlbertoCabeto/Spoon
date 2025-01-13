'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, TableIcon, GridIcon, Star, Badge, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { Card } from "@/shared/components/ui/Card/card";
import { CardContent } from "@/shared/components/ui/Card/card-content";
import { TablaCombinaciones } from '../components/tabla-combinaciones/TablaCombinaciones';
import { TarjetasCombinaciones } from '../components/tarjetas-combinaciones/TarjetasCombinaciones';
import { CacheTimer } from '@/shared/components/ui/CacheTimer/cacheTimer';
import { useCombinaciones } from '../hooks/useCombinaciones';
import { Producto, MenuCombinacion } from '../types/menu.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cacheUtils } from '@/utils/cache.utils';
import { ModalProgramacion } from '../components/modal-programacion/ModalProgramacion';

// ID de restaurante de prueba
const RESTAURANTE_ID_PRUEBA = 'rest-test-001';

export default function CombinacionesPage(): JSX.Element {
  const router = useRouter();
  const [vistaTabla, setVistaTabla] = useState(true);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarEspeciales, setMostrarEspeciales] = useState(false);
  const [combinaciones, setCombinaciones] = useState<MenuCombinacion[]>([]);
  const [programacionActual, setProgramacionActual] = useState<{
    combinacionId: string;
    index?: number;
    fecha?: Date;
    cantidad?: number;
  } | null>(null);

  const initializeProducts = (): Producto[] => {
    try {
      const cachedData = cacheUtils.get();
      if (cachedData) return cachedData;

      const productosGuardados = localStorage.getItem('productosParaCombinar');
      if (!productosGuardados) return [];

      const productosParseados = JSON.parse(productosGuardados);
      localStorage.removeItem('productosParaCombinar');
      return productosParseados;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  };

  const [productos, setProductos] = useState<Producto[]>(initializeProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    combinaciones: combinacionesIniciales, 
    loading: loadingCombinaciones, 
    error: errorCombinaciones,
    regenerarCombinaciones,
    toggleFavorito,
    toggleEspecial
  } = useCombinaciones({ 
    productos, 
    restauranteId: RESTAURANTE_ID_PRUEBA 
  });

  useEffect(() => {
    setCombinaciones(combinacionesIniciales);
  }, [combinacionesIniciales]);

  const combinacionesFiltradas = useMemo(() => {
    let resultado = [...combinaciones];
    
    if (mostrarFavoritos) {
      resultado = resultado.filter(c => c.favorito);
    }
    
    if (mostrarEspeciales) {
      resultado = resultado.filter(c => c.especial);
    }
    
    return resultado;
  }, [combinaciones, mostrarFavoritos, mostrarEspeciales]);

  const validarProductos = () => {
    try {
      if (productos.length === 0) {
        throw new Error('No se encontraron productos para generar combinaciones');
      }

      const categorias = new Set(productos.map(p => p.categoriaId));
      const categoriasRequeridas = ['entrada', 'principio', 'proteina', 'acompanamiento', 'bebida'];
      const categoriasFaltantes = categoriasRequeridas.filter(cat => !categorias.has(cat));

      if (categoriasFaltantes.length > 0) {
        throw new Error(`Faltan productos de las categorías: ${categoriasFaltantes.join(', ')}`);
      }

      if (!cacheUtils.get()) {
        cacheUtils.set(productos);
      }

      setIsLoading(false);
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(mensajeError);
      toast.error(mensajeError);
      
      setTimeout(() => {
        router.push('/dashboard/carta');
      }, 3000);
    }
  };

  useEffect(() => {
    validarProductos();
  }, [productos, router]);

  const handleCambiarVista = (): void => {
    setVistaTabla(!vistaTabla);
  };

  const handleToggleFavorito = (id: string) => {
    toggleFavorito(id);
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => 
        combinacion.id === id 
          ? { ...combinacion, favorito: !combinacion.favorito }
          : combinacion
      )
    );
    toast.success('Estado de favorito actualizado');
  };

  const handleToggleEspecial = (id: string) => {
    toggleEspecial(id);
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => {
        if (combinacion.id !== id) return combinacion;
        return { 
          ...combinacion, 
          especial: !combinacion.especial 
        };
      })
    );
    toast.success('Estado especial actualizado');
  };

  const handleUpdateCantidad = (id: string, cantidad: number) => {
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => 
        combinacion.id === id 
          ? { ...combinacion, cantidad }
          : combinacion
      )
    );
  };

  const handleProgramarCombinacion = (id: string, fecha: Date, cantidad: number) => {
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => {
        if (combinacion.id === id) {
          const nuevaProgramacion = { fecha, cantidadProgramada: cantidad };
          return {
            ...combinacion,
            programacion: combinacion.programacion 
              ? [...combinacion.programacion, nuevaProgramacion]
              : [nuevaProgramacion]
          };
        }
        return combinacion;
      })
    );
    toast.success('Combinación programada correctamente');
    setProgramacionActual(null);
  };

  const handleEditarProgramacion = (combinacionId: string, index: number, fecha: Date, cantidad: number) => {
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => {
        if (combinacion.id === combinacionId && combinacion.programacion) {
          const nuevaProgramacion = [...combinacion.programacion];
          nuevaProgramacion[index] = { fecha, cantidadProgramada: cantidad };
          return { ...combinacion, programacion: nuevaProgramacion };
        }
        return combinacion;
      })
    );
    toast.success('Programación actualizada correctamente');
    setProgramacionActual(null);
  };

  const handleEliminarProgramacion = (combinacionId: string, index: number) => {
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => {
        if (combinacion.id === combinacionId && combinacion.programacion) {
          const nuevaProgramacion = combinacion.programacion.filter((_, idx) => idx !== index);
          return { ...combinacion, programacion: nuevaProgramacion };
        }
        return combinacion;
      })
    );
    toast.success('Programación eliminada correctamente');
  };

  if (isLoading || loadingCombinaciones) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#F4821F]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--spoon-neutral-800)] mb-4">
          Combinaciones de Menú
        </h1>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button 
              variant="outline"
              className={`transition-all duration-200 ${
                mostrarFavoritos 
                  ? "bg-[var(--spoon-primary)] text-white hover:bg-[var(--spoon-primary-dark)]" 
                  : "border-[var(--spoon-primary)] text-[var(--spoon-primary)] hover:bg-[var(--spoon-primary-light)]"
              }`}
              onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
            >
              <Star className={`h-4 w-4 mr-2 ${mostrarFavoritos ? "fill-current" : ""}`} />
              Favoritos
            </Button>
            <Button 
              variant="outline"
              className={`transition-all duration-200 ${
                mostrarEspeciales 
                  ? "bg-[var(--spoon-primary)] text-white hover:bg-[var(--spoon-primary-dark)]" 
                  : "border-[var(--spoon-primary)] text-[var(--spoon-primary)] hover:bg-[var(--spoon-primary-light)]"
              }`}
              onClick={() => setMostrarEspeciales(!mostrarEspeciales)}
            >
              <Badge className="h-4 w-4 mr-2" />
              Platos Especiales
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <Button 
              onClick={handleCambiarVista} 
              variant="outline"
              className="bg-[var(--spoon-primary)] text-white hover:bg-[var(--spoon-primary-dark)] transition-colors duration-200"
            >
              {vistaTabla ? <GridIcon className="h-4 w-4 mr-2" /> : <TableIcon className="h-4 w-4 mr-2" />}
              {vistaTabla ? 'Vista Tarjetas' : 'Vista Tabla'}
            </Button>
            
            <Card className="bg-white border border-[var(--spoon-primary-light)] shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <CacheTimer />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {vistaTabla ? (
        <TablaCombinaciones 
          combinaciones={combinacionesFiltradas} 
          isLoading={loadingCombinaciones}
          onToggleFavorito={handleToggleFavorito}
          onToggleEspecial={handleToggleEspecial}
          onUpdateCantidad={handleUpdateCantidad}
          onProgramar={(id) => setProgramacionActual({ combinacionId: id })}
        />
      ) : (
        <TarjetasCombinaciones 
          combinaciones={combinacionesFiltradas} 
          isLoading={loadingCombinaciones}
          onToggleFavorito={handleToggleFavorito}
          onToggleEspecial={handleToggleEspecial}
          onUpdateCantidad={handleUpdateCantidad}
          onProgramar={(id) => setProgramacionActual({ combinacionId: id })}
        />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ModalProgramacion
        isOpen={!!programacionActual}
        onClose={() => setProgramacionActual(null)}
        onConfirm={(fecha, cantidad) => 
          programacionActual?.index !== undefined
            ? handleEditarProgramacion(programacionActual.combinacionId, programacionActual.index, fecha, cantidad)
            : handleProgramarCombinacion(programacionActual?.combinacionId!, fecha, cantidad)
        }
        onDelete={programacionActual?.combinacionId 
          ? (index) => handleEliminarProgramacion(programacionActual.combinacionId, index)
          : undefined
        }
        fechaInicial={programacionActual?.fecha}
        cantidadInicial={programacionActual?.cantidad}
        modo={programacionActual?.index !== undefined ? 'editar' : 'crear'}
        programacionExistente={combinaciones.find(c => c.id === programacionActual?.combinacionId)?.programacion}
      />
    </div>
  );
}