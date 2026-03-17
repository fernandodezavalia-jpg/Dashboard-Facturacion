/**
 * Script de exportación a Excel - Dashboard de Facturación
 *
 * Genera un archivo Excel (.xlsx) con los datos de facturación organizados en
 * cuatro hojas: Facturas, Resumen KPI, Ventas por Mes y Top Clientes.
 *
 * Uso:
 *   node scripts/export-excel.mjs [archivo_salida.xlsx]
 *
 * Si no se indica un nombre de archivo, se generará "facturas_export.xlsx" en el
 * directorio actual.
 */

import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ---------------------------------------------------------------------------
// Datos crudos embebidos (misma fuente que hooks/useDashboardData.ts)
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hookPath = path.resolve(__dirname, '../hooks/useDashboardData.ts');
const hookSource = readFileSync(hookPath, 'utf-8');

// Extrae el bloque TSV entre los backticks de la constante rawData
const match = hookSource.match(/const rawData = `([\s\S]*?)`/);
if (!match) {
  console.error('No se pudo encontrar rawData en el archivo del hook.');
  process.exit(1);
}
const rawData = match[1];

// ---------------------------------------------------------------------------
// Parseo de los datos
// ---------------------------------------------------------------------------

const ESTADO = {
  COBRADO: 'COBRADO',
  IMPAGO: 'IMPAGO',
  PENDIENTE: 'PENDIENTE',
  ANULADO: 'ANULADO',
};

function parseCurrency(value) {
  if (!value || value.trim() === '' || value.trim() === '-') return 0;
  return parseFloat(
    value.replace(/\$ /g, '').replace(/\./g, '').replace(/,/g, '.')
  );
}

function parseEstado(raw, concepto) {
  if (concepto && concepto.toLowerCase().includes('anulac')) return ESTADO.ANULADO;
  const upper = (raw || '').trim().toUpperCase();
  if ([ESTADO.COBRADO, ESTADO.IMPAGO, ESTADO.PENDIENTE].includes(upper)) return upper;
  return ESTADO.PENDIENTE;
}

const lines = rawData.trim().split('\n').slice(1); // omitir cabecera

const facturas = lines
  .map((line) => {
    const c = line.split('\t');
    return {
      razonSocial:     c[0]  || '',
      empresa:         c[1]  || '',
      puntoVenta:      parseInt(c[2], 10) || 0,
      fechaRegistro:   c[3]  || '',
      facturaN:        c[4]  || '',
      concepto:        c[5]  || '',
      cantidad:        parseFloat((c[6] || '0').replace(',', '.')) || 0,
      precioUnitario:  parseCurrency(c[7]),
      subtotal:        parseCurrency(c[8]),
      alicuotaIva:     parseCurrency(c[9]),
      subtotalConIva:  parseCurrency(c[10]),
      estado:          parseEstado(c[12], c[5]),
      quincenaTexto:   c[14] || '',
    };
  })
  .filter((f) => f.estado !== ESTADO.ANULADO);

// ---------------------------------------------------------------------------
// Hoja 1: Facturas (datos completos)
// ---------------------------------------------------------------------------

const HEADERS_FACTURAS = [
  'Razón Social',
  'Empresa / Cliente',
  'Punto de Venta',
  'Fecha',
  'Nro. Factura',
  'Concepto',
  'Cantidad',
  'Precio Unitario (ARS)',
  'Subtotal (ARS)',
  'Alícuota IVA (ARS)',
  'Total con IVA (ARS)',
  'Estado',
  'Quincena',
];

const rowsFacturas = facturas.map((f) => [
  f.razonSocial,
  f.empresa,
  f.puntoVenta,
  f.fechaRegistro,
  f.facturaN,
  f.concepto,
  f.cantidad,
  f.precioUnitario,
  f.subtotal,
  f.alicuotaIva,
  f.subtotalConIva,
  f.estado,
  f.quincenaTexto,
]);

// ---------------------------------------------------------------------------
// Hoja 2: Resumen KPI
// ---------------------------------------------------------------------------

const totalFacturado = facturas.reduce((s, f) => s + f.subtotalConIva, 0);
const totalCobrado   = facturas.filter((f) => f.estado === ESTADO.COBRADO).reduce((s, f) => s + f.subtotalConIva, 0);
const totalImpago    = facturas.filter((f) => f.estado === ESTADO.IMPAGO).reduce((s, f) => s + f.subtotalConIva, 0);
const totalPendiente = facturas.filter((f) => f.estado === ESTADO.PENDIENTE).reduce((s, f) => s + f.subtotalConIva, 0);
const cantCobrado    = facturas.filter((f) => f.estado === ESTADO.COBRADO).length;
const cantImpago     = facturas.filter((f) => f.estado === ESTADO.IMPAGO).length;
const cantPendiente  = facturas.filter((f) => f.estado === ESTADO.PENDIENTE).length;

const rowsKpi = [
  ['Indicador', 'Monto (ARS)', 'Cantidad de Facturas'],
  ['Total Facturado',      totalFacturado, facturas.length],
  ['Total Cobrado',        totalCobrado,   cantCobrado],
  ['Total Impago',         totalImpago,    cantImpago],
  ['Total Pendiente',      totalPendiente, cantPendiente],
  [],
  ['% Cobrado',  totalFacturado ? ((totalCobrado / totalFacturado) * 100).toFixed(2) + '%' : '0%', ''],
  ['% Impago',   totalFacturado ? ((totalImpago  / totalFacturado) * 100).toFixed(2) + '%' : '0%', ''],
  ['% Pendiente',totalFacturado ? ((totalPendiente / totalFacturado) * 100).toFixed(2) + '%' : '0%', ''],
];

// ---------------------------------------------------------------------------
// Hoja 3: Ventas por Mes
// ---------------------------------------------------------------------------

const salesByMonth = {};
facturas.forEach((f) => {
  const d = new Date(f.fechaRegistro + 'T00:00:00Z');
  const key = d.toLocaleString('es-ES', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  salesByMonth[key] = (salesByMonth[key] || 0) + f.subtotalConIva;
});

const MONTH_ORDER = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12 };

const rowsMes = [
  ['Mes / Año', 'Total Facturado (ARS)'],
  ...Object.entries(salesByMonth)
    .sort(([a], [b]) => {
      const parseKey = (k) => {
        const parts = k.replace('.', '').split(' de ');
        const [m, y] = parts.length === 2 ? parts : k.split(' ');
        return (parseInt(y || m, 10)) * 100 + (MONTH_ORDER[(m || y).toLowerCase()] || 0);
      };
      return parseKey(a) - parseKey(b);
    })
    .map(([mes, total]) => [mes, total]),
];

// ---------------------------------------------------------------------------
// Hoja 4: Top Clientes
// ---------------------------------------------------------------------------

const clientTotals = {};
facturas.forEach((f) => {
  clientTotals[f.empresa] = (clientTotals[f.empresa] || 0) + f.subtotalConIva;
});

const rowsClientes = [
  ['Cliente', 'Total Facturado (ARS)', 'Ranking'],
  ...Object.entries(clientTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([nombre, total], idx) => [nombre, total, idx + 1]),
];

// ---------------------------------------------------------------------------
// Construcción del libro Excel
// ---------------------------------------------------------------------------

const wb = XLSX.utils.book_new();

// --- Hoja Facturas ---
const wsFacturas = XLSX.utils.aoa_to_sheet([HEADERS_FACTURAS, ...rowsFacturas]);

// Ancho de columnas
wsFacturas['!cols'] = [
  { wch: 28 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 13 },
  { wch: 26 }, { wch: 11 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
  { wch: 22 }, { wch: 12 }, { wch: 26 },
];

XLSX.utils.book_append_sheet(wb, wsFacturas, 'Facturas');

// --- Hoja Resumen KPI ---
const wsKpi = XLSX.utils.aoa_to_sheet(rowsKpi);
wsKpi['!cols'] = [{ wch: 22 }, { wch: 24 }, { wch: 22 }];
XLSX.utils.book_append_sheet(wb, wsKpi, 'Resumen KPI');

// --- Hoja Ventas por Mes ---
const wsMes = XLSX.utils.aoa_to_sheet(rowsMes);
wsMes['!cols'] = [{ wch: 18 }, { wch: 26 }];
XLSX.utils.book_append_sheet(wb, wsMes, 'Ventas por Mes');

// --- Hoja Top Clientes ---
const wsClientes = XLSX.utils.aoa_to_sheet(rowsClientes);
wsClientes['!cols'] = [{ wch: 38 }, { wch: 26 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, wsClientes, 'Top Clientes');

// ---------------------------------------------------------------------------
// Escritura del archivo
// ---------------------------------------------------------------------------

const outputFile = process.argv[2] || 'facturas_export.xlsx';
XLSX.writeFile(wb, outputFile);

console.log(`✓ Archivo Excel generado: ${outputFile}`);
console.log(`  • Facturas exportadas : ${facturas.length}`);
console.log(`  • Total facturado     : ARS ${totalFacturado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
console.log(`  • Total cobrado       : ARS ${totalCobrado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`);
console.log(`  • Hojas generadas     : Facturas | Resumen KPI | Ventas por Mes | Top Clientes`);
