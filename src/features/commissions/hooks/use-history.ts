import { useState, useCallback, useEffect } from 'react';
import type { RegistroComision } from '../types/commissions.types';
import { toast } from 'sonner';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_REGISTROS: RegistroComision[] = [
  {
    id: 'reg-1',
    vendedorId: 'vend-1',
    vendedorNombre: 'Carlos Martínez',
    equipoId: 'eq-1',
    periodo: 'Febrero 2025',
    ventasPeriodo: 8040,
    planAplicado: 'Plan Élite 2025',
    comisionCalculada: 402,
    estado: 'PENDIENTE',
  },
  {
    id: 'reg-2',
    vendedorId: 'vend-2',
    vendedorNombre: 'Ana Gómez',
    equipoId: 'eq-2',
    periodo: 'Febrero 2025',
    ventasPeriodo: 12500,
    planAplicado: 'Plan Intro',
    comisionCalculada: 450,
    estado: 'APROBADO',
  },
  {
    id: 'reg-3',
    vendedorId: 'vend-1',
    vendedorNombre: 'Carlos Martínez',
    equipoId: 'eq-1',
    periodo: 'Enero 2025',
    ventasPeriodo: 9200,
    planAplicado: 'Plan Élite 2025',
    comisionCalculada: 460,
    estado: 'PAGADO',
  },
];

export const useHistory = () => {
  const [registros, setRegistros] = useState<RegistroComision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistros = useCallback(async () => {
    setIsLoading(true);
    try {
      await delay(700);
      setRegistros([...MOCK_REGISTROS]);
    } catch {
      toast.error('Error al cargar historial');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  const cambiarEstado = async (ids: string[], nuevoEstado: 'APROBADO' | 'PAGADO') => {
    setIsLoading(true);
    try {
      await delay(600);
      setRegistros((prev) =>
        prev.map((r) => (ids.includes(r.id) ? { ...r, estado: nuevoEstado } : r))
      );
      toast.success(`${ids.length} registro(s) marcado(s) como ${nuevoEstado}`);
    } catch {
      toast.error('Error al cambiar de estado');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registros,
    isLoading,
    fetchRegistros,
    cambiarEstado,
  };
};
