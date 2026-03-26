import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface DashboardKPIs {
  metaMensual: number;
  ventasLogradas: number;
  comisionProyectada: number;
  comisionLiquidada: number;
}

export interface TramoProgreso {
  id: string;
  nombre: string;
  rangoTxt: string;
  porcentaje: number;
  completado: number; // 0 a 100
  estado: 'COMPLETADO' | 'EN_PROGRESO' | 'PENDIENTE';
  montoLogrado: number;
  montoMeta: number;
}

export interface VentaReciente {
  id: string;
  fecha: string;
  cliente: string;
  monto: number;
  comisionGenerada: number;
}

// Simulador del backend
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useDashboardComisiones = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [tramos, setTramos] = useState<TramoProgreso[]>([]);
  const [ventas, setVentas] = useState<VentaReciente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      await delay(800);
      setKpis({
        metaMensual: 12000,
        ventasLogradas: 8040,
        comisionProyectada: 402,
        comisionLiquidada: 0,
      });

      setTramos([
        {
          id: '1',
          nombre: 'Tramo 1',
          rangoTxt: '$0 - $5,000',
          porcentaje: 3,
          completado: 100,
          estado: 'COMPLETADO',
          montoLogrado: 5000,
          montoMeta: 5000,
        },
        {
          id: '2',
          nombre: 'Tramo 2',
          rangoTxt: '$5,001 - $10,000',
          porcentaje: 5,
          completado: 61,
          estado: 'EN_PROGRESO',
          montoLogrado: 3040,
          montoMeta: 5000,
        },
        {
          id: '3',
          nombre: 'Tramo 3',
          rangoTxt: '$10,001+',
          porcentaje: 8,
          completado: 0,
          estado: 'PENDIENTE',
          montoLogrado: 0,
          montoMeta: 0,
        },
      ]);

      setVentas([
        {
          id: 'v1',
          fecha: '2025-02-15',
          cliente: 'Tech Solutions SAS',
          monto: 3500,
          comisionGenerada: 105,
        },
        {
          id: 'v2',
          fecha: '2025-02-18',
          cliente: 'Inversiones Globales',
          monto: 4540,
          comisionGenerada: 297,
        },
      ]);
    } catch {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { kpis, tramos, ventas, isLoading };
};
