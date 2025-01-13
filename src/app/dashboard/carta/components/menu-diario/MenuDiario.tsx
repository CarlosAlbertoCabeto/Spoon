import { Trash2 } from 'lucide-react';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

interface MenuDiarioProps {
  productos: VersionedProduct[];
}

export const productosEjemplo: VersionedProduct[] = [
  {
    id: 'e1',
    nombre: 'Sopa de Guineo',
    descripcion: 'Sopa tradicional con plátano verde',
    precio: 8000,
    currentPrice: 8000,
    categoriaId: 'entrada',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 10,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'e2',
    nombre: 'Ajiaco',
    descripcion: 'Sopa típica con tres tipos de papa, pollo y guascas',
    precio: 12000,
    currentPrice: 12000,
    categoriaId: 'entrada',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 15,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'e3',
    nombre: 'Crema de Champiñones',
    descripcion: 'Crema suave con champiñones frescos',
    precio: 10000,
    currentPrice: 10000,
    categoriaId: 'entrada',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 12,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'p1',
    nombre: 'Frijoles',
    descripcion: 'Frijoles rojos cocinados con platano y costilla',
    precio: 8000,
    currentPrice: 8000,
    categoriaId: 'principio',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 20,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'p2',
    nombre: 'Lentejas',
    descripcion: 'Lentejas guisadas con verduras',
    precio: 7000,
    currentPrice: 7000,
    categoriaId: 'principio',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 18,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'p3',
    nombre: 'Garbanzos',
    descripcion: 'Garbanzos guisados con especias',
    precio: 7500,
    currentPrice: 7500,
    categoriaId: 'principio',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 15,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'pr1',
    nombre: 'Pechuga a la Plancha',
    descripcion: 'Pechuga de pollo a la plancha con especias',
    precio: 15000,
    currentPrice: 15000,
    categoriaId: 'proteina',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 25,
      minQuantity: 8,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'pr2',
    nombre: 'Carne Asada',
    descripcion: 'Carne de res asada al término deseado',
    precio: 18000,
    currentPrice: 18000,
    categoriaId: 'proteina',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 20,
      minQuantity: 8,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'pr3',
    nombre: 'Pescado Frito',
    descripcion: 'Filete de pescado frito',
    precio: 16000,
    currentPrice: 16000,
    categoriaId: 'proteina',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 15,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'ac1',
    nombre: 'Arroz Blanco',
    descripcion: 'Arroz blanco cocido al vapor',
    precio: 3000,
    currentPrice: 3000,
    categoriaId: 'acompanamiento',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 50,
      minQuantity: 20,
      maxQuantity: 200,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 30, high: 150 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'ac2',
    nombre: 'Ensalada',
    descripcion: 'Ensalada de tomate y Cebolla',
    precio: 4000,
    currentPrice: 4000,
    categoriaId: 'acompanamiento',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 30,
      minQuantity: 10,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 15, high: 80 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'ac3',
    nombre: 'Patacon',
    descripcion: 'Patacon frito con ahogao',
    precio: 3500,
    currentPrice: 3500,
    categoriaId: 'acompanamiento',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 40,
      minQuantity: 15,
      maxQuantity: 120,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 20, high: 100 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'b1',
    nombre: 'Jugo de Mora',
    descripcion: 'Jugo en Agua de Mora',
    precio: 5000,
    currentPrice: 5000,
    categoriaId: 'bebida',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 45,
      minQuantity: 15,
      maxQuantity: 150,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 20, high: 120 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'b2',
    nombre: 'Limonada',
    descripcion: 'Limonada Natural',
    precio: 4500,
    currentPrice: 4500,
    categoriaId: 'bebida',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 40,
      minQuantity: 15,
      maxQuantity: 150,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 20, high: 120 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  }
];
export function MenuDiario({ productos = [] }: MenuDiarioProps) {
  const productosAMostrar = productos.length > 0 ? productos : productosEjemplo;
 
  const nombresCategorias: Record<string, string> = {
    'entrada': 'Entradas',
    'principio': 'Principios',
    'proteina': 'Proteínas',
    'acompanamiento': 'Acompañamientos',
    'bebida': 'Bebidas'
  };
 
  const productosPorCategoria = productosAMostrar.reduce((acc: Record<string, { nombre: string, productos: VersionedProduct[] }>, producto) => {
    const nombreCategoria = nombresCategorias[producto.categoriaId] || producto.categoriaId;
    
    if (!acc[producto.categoriaId]) {
      acc[producto.categoriaId] = {
        nombre: nombreCategoria,
        productos: []
      };
    }
    
    acc[producto.categoriaId].productos.push(producto);
    return acc;
  }, {});
 
  if (productosAMostrar.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-neutral-500 text-center">
          Selecciona productos para comenzar a armar el menú
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-4">
      {Object.entries(productosPorCategoria).map(([categoriaId, categoria]) => (
        <div key={categoriaId} className="relative pl-4 border-l-2 border-[#F4821F]">
          <h3 className="font-medium text-gray-900 mb-3 pl-2">{categoria.nombre}</h3>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {categoria.productos.map((producto: VersionedProduct) => (
                <div key={producto.id} className="grid grid-cols-[300px_1fr] hover:bg-gray-50">
                  <div className="p-3 border-r border-gray-100">
                    <span className="text-gray-900">{producto.nombre}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-gray-600">{producto.descripcion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}