import { useState, useEffect } from 'react';
import type { MenuCombinacion, Producto } from '@/app/dashboard/carta/types/menu.types';
import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';


const DIAS_SEMANA = {
  'Lunes': { index: 0 },
  'Martes': { index: 1 },
  'Miércoles': { index: 2 },
  'Jueves': { index: 3 },
  'Viernes': { index: 4 },
  'Sábado': { index: 5 },
  'Domingo': { index: 6 }
} as const;

type DiaSemana = keyof typeof DIAS_SEMANA;

// Datos de prueba
const COMBINACIONES_MOCK: MenuCombinacion[] = [
  {
    id: '1',
    entrada: { 
      id: 'e1', 
      nombre: 'Sopa de Guineo', 
      descripcion: 'Sopa tradicional', 
      precio: 8000, 
      categoriaId: CategoriaMenu.ENTRADA 
    },
    principio: { 
      id: 'p1', 
      nombre: 'Frijoles', 
      descripcion: 'Frijoles rojos', 
      precio: 5000, 
      categoriaId: CategoriaMenu.PRINCIPIO 
    },
    proteina: { 
      id: 'pr1', 
      nombre: 'Pechuga a la Plancha', 
      descripcion: 'Pechuga de pollo', 
      precio: 12000, 
      categoriaId: CategoriaMenu.PROTEINA 
    },
    acompanamiento: [
      { 
        id: 'a1', 
        nombre: 'Arroz', 
        descripcion: 'Arroz blanco', 
        precio: 2000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      },
      { 
        id: 'a2', 
        nombre: 'Ensalada', 
        descripcion: 'Ensalada fresca', 
        precio: 2000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      }
    ],
    bebida: { 
      id: 'b1', 
      nombre: 'Limonada', 
      descripcion: 'Limonada natural', 
      precio: 3000, 
      categoriaId: CategoriaMenu.BEBIDA 
    },
    especial: false,
    cantidad: 20
  },
  {
    id: '2',
    entrada: { 
      id: 'e2', 
      nombre: 'Crema de Tomate', 
      descripcion: 'Crema casera', 
      precio: 7000, 
      categoriaId: CategoriaMenu.ENTRADA 
    },
    principio: { 
      id: 'p2', 
      nombre: 'Lentejas', 
      descripcion: 'Lentejas guisadas', 
      precio: 5000, 
      categoriaId: CategoriaMenu.PRINCIPIO 
    },
    proteina: { 
      id: 'pr2', 
      nombre: 'Pescado Frito', 
      descripcion: 'Filete de pescado', 
      precio: 15000, 
      categoriaId: CategoriaMenu.PROTEINA 
    },
    acompanamiento: [
      { 
        id: 'a1', 
        nombre: 'Arroz', 
        descripcion: 'Arroz blanco', 
        precio: 2000, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      },
      { 
        id: 'a3', 
        nombre: 'Patacón', 
        descripcion: 'Patacón pisado', 
        precio: 2500, 
        categoriaId: CategoriaMenu.ACOMPANAMIENTO 
      }
    ],
    bebida: { 
      id: 'b2', 
      nombre: 'Jugo de Mora', 
      descripcion: 'Jugo natural', 
      precio: 3000, 
      categoriaId: CategoriaMenu.BEBIDA 
    },
    especial: true,
    cantidad: 15,
    precioEspecial: 25000
  }
];

export const useCombinacionesProgramacion = () => {
  const [combinacionesDisponibles, setCombinacionesDisponibles] = useState<MenuCombinacion[]>([]);
  const [programacionSemanal, setProgramacionSemanal] = useState<Record<DiaSemana, MenuCombinacion[]>>(() => 
    Object.keys(DIAS_SEMANA).reduce((acc, dia) => ({
      ...acc,
      [dia]: []
    }), {}) as Record<DiaSemana, MenuCombinacion[]>
  );
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('Lunes');
  const [loading, setLoading] = useState(true);

  // Simular carga inicial de datos
  useEffect(() => {
    const cargarDatos = () => {
      setTimeout(() => {
        setCombinacionesDisponibles(COMBINACIONES_MOCK);
        setLoading(false);
      }, 1000); // Simular delay de red
    };

    cargarDatos();
  }, []);

  const agregarCombinacionAlDia = (dia: DiaSemana, combinacion: MenuCombinacion) => {
    setProgramacionSemanal(prev => ({
      ...prev,
      [dia]: [...prev[dia], combinacion]
    }));
  };

  const removerCombinacionDelDia = (dia: DiaSemana, combinacionId: string) => {
    setProgramacionSemanal(prev => ({
      ...prev,
      [dia]: prev[dia].filter(c => c.id !== combinacionId)
    }));
  };

  return {
    combinacionesDisponibles,
    programacionSemanal,
    diaSeleccionado,
    setDiaSeleccionado,
    loading,
    error: null,
    agregarCombinacionAlDia,
    removerCombinacionDelDia,
    diasSemana: Object.keys(DIAS_SEMANA) as DiaSemana[]
  };
};