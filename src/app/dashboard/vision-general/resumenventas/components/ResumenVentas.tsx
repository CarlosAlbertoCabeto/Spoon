'use client';

import { DollarSign, TrendingUp, Utensils } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

// Datos de ejemplo - Esto vendría de tu backend
const datosVentas = {
  hoy: {
    total: 850000,
    totalPedidos: 45,
    platoMasVendido: "Hamburguesa Clásica",
  },
  semana: {
    total: 5250000,
    totalPedidos: 280,
    platoMasVendido: "Pizza Margherita",
  },
  mes: {
    total: 22500000,
    totalPedidos: 1200,
    platoMasVendido: "Pizza Margherita",
  }
};

// Datos para el gráfico
const datosGrafico = [
  { name: 'Lun', ventas: 850000 },
  { name: 'Mar', ventas: 920000 },
  { name: 'Mie', ventas: 880000 },
  { name: 'Jue', ventas: 950000 },
  { name: 'Vie', ventas: 1100000 },
  { name: 'Sab', ventas: 1250000 },
  { name: 'Dom', ventas: 1300000 },
];

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

export const ResumenVentas = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'hoy' | 'semana' | 'mes'>('hoy');
  const datos = datosVentas[periodoSeleccionado];

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex gap-4 mb-6">
        {(['hoy', 'semana', 'mes'] as const).map((periodo) => (
          <button
            key={periodo}
            onClick={() => setPeriodoSeleccionado(periodo)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${periodoSeleccionado === periodo
                ? 'bg-[#F4821F] text-white'
                : 'bg-white text-neutral-600 hover:bg-[#FFF9F2]'}
            `}
          >
            {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
          </button>
        ))}
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ventas Totales */}
        <Card className="p-6 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 font-medium">Ventas Totales</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatearMoneda(datos.total)}
              </p>
            </div>
          </div>
        </Card>

        {/* Total Pedidos */}
        <Card className="p-6 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 font-medium">Total Pedidos</p>
              <p className="text-2xl font-bold text-neutral-900">
                {datos.totalPedidos}
              </p>
            </div>
          </div>
        </Card>

        {/* Plato Más Vendido */}
        <Card className="p-6 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Utensils className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 font-medium">Plato Más Vendido</p>
              <p className="text-xl font-bold text-neutral-900">
                {datos.platoMasVendido}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de ventas */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Tendencia de Ventas</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip 
                formatter={(value: number) => [formatearMoneda(value), "Ventas"]}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#F4821F"
                strokeWidth={2}
                dot={{ fill: "#F4821F" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};