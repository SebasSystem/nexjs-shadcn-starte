import { type ReactNode } from 'react';
import { SalesProvider } from 'src/features/sales/context/SalesContext';

/**
 * Layout del route group de Sales.
 * Envuelve todas las páginas de /sales con el SalesProvider
 * para compartir el estado del pipeline, cotizaciones y facturas.
 */
export default function SalesLayout({ children }: { children: ReactNode }) {
  return <SalesProvider>{children}</SalesProvider>;
}
