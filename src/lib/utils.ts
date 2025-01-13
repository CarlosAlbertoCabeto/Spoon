import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Función para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear precios
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}

// Otras funciones de utilidad que puedas necesitar