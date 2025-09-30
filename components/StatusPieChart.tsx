
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { StatusData, EstadoFactura } from '../types';

interface StatusPieChartProps {
  data: StatusData[];
}

const COLORS: Record<string, string> = {
  [EstadoFactura.COBRADO]: '#48BB78', // green
  [EstadoFactura.PENDIENTE]: '#ECC94B', // yellow
  [EstadoFactura.IMPAGO]: '#F56565', // red
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
             formatter={(value: number, name: string) => [`${value} facturas`, name]}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;
