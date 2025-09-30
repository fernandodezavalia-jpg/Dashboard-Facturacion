export enum EstadoFactura {
  COBRADO = 'COBRADO',
  IMPAGO = 'IMPAGO',
  PENDIENTE = 'PENDIENTE',
  ANULADO = 'ANULADO',
}

export interface Factura {
  razonSocial: string;
  empresa: string;
  puntoVenta: number;
  fechaRegistro: Date;
  facturaN: string;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  alicuotaIva: number;
  subtotalConIva: number;
  estado: EstadoFactura;
  quincenaTexto: string;
}

export interface KpiData {
  totalFacturado: number;
  totalCobrado: number;
  totalImpago: number;
  cantidadFacturas: number;
}

export interface MonthlySales {
  name: string;
  total: number;
}

export interface ClientData {
  name: string;
  value: number;
}

export interface StatusData {
    name: string;
    value: number;
    // Fix: Added index signature to satisfy the type requirements of the recharts Pie component's data prop.
    [key: string]: any;
}
