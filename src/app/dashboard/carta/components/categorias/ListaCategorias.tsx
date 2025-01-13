// src/app/dashboard/carta/components/categorias/ListaCategorias.tsx
import { CATEGORIAS_FIJAS } from '../../constants/categorias';
import Image from 'next/image';

interface Categoria {
  id: string;
  nombre: string;
}

interface ListaCategoriasProps {
  categorias: Categoria[];
  categoriaSeleccionada: string | null;
  onSelect: (id: string) => void;
}

export function ListaCategorias({
  categorias,
  categoriaSeleccionada,
  onSelect,
}: ListaCategoriasProps) {
  const getIconoCategoria = (id: string) => {
    const iconos = {
      'entrada': '/iconos/sopa.png',
      'principio': '/iconos/principio.png',
      'proteina': '/iconos/carne.png',
      'acompanamiento': '/iconos/sopa.png',
      'bebida': '/iconos/bebida.png'
    };

    return iconos[id as keyof typeof iconos] || '';
  };

  return (
    <div className="space-y-1 -ml-6">
      {categorias.map((categoria) => (
        <button
          key={categoria.id}
          onClick={() => onSelect(categoria.id)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            categoriaSeleccionada === categoria.id
              ? 'bg-primary/10 text-primary'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <div className="w-5 h-5 flex-shrink-0">
            <Image
              src={getIconoCategoria(categoria.id)}
              alt={categoria.nombre}
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <span className="font-medium">{categoria.nombre}</span>
        </button>
      ))}
    </div>
  );
}
