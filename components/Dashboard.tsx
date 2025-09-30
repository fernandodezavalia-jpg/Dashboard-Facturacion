import React, { useState, useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiCard from './KpiCard';
import SalesChart from './SalesChart';
import ClientBreakdownChart from './ClientBreakdownChart';
import StatusPieChart from './StatusPieChart';
import DataTable from './DataTable';
import { EstadoFactura, Factura } from '../types';

const Dashboard: React.FC = () => {
    const [filterYear, setFilterYear] = useState('all');
    const { facturas, kpiData, monthlySales, topClients, statusData, availableYears } = useDashboardData(filterYear);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEmpresa, setFilterEmpresa] = useState('all');
    const [filterEstado, setFilterEstado] = useState('all');

    const uniqueEmpresas = useMemo(() => {
        const empresas = new Set(facturas.map(f => f.empresa));
        return Array.from(empresas).sort();
    }, [facturas]);

    const filteredFacturas = useMemo(() => {
        return facturas.filter(factura => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                factura.razonSocial.toLowerCase().includes(searchTermLower) ||
                factura.empresa.toLowerCase().includes(searchTermLower) ||
                factura.concepto.toLowerCase().includes(searchTermLower) ||
                factura.facturaN.toLowerCase().includes(searchTermLower);

            const matchesEmpresa = filterEmpresa === 'all' || factura.empresa === filterEmpresa;
            const matchesEstado = filterEstado === 'all' || factura.estado === filterEstado;

            return matchesSearch && matchesEmpresa && matchesEstado;
        });
    }, [facturas, searchTerm, filterEmpresa, filterEstado]);

    if (!availableYears?.length) {
        return <div className="p-8 text-center text-xl">Cargando datos...</div>;
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(value);
    };

    return (
        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Financiero</h1>
                <p className="text-gray-400 mt-1">Análisis de facturación y cobranzas.</p>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Facturado" value={formatCurrency(kpiData.totalFacturado)} />
                <KpiCard title="Total Cobrado" value={formatCurrency(kpiData.totalCobrado)} />
                <KpiCard title="Pendiente de Cobro" value={formatCurrency(kpiData.totalFacturado - kpiData.totalCobrado)} />
                <KpiCard title="Cantidad de Facturas" value={kpiData.cantidadFacturas.toLocaleString('es-AR')} />
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">Ventas Mensuales</h2>
                    <SalesChart data={monthlySales} />
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">Estado de Facturas</h2>
                    <StatusPieChart data={statusData} />
                </div>
            </section>

             <section className="grid grid-cols-1 gap-6">
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                     <h2 className="text-xl font-semibold mb-4 text-white">Top 10 Clientes por Facturación</h2>
                     <ClientBreakdownChart data={topClients} />
                 </div>
             </section>

            <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Detalle de Facturas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        <option value="all">Todos los Años</option>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <select
                        value={filterEmpresa}
                        onChange={(e) => setFilterEmpresa(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        <option value="all">Todas las Empresas</option>
                        {uniqueEmpresas.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        <option value="all">Todos los Estados</option>
                        {Object.values(EstadoFactura).filter(e => e !== EstadoFactura.ANULADO).map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <DataTable data={filteredFacturas} />
            </section>
        </main>
    );
};

export default Dashboard;