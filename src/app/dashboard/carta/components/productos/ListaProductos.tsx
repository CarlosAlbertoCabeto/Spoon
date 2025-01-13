'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProductos } from '@/app/dashboard/carta/hooks/useProductos';
import  VirtualizedProductList  from '@/app/dashboard/carta/components/VirtualizedProductList';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { Loader2 } from 'lucide-react';
import type { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import debounce from 'lodash/debounce';

interface ListaProductosProps {
  restauranteId: string;
  categoriaId?: string;
  onProductSelect?: (product: VersionedProduct) => void;
}

interface FilterState {
  search: string;
  sortBy: 'name' | 'price' | 'stock';
  sortOrder: 'asc' | 'desc';
  status: 'all' | 'active' | 'inactive';
  stockFilter: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
}

const ITEMS_PER_PAGE = 20;

function ListaProductos({ 
  restauranteId, 
  categoriaId,
  onProductSelect 
}: ListaProductosProps) {
  // Estados
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    status: 'all',
    stockFilter: 'all'
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Obtener productos usando el hook personalizado
  const { productos, loading, error } = useProductos({ restauranteId, categoriaId });

  // Debounce para la búsqueda
  const updateDebouncedSearch = useMemo(
    () => debounce((value: string) => {
      setDebouncedSearch(value);
    }, 300),
    []
  );

  // Manejadores de eventos
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    updateDebouncedSearch(value);
  };

  const handleSortChange = (value: FilterState['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: value,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusChange = (value: FilterState['status']) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleStockFilterChange = (value: FilterState['stockFilter']) => {
    setFilters(prev => ({ ...prev, stockFilter: value }));
  };

  // Filtrar y ordenar productos
  const filteredAndSortedProducts = useMemo(() => {
    if (!productos) return [];

    return productos
      .filter(product => {
        // Filtro de búsqueda
        const matchesSearch = !debouncedSearch || 
          product.nombre.toLowerCase().includes(debouncedSearch.toLowerCase());

        // Filtro de estado
        const matchesStatus = filters.status === 'all' || 
          product.status === filters.status;

        // Filtro de stock
        let matchesStock = true;
        if (filters.stockFilter !== 'all') {
          switch (filters.stockFilter) {
            case 'inStock':
              matchesStock = product.stock.status === 'in_stock';
              break;
            case 'lowStock':
              matchesStock = product.stock.status === 'low_stock';
              break;
            case 'outOfStock':
              matchesStock = product.stock.status === 'out_of_stock';
              break;
          }
        }

        return matchesSearch && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        
        switch (filters.sortBy) {
          case 'name':
            return order * a.nombre.localeCompare(b.nombre);
          case 'price':
            return order * (a.currentPrice - b.currentPrice);
          case 'stock':
            return order * (a.stock.currentQuantity - b.stock.currentQuantity);
          default:
            return 0;
        }
      });
  }, [productos, debouncedSearch, filters]);

  // Paginación
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, page]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch]);
 // Renderizado condicional para estados de carga y error
 if (loading) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[#FF9933]" />
    </div>
  );
}

if (error) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
      <p className="text-lg font-medium">Error al cargar los productos</p>
      <p className="text-sm">{error}</p>
    </div>
  );
}

return (
  <div className="space-y-6">
    {/* Filtros y Búsqueda */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Input
        type="search"
        placeholder="Buscar productos..."
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full"
      />

      <Select
        value={filters.sortBy}
        onValueChange={(value: FilterState['sortBy']) => handleSortChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Ordenar por..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nombre</SelectItem>
          <SelectItem value="price">Precio</SelectItem>
          <SelectItem value="stock">Stock</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value: FilterState['status']) => handleStatusChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Estado..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activos</SelectItem>
          <SelectItem value="inactive">Inactivos</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.stockFilter}
        onValueChange={(value: FilterState['stockFilter']) => handleStockFilterChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Stock..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo</SelectItem>
          <SelectItem value="inStock">En stock</SelectItem>
          <SelectItem value="lowStock">Stock bajo</SelectItem>
          <SelectItem value="outOfStock">Sin stock</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Lista virtualizada de productos */}
    {paginatedProducts.length > 0 ? (
      <VirtualizedProductList
        products={paginatedProducts}
        onProductClick={onProductSelect}
      />
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-50 rounded-lg">
        <p className="text-gray-500">No se encontraron productos</p>
        {debouncedSearch && (
          <p className="text-sm text-gray-400">
            Prueba con otros términos de búsqueda
          </p>
        )}
      </div>
    )}

    {/* Paginación */}
    {paginatedProducts.length > 0 && (
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(page * ITEMS_PER_PAGE, filteredAndSortedProducts.length)} de {filteredAndSortedProducts.length} productos
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="secondary"
          >
            Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                onClick={() => setPage(i + 1)}
                variant={page === i + 1 ? "default" : "ghost"}
                className={`w-8 h-8 p-0 ${page === i + 1 ? 'bg-[#FF9933]' : ''}`}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="secondary"
          >
            Siguiente
          </Button>
        </div>
      </div>
    )}
  </div>
);
} 
// Al final del archivo asegúrate de tener:
export default ListaProductos;