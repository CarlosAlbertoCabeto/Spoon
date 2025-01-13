/**
 * @fileoverview Componente personalizado de Tabs
 * @module Tabs
 * @description Implementación de un sistema de pestañas accesible y personalizable
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Interfaz para el contexto de los Tabs
 * @interface TabsContextValue
 */
interface TabsContextValue<T extends string> {
  /** Valor actualmente seleccionado */
  value?: T;
  /** Callback para cambiar el valor seleccionado */
  onValueChange?: (value: T) => void;
}

/**
 * Tipo para el valor por defecto del contexto
 */
type TabsContextType = TabsContextValue<string> | undefined;

/**
 * Contexto para compartir el estado entre componentes de Tabs
 */
const TabsContext = React.createContext<TabsContextType>(undefined);

/**
 * Hook personalizado para usar el contexto de los tabs
 * @template T - Tipo de los valores de los tabs
 */
const useTabsContext = <T extends string>() => {
  const context = React.useContext(TabsContext);
  return context as TabsContextValue<T> | undefined;
};

/**
 * Props para el componente Tabs principal
 * @interface TabsProps
 */
interface TabsProps<T extends string> {
  /** Valor actualmente seleccionado */
  value?: T;
  /** Callback para cambiar el valor seleccionado */
  onValueChange?: (value: T) => void;
  /** Contenido del componente */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el componente TabsList
 * @interface TabsListProps
 */
interface TabsListProps {
  /** Contenido de la lista de tabs */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el componente TabsTrigger
 * @interface TabsTriggerProps
 */
interface TabsTriggerProps<T extends string> {
  /** Valor único que identifica este tab */
  value: T;
  /** Contenido del trigger */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Estado de deshabilitado */
  disabled?: boolean;
}

/**
 * Props para el componente TabsContent
 * @interface TabsContentProps
 */
interface TabsContentProps<T extends string> {
  /** Valor que identifica este contenido */
  value: T;
  /** Contenido del panel */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente principal de Tabs
 * @component
 * @template T - Tipo de los valores de los tabs
 * @param {TabsProps<T>} props - Props del componente
 * @returns {JSX.Element} Contenedor principal de los tabs
 */
export function Tabs<T extends string>({ 
  value, 
  onValueChange, 
  children, 
  className = '' 
}: TabsProps<T>) {
  const contextValue = React.useMemo(
    () => ({ value, onValueChange }),
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * Componente que contiene los triggers de los tabs
 * @component
 * @param {TabsListProps} props - Props del componente
 * @returns {JSX.Element} Lista de triggers de tabs
 */
export function TabsList({
  children,
  className = ''
}: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-[#F4F4F5] p-1',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

/**
 * Componente para cada trigger individual de tab
 * @component
 * @template T - Tipo del valor del trigger
 * @param {TabsTriggerProps<T>} props - Props del componente
 * @returns {JSX.Element} Botón trigger del tab
 */
export function TabsTrigger<T extends string>({
  value,
  children,
  className = '',
  disabled = false
}: TabsTriggerProps<T>) {
  const context = useTabsContext<T>();
  const isActive = context?.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5',
        'text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4821F] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-white text-[#4B5563] shadow-sm': isActive,
          'text-[#6B7280] hover:bg-white/50': !isActive && !disabled,
        },
        className
      )}
      onClick={() => {
        if (!disabled && context?.onValueChange) {
          context.onValueChange(value);
        }
      }}
    >
      {children}
    </button>
  );
}

/**
 * Componente para el contenido de cada tab
 * @component
 * @template T - Tipo del valor del contenido
 * @param {TabsContentProps<T>} props - Props del componente
 * @returns {JSX.Element | null} Panel de contenido del tab o null si no está seleccionado
 */
export function TabsContent<T extends string>({
  value,
  children,
  className = ''
}: TabsContentProps<T>) {
  const context = useTabsContext<T>();
  const isSelected = context?.value === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      aria-label={`Contenido del tab ${value}`}
      className={cn(
        'mt-2',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4821F] focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </div>
  );
}

export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabsContextValue
};