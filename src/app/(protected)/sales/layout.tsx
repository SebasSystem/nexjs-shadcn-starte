import { SalesProvider } from 'src/features/sales/context/SalesContext';
import { type ReactNode } from 'react';

/**
 * Layout del route group de Sales.
 * Envuelve todas las páginas de /sales con el SalesProvider
 * para compartir el estado del pipeline, cotizaciones y facturas.
 */
export default function SalesLayout({ children }: { children: ReactNode }) {
  return <SalesProvider>{children}</SalesProvider>;
}
