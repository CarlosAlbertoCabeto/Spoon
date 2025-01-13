'use client';

import { ResumenVentas } from './components';

export default function VisionGeneralPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Visión General</h1>
      <ResumenVentas />
    </div>
  );
}