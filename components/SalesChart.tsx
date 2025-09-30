import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlySales } from '../types';

interface SalesChartProps {
  data: MonthlySales[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(value);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-xl text-white">
          <p className="font-bold">{`Mes: ${label}`}</p>
          <p className="text-sm">{`Ventas: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 50,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="name" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
          <YAxis stroke="#A0AEC0" tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
          <Tooltip 
            cursor={{ fill: 'rgba(56, 178, 172, 0.2)' }}
            content={<CustomTooltip />}
          />
          <Legend wrapperStyle={{ color: '#E2E8F0', fontSize: '14px' }} />
          <Bar dataKey="total" name="Ventas" fill="#38B2AC" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;