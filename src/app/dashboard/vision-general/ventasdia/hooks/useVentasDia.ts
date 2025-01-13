import { useState, useEffect } from 'react';
import { cacheUtils } from '@/utils/cache.utils';
import type { Plato, Producto } from '../types/ventasdia.types';

export const useVentasDia = () => {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [productosAdicionales, setProductosAdicionales] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductosDesdeCache = () => {
      try {
        const productosCache = cacheUtils.get();
        
        if (!productosCache || !Array.isArray(productosCache)) {
          setPlatos([]);
          setError('No hay productos disponibles. Por favor, genera el menú del día.');
          return;
        }

        // Convertir productos a formato plato
        const productos = productosCache.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion || '',
          precio: producto.precio,
          disponibles: typeof producto.cantidad === 'number' ? producto.cantidad : 20,
          estado: producto.cantidad === 0 ? 'agotado' : 'disponible',
          categoriaId: producto.categoriaId
        }));

        // Separar productos principales y adicionales
        const principales = productos.filter(p => 
          ['entrada', 'principio', 'proteina'].includes(p.categoriaId)
        );
        
        const adicionales = productos.filter(p => 
          ['bebida', 'acompanamiento'].includes(p.categoriaId)
        );

        setPlatos(principales);
        setProductosAdicionales(adicionales);
        setError(null);

        console.log('Productos principales:', principales);
        console.log('Productos adicionales:', adicionales);

      } catch (err) {
        console.error('Error al cargar productos:', err);
        setPlatos([]);
        setError('Error al cargar el menú. Por favor, intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };

    cargarProductosDesdeCache();
    const interval = setInterval(cargarProductosDesdeCache, 5000);
    return () => clearInterval(interval);
  }, []);

  const registrarVenta = async (
    platoId: string, 
    cantidad: number = 1, 
    adicionales: Array<{ productoId: string, cantidad: number }> = []
  ) => {
    try {
      // Actualizar estado local
      setPlatos(platosActuales => 
        platosActuales.map(plato => {
          if (plato.id === platoId) {
            const nuevaCantidad = Math.max(0, plato.disponibles - cantidad);
            return {
              ...plato,
              disponibles: nuevaCantidad,
              estado: nuevaCantidad <= 0 ? 'agotado' : 'disponible'
            };
          }
          return plato;
        })
      );

      // Actualizar producto en el caché
      const productosActuales = cacheUtils.get();
      if (Array.isArray(productosActuales)) {
        const productosActualizados = productosActuales.map(producto => {
          if (producto.id === platoId) {
            const nuevaCantidad = Math.max(0, (producto.cantidad || 0) - cantidad);
            return {
              ...producto,
              cantidad: nuevaCantidad
            };
          }
          // Actualizar cantidades de adicionales
          if (adicionales.some(a => a.productoId === producto.id)) {
            const adicional = adicionales.find(a => a.productoId === producto.id);
            const nuevaCantidad = Math.max(0, (producto.cantidad || 0) - (adicional?.cantidad || 0));
            return {
              ...producto,
              cantidad: nuevaCantidad
            };
          }
          return producto;
        });

        cacheUtils.set(productosActualizados);
      }

      return true;
    } catch (err) {
      console.error('Error al registrar venta:', err);
      return false;
    }
  };

  return {
    platos,
    productosAdicionales,
    loading,
    error,
    registrarVenta
  };
};