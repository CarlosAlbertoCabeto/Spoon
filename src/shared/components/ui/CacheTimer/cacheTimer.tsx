// src/shared/components/ui/CacheTimer/cacheTimer.tsx
'use client';

import { useState, useEffect } from 'react';

export const CacheTimer = () => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const CACHE_KEY = 'menu_combinaciones';

  useEffect(() => {
    const updateTimer = () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { timestamp } = JSON.parse(cached);
          const expirationTime = timestamp + (1000 * 60 * 60); // 1 hora
          const now = Date.now();
          const remaining = expirationTime - now;

          if (remaining > 0) {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setTimeLeft(`${minutes}m ${seconds}s`);
          } else {
            setTimeLeft('Expirado');
            localStorage.removeItem(CACHE_KEY);
          }
        } catch (error) {
          console.error('Error al parsear el caché:', error);
          setTimeLeft('Error');
        }
      } else {
        setTimeLeft('No activo');
      }
    };

    // Actualizar inmediatamente
    updateTimer();
    
    // Actualizar cada segundo
    const timer = setInterval(updateTimer, 1000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="text-sm font-medium text-gray-500">Tiempo restante caché</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">
        {timeLeft}
      </div>
    </div>
  );
};

export default CacheTimer;