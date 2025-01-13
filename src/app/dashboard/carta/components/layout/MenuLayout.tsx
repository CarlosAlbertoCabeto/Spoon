// src/app/dashboard/carta/components/layout/MenuLayout.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  VideoIcon, 
  FileQuestion,
  GitFork 
} from "lucide-react";
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Button } from "@/shared/components/ui/Button";
import { Alert, AlertDescription } from "@/shared/components/ui/Alert";
import { toast } from "sonner";
import { ErrorBoundary } from "@/shared/components/ui/ErrorBoundary/error-boundary";
import { ListaCategorias } from "../categorias/ListaCategorias";
import ListaProductos from "../productos/ListaProductos";
import { MenuDiario, productosEjemplo } from "../menu-diario/MenuDiario";
import { DialogoNuevaCategoria } from "../categorias/DialogoNuevaCategoria";
import { DialogoNuevoProducto } from "../productos/DialogoNuevoProducto";
import { cacheUtils } from '@/utils/cache.utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";

// Interfaces
interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  imagen?: string;
}

interface MenuLayoutProps {
  isLoading: boolean;
  error: string | null;
  categorias: any[];
  productos: VersionedProduct[];
  restauranteId: string;
  onCategoriaCreated?: (newCategoria: any) => void; // Agregamos esta prop
}

export function MenuLayout({ 
  isLoading, 
  error, 
  categorias, 
  productos,
  restauranteId,
  onCategoriaCreated
}: MenuLayoutProps) {
  const router = useRouter();


  // Estados
  const [dialogoNuevaCategoria, setDialogoNuevaCategoria] = useState(false);
  const [dialogoNuevoProducto, setDialogoNuevoProducto] = useState(false);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [dialogoNuevo, setDialogoNuevo] = useState(false);
  const [productosMenu, setProductosMenu] = useState<VersionedProduct[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [productoParaEditar, setProductoParaEditar] = useState<VersionedProduct | null>(null);
  const [productoParaEliminar, setProductoParaEliminar] = useState<string | null>(null);

  // Handlers
  const handleGenerarCombinaciones = () => {
    console.log('=== Iniciando generación de combinaciones ===');
    console.log('Productos disponibles:', productosEjemplo);

    const entradas = productosEjemplo.filter(p => p.categoriaId === 'entrada');
    const principios = productosEjemplo.filter(p => p.categoriaId === 'principio');
    const proteinas = productosEjemplo.filter(p => p.categoriaId === 'proteina');
    const acompanamientos = productosEjemplo.filter(p => p.categoriaId === 'acompanamiento');
    const bebidas = productosEjemplo.filter(p => p.categoriaId === 'bebida');

    console.log('Productos filtrados:', {
      entradas,
      principios,
      proteinas,
      acompanamientos,
      bebidas
    });

    // Validaciones
    if (entradas.length === 0) {
      toast.error("Necesitas seleccionar al menos una entrada");
      return;
    }
    if (principios.length === 0) {
      toast.error("Necesitas seleccionar al menos un principio");
      return;
    }
    if (proteinas.length === 0) {
      toast.error("Necesitas seleccionar al menos una proteína");
      return;
    }
    if (acompanamientos.length === 0) {
      toast.error("Necesitas seleccionar al menos un acompañamiento");
      return;
    }
    if (bebidas.length === 0) {
      toast.error("Necesitas seleccionar al menos una bebida");
      return;
    }

    try {
      console.log('Limpiando caché anterior');
      cacheUtils.clear();
      
      console.log('Guardando nuevos productos en caché:', productosEjemplo);
      cacheUtils.set(productosEjemplo);
      
      toast.success("Generando combinaciones...");
      router.push('/dashboard/carta/combinaciones');
    } catch (error) {
      console.error('Error en handleGenerarCombinaciones:', error);
      toast.error("Error al procesar los productos");
    }
  };
  // Handlers de Categorías y Productos
  const handleNuevaCategoria = async (nombre: string) => {
    try {
      const nuevaCategoria = {
        id: Date.now().toString(),
        nombre,
        productos: [],
        restauranteId: restauranteId,
        activo: true,
        orden: categorias.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (onCategoriaCreated) {
        onCategoriaCreated(nuevaCategoria);
      }
      setDialogoNuevaCategoria(false);
      toast.success("Categoría creada exitosamente");
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : "Error al crear la categoría";
      toast.error(mensajeError);
    }
  };

  const handleNuevoProducto = (producto: Omit<VersionedProduct, 'id'>) => {
    const nuevoProducto: VersionedProduct = {
      ...producto,
      id: Date.now().toString(),
      categoriaId: categoriaSeleccionada || '',
      currentVersion: 1,
      currentPrice: producto.precio || 0,
      priceHistory: [],
      stock: {
        currentQuantity: 0,
        minQuantity: 0,
        maxQuantity: 100,
        status: 'in_stock',
        lastUpdated: new Date()
      },
      versions: [],
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      }
    };
    setProductosMenu(prev => [...prev, nuevoProducto]);
    setDialogoNuevo(false);
  };

  const handleEditarProducto = (productoEditado: VersionedProduct) => {
    setProductosMenu(productos => 
      productos.map(p => p.id === productoEditado.id ? productoEditado : p)
    );
    setProductoParaEditar(null);
  };

  const handleEliminarProducto = (id: string) => {
    setProductoParaEliminar(id);
    setDialogoEliminar(true);
  };

  const confirmarEliminacion = () => {
    if (productoParaEliminar) {
      setProductosMenu(productos => 
        productos.filter(p => p.id !== productoParaEliminar)
      );
      setDialogoEliminar(false);
      setProductoParaEliminar(null);
    }
  };

  const handleAgregarAlMenu = (producto: VersionedProduct) => {
    console.log('=== handleAgregarAlMenu ===');
    console.log('Producto recibido:', producto);
    console.log('Estado actual de productosMenu:', productosMenu);

    const yaExiste = productosMenu.some(p => p.id === producto.id);
    if (!yaExiste) {
      setProductosMenu(prevProductos => {
        const nuevosProductos = [...prevProductos, producto];
        console.log('Nuevo estado de productosMenu:', nuevosProductos);
        return nuevosProductos;
      });
      toast.success(`${producto.nombre} agregado al menú del día`);
    } else {
      toast.error("Este producto ya está en el menú del día");
    }
  };

  // Renderizado condicional para estado de carga
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  // Renderizado principal
  return (
    <ErrorBoundary>
  <div className="flex flex-col h-full bg-white">
    {error && <div>Error en el componente MenuLayout: {error}</div>}
    
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b bg-white shadow-sm">
          <div className="flex justify-between items-center py-4 px-8">
            <h1 className="text-lg font-medium text-[#4B5563]">
              Menú/Carta
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-[#6B7280] hover:text-[#4B5563] hover:bg-[#F4F4F5]">
                <VideoIcon className="h-4 w-4 mr-2" />
                Ver tutorial
              </Button>
              <Button variant="ghost" className="text-[#6B7280] hover:text-[#4B5563] hover:bg-[#F4F4F5]">
                <FileQuestion className="h-4 w-4 mr-2" />
                Guía de recomendaciones
              </Button>
              <Button 
                onClick={handleGenerarCombinaciones}
                className="bg-[#F4821F] hover:bg-[#CC6A10] text-white transition-colors flex items-center gap-2"
              >
                <GitFork className="h-4 w-4" />
                Generar Combinaciones
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[280px_350px_1fr] h-full">
          {/* Columna Categorías */}
          <div className="border-r border-[#E5E5E5] bg-[#FAFAFA]">
            <div className="py-3 px-6 border-b border-[#E5E5E5] bg-white">
              <h2 className="text-[#1F2937] font-medium text-center">Categorías</h2>
            </div>
            <div className="px-4 py-2">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <ListaCategorias
                  categorias={categorias}
                  categoriaSeleccionada={categoriaSeleccionada}
                  onSelect={setCategoriaSeleccionada}
                />
              )}
            </div>
          </div>
          {/* Columna Productos */}
          <div className="border-r border-[#E5E5E5] bg-white">
            <div className="py-3 px-6 border-b border-[#E5E5E5]">
              <h2 className="text-[#1F2937] font-medium text-center">Productos</h2>
            </div>
            <div className="px-4 py-2">
            <ListaProductos
              restauranteId={restauranteId}
              categoriaId={categoriaSeleccionada || undefined}  // Cambiar null por undefined
              onProductSelect={handleAgregarAlMenu}
            />
            </div>
          </div>

          {/* Columna Menú del Día */}
          <div className="bg-white">
            <div className="border-b border-[#E5E5E5]">
              <h2 className="text-[#1F2937] font-medium text-center py-3">Menú del Día</h2>
              <div className="grid grid-cols-[300px_1fr] border-t border-[#E5E5E5]">
                <div className="text-sm text-[#6B7280] text-center border-r border-[#E5E5E5] py-3 bg-[#FFF4E6]">
                  Producto
                </div>
                <div className="text-sm text-[#6B7280] text-center py-3 bg-[#F4F4F5]">
                  Descripción
                </div>
              </div>
            </div>
            <div className="px-4 py-2">
              <MenuDiario productos={productosMenu} />
            </div>
          </div>
        </div>

        {/* Diálogos */}
        {dialogoNuevaCategoria && (
          <DialogoNuevaCategoria
            open={dialogoNuevaCategoria}
            onOpenChange={setDialogoNuevaCategoria}
            onSubmit={async (nombre) => {
              try {
                const nuevaCategoria = {
                  id: Date.now().toString(),
                  nombre,
                  productos: [],
                  restauranteId: restauranteId,
                  activo: true,
                  orden: categorias.length + 1,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                
                // Si tienes setCategorias como prop, usar:
                // setCategorias([...categorias, nuevaCategoria]);
                // Si no, puedes emitir un evento:
                setDialogoNuevaCategoria(false);
                toast.success("Categoría creada exitosamente");
              } catch (error) {
                const mensajeError = error instanceof Error ? error.message : "Error al crear la categoría";
                toast.error(mensajeError);
              }
            }}
          />
        )}
        {/* Diálogo Nuevo Producto */}
        {dialogoNuevo && (
          <DialogoNuevoProducto
            open={dialogoNuevo}
            onOpenChange={setDialogoNuevo}
            onSubmit={handleNuevoProducto}
            categoriaId={categoriaSeleccionada || ''}  // Forzar string no-null
          />
        )}

        {/* Diálogo de Confirmación de Eliminación */}
        <Dialog 
          open={dialogoEliminar} 
          onOpenChange={setDialogoEliminar}
        >
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>¿Estás seguro?</DialogTitle>
              <DialogDescription>
                Esta acción eliminará el producto del catálogo. No afectará a los menús existentes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogoEliminar(false)}
                className="bg-white hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminacion}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
      </div>
    </ErrorBoundary>
  );
}