import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ClientData } from '../types';

interface ClientBreakdownChartProps {
  data: ClientData[];
}

const COLORS = ['#38B2AC', '#4299E1', '#9F7AEA', '#ED8936', '#F56565', '#48BB78', '#ECC94B', '#3182CE', '#D53F8C', '#667EEA'];


const ClientBreakdownChart: React.FC<ClientBreakdownChartProps> = ({ data }) => {
    
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
                    <p className="font-bold">{`Cliente: ${label}`}</p>
                    <p className="text-sm">{`Total Facturado: ${formatCurrency(payload[0].value)}`}</p>
                </div>
            );
        }
        return null;
    };
    
    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis type="number" stroke="#A0AEC0" tickFormatter={formatCurrency} />
                    <YAxis type="category" dataKey="name" stroke="#A0AEC0" width={150} tick={{ fontSize: 12, fill: '#E2E8F0' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.2)' }} />
                    <Bar dataKey="value" name="Facturación" barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ClientBreakdownChart;