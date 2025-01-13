export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
}

export interface MenuCombinacion {
  id: string;
  entrada: Producto;
  principio: Producto;
  proteina: Producto;
  acompanamiento: Producto[];
  bebida: Producto;
  nombre?: string;
  descripcion?: string;
  precioEspecial?: number;
  cantidad?: number;
  estado?: 'disponible' | 'agotado';
  favorito?: boolean;
  especial?: boolean;
}

export interface ProgramacionDia {
  fecha: Date;
  combinaciones: MenuCombinacion[];
  cache?: {
    expira: Date;
    duracion: number;
  };
}

export interface ProgramacionSemanal {
  dias: Record<string, ProgramacionDia>;
  activa: boolean;
  fechaInicio: Date;
  fechaFin: Date;
}