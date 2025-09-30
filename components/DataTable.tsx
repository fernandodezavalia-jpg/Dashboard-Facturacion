import React, { useState, useMemo } from 'react';
import { Factura, EstadoFactura } from '../types';

interface DataTableProps {
  data: Factura[];
}

type SortKeys = keyof Factura;
type SortDirection = 'ascending' | 'descending';

const SortableHeader: React.FC<{
    column: SortKeys;
    label: string;
    sortConfig: { key: SortKeys; direction: SortDirection } | null;
    requestSort: (key: SortKeys) => void;
}> = ({ column, label, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === column;
    const directionIcon = sortConfig?.direction === 'ascending' ? '▲' : '▼';

    return (
        <th
            className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer select-none"
            onClick={() => requestSort(column)}
        >
            {label} {isSorted && <span className="ml-1">{directionIcon}</span>}
        </th>
    );
};


const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: SortDirection } | null>({ key: 'fechaRegistro', direction: 'descending' });
  const itemsPerPage = 15;

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key: SortKeys) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return sortedData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, sortedData]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(value);
  };
  const formatDate = (date: Date) => date.toLocaleDateString('es-AR', {timeZone: 'UTC'});

  const getStatusClass = (status: EstadoFactura) => {
      switch (status) {
          case EstadoFactura.COBRADO:
              return 'bg-green-500/20 text-green-300';
          case EstadoFactura.IMPAGO:
              return 'bg-red-500/20 text-red-300';
          case EstadoFactura.PENDIENTE:
              return 'bg-yellow-500/20 text-yellow-300';
          default:
              return 'bg-gray-500/20 text-gray-300';
      }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <SortableHeader column="fechaRegistro" label="Fecha" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader column="razonSocial" label="Razón Social" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader column="empresa" label="Empresa" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader column="concepto" label="Concepto" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader column="subtotalConIva" label="Total" sortConfig={sortConfig} requestSort={requestSort} />
              <SortableHeader column="estado" label="Estado" sortConfig={sortConfig} requestSort={requestSort} />
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {currentTableData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-700/50 transition-colors duration-200">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{formatDate(item.fechaRegistro)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.razonSocial}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.empresa}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate" title={item.concepto}>{item.concepto}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{formatCurrency(item.subtotalConIva)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.estado)}`}>
                        {item.estado}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="py-3 flex items-center justify-between mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"> Anterior </button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"> Siguiente </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
                <p className="text-sm text-gray-400">
                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> de <span className="font-medium">{sortedData.length}</span> resultados
                </p>
            </div>
            <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50">
                        <span className="sr-only">Anterior</span>&lt;
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50">
                        <span className="sr-only">Siguiente</span>&gt;
                    </button>
                </nav>
            </div>
        </div>
      </div>
    </>
  );
};

export default DataTable;