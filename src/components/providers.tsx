// src/components/providers.tsx
'use client';

import { Suspense } from 'react';
import { AuthProvider } from '@/context/authcontext';
import { ThemeProvider } from '@/shared/Context/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  );
}