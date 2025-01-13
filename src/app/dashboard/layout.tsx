'use client'

import React from 'react';
import { Logo } from '@/shared/components/ui/Logo';
import { Card } from '@/shared/components/ui/Card';
import BarraLateral from '@/app/dashboard/components/BarraLateral';
import { useRouter, usePathname } from 'next/navigation';

interface UsuarioMenuProps {
  usuario: {
    nombre: string;
    rol: string;
  };
}

const UsuarioMenu: React.FC<UsuarioMenuProps> = ({ usuario }) => {
  const [estaMenuAbierto, setEstaMenuAbierto] = React.useState(false);
  const router = useRouter();

  const handleCerrarSesion = () => {
    // Aquí iría la lógica de cierre de sesión
    router.push('/auth/login');
  };

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#FFF9F2] transition-colors duration-200"
        onClick={() => setEstaMenuAbierto(!estaMenuAbierto)}
      >
        <div className="h-8 w-8 rounded-full bg-[#F4821F]/10 flex items-center justify-center">
          <svg className="h-5 w-5 text-[#F4821F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="text-sm">
          <p className="font-medium text-neutral-700">{usuario.nombre}</p>
          <p className="text-xs text-neutral-500">{usuario.rol}</p>
        </div>
        <svg
          className={`h-5 w-5 text-neutral-400 transform transition-transform duration-200 ${estaMenuAbierto ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {estaMenuAbierto && (
        <Card className="absolute right-0 mt-2 w-48 p-0 divide-y divide-neutral-200 shadow-lg">
          <div className="py-1">
            <button 
              onClick={() => router.push('/dashboard/perfil')}
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-[#FFF9F2] transition-colors"
            >
              Mi Perfil
            </button>
            <button 
              onClick={() => router.push('/dashboard/configuracion')}
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-[#FFF9F2] transition-colors"
            >
              Configuración
            </button>
          </div>
          <div className="py-1">
            <button 
              onClick={handleCerrarSesion}
              className="w-full text-left px-4 py-2 text-sm text-[#E74C3C] hover:bg-[#FFF9F2] transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const usuarioDemo = {
    nombre: 'Usuario Demo',
    rol: 'Administrador'
  };

  const isFullWidth = pathname.includes('/dashboard/carta');

  return (
    <div className="min-h-screen bg-white">
      {/* Barra Superior Fija */}
      <header className="h-[73px] bg-white border-b border-neutral-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between h-full px-8">
          <div className="flex items-center gap-2">
            <Logo variant="default" size="md" />
            <span className="text-lg font-semibold text-neutral-900">
              Dashboard
            </span>
          </div>
          <UsuarioMenu usuario={usuarioDemo} />
        </div>
      </header>

      {/* Contenedor principal con barra lateral fija */}
      <div className="pt-[90px] flex">
        {/* Barra Lateral Fija */}
        <aside className="w-40 fixed left-0 top-[50px] bottom-0 bg-white border-r border-neutral-100">
          <div className="py-2 px-0">
            <BarraLateral />
          </div>
        </aside>

        {/* Contenido Principal con scroll */}
        <main className="flex-1 ml-64">
          <div className={isFullWidth ? 'px-12 h-full' : 'max-w-7x1 mx-auto p-10'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}