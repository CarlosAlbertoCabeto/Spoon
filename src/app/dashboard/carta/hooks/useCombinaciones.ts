import { useState, useEffect, useCallback } from 'react';
import { Producto, MenuCombinacion, CategoriaMenu } from '../types/menu.types';
import { favoritosService } from '../services/favoritos.service';
import { toast } from 'sonner';

interface UseCombinacionesProps {
  productos: Producto[];
  restauranteId: string;
}

export function useCombinaciones({ productos, restauranteId }: UseCombinacionesProps) {
  const [combinaciones, setCombinaciones] = useState<MenuCombinacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);

  const fetchFavoritos = useCallback(async () => {
    try {
      setLoadingFavoritos(true);
      const favoritos = await favoritosService.getFavoritos(restauranteId);
      const favoritosIds = new Set(favoritos.map(f => f.combinacionId));

      setCombinaciones(prevCombinaciones => 
        prevCombinaciones.map(combinacion => ({
          ...combinacion,
          favorito: favoritosIds.has(combinacion.id)
        }))
      );
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      toast.error('No se pudieron cargar los favoritos');
    } finally {
      setLoadingFavoritos(false);
    }
  }, [restauranteId]);

  const toggleFavorito = useCallback(async (id: string) => {
    try {
      await favoritosService.toggleFavorito(restauranteId, id);
      
      setCombinaciones(prevCombinaciones => 
        prevCombinaciones.map(combinacion => 
          combinacion.id === id 
            ? { ...combinacion, favorito: !combinacion.favorito }
            : combinacion
        )
      );
    } catch (error) {
      console.error('Error al togglear favorito:', error);
      toast.error('No se pudo actualizar el favorito');
    }
  }, [restauranteId]);

  const toggleEspecial = useCallback((id: string) => {
    setCombinaciones(prevCombinaciones => 
      prevCombinaciones.map(combinacion => {
        if (combinacion.id !== id) return combinacion;
        
        if (!combinacion.especial) {
          const precioOriginal = calcularPrecioCombinacion(combinacion);
          const precioEspecial = Math.floor(precioOriginal * 0.9);
          
          return {
            ...combinacion,
            especial: true,
            precioEspecial,
            disponibilidadEspecial: {
              desde: new Date(),
              hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          };
        }
        
        return {
          ...combinacion,
          especial: false,
          precioEspecial: undefined,
          disponibilidadEspecial: undefined
        };
      })
    );
  }, []);

  const calcularPrecioCombinacion = (combinacion: MenuCombinacion) => {
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

  const filtrarProductosPorCategoria = useCallback((categoria: string): Producto[] => {
    return productos.filter(producto => producto.categoriaId === categoria);
  }, [productos]);

  const generarCombinaciones = useCallback(() => {
    setLoading(true);
    console.log('Iniciando generación de combinaciones...');
    
    try {
      const entradas = filtrarProductosPorCategoria(CategoriaMenu.ENTRADA);
      const principios = filtrarProductosPorCategoria(CategoriaMenu.PRINCIPIO);
      const proteinas = filtrarProductosPorCategoria(CategoriaMenu.PROTEINA);
      const acompanamientos = filtrarProductosPorCategoria(CategoriaMenu.ACOMPANAMIENTO);
      const bebidas = filtrarProductosPorCategoria(CategoriaMenu.BEBIDA);

      if (!entradas.length || !principios.length || !proteinas.length || 
          !acompanamientos.length || !bebidas.length) {
        throw new Error('Faltan productos en algunas categorías');
      }

      console.log('Productos encontrados por categoría:');
      console.log(`Entradas: ${entradas.length}`);
      console.log(`Principios: ${principios.length}`);
      console.log(`Proteínas: ${proteinas.length}`);
      console.log(`Acompañamientos: ${acompanamientos.length}`);
      console.log(`Bebidas: ${bebidas.length}`);

      const nuevasCombinaciones: MenuCombinacion[] = [];
      let idCombinacion = 1;

      principios.forEach(principio => {
        proteinas.forEach(proteina => {
          nuevasCombinaciones.push({
            id: `menu-${idCombinacion++}`,
            entrada: entradas[0],
            principio,
            proteina,
            acompanamiento: acompanamientos,
            bebida: bebidas[0],
            favorito: false,
            especial: false
          });
        });
      });

      console.log(`Total de combinaciones generadas: ${nuevasCombinaciones.length}`);
      setCombinaciones(nuevasCombinaciones);
      setError(null);
      
      // Cargar estado de favoritos después de generar combinaciones
      fetchFavoritos();
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error al generar combinaciones';
      setError(mensajeError);
      console.error('Error en generarCombinaciones:', mensajeError);
    } finally {
      setLoading(false);
    }
  }, [productos, filtrarProductosPorCategoria, fetchFavoritos]);

  useEffect(() => {
    if (productos.length > 0) {
      generarCombinaciones();
    }
  }, [productos, generarCombinaciones]);

  return {
    combinaciones,
    loading: loading || loadingFavoritos,
    error,
    regenerarCombinaciones: generarCombinaciones,
    toggleFavorito,
    toggleEspecial
  };
}