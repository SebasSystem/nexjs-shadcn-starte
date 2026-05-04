import { useState } from 'react';

import type { Segment, SegmentForm } from '../types/segments.types';

const MOCK_SEGMENTS: Segment[] = [
  {
    id: 'seg-1',
    nombre: 'B2B Activos',
    descripcion: 'Empresas B2B con estado ACTIVO creadas en el último año.',
    logica: 'AND',
    reglas: [
      { id: 'r1', field: 'tipo', operator: 'equals', value: 'B2B' },
      { id: 'r2', field: 'estado', operator: 'equals', value: 'ACTIVO' },
    ],
    totalContactos: 145,
    creadoEn: new Date(Date.now() - 86400000 * 10).toISOString(),
    ultimaActualizacion: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'seg-2',
    nombre: 'Clientes VIP o en Riesgo',
    descripcion: 'Clientes etiquetados como VIP o que estén en Lista Negra.',
    logica: 'OR',
    reglas: [
      { id: 'r3', field: 'etiqueta', operator: 'contains', value: 'VIP' },
      { id: 'r4', field: 'etiqueta', operator: 'contains', value: 'Lista Negra' },
    ],
    totalContactos: 32,
    creadoEn: new Date(Date.now() - 86400000 * 5).toISOString(),
    ultimaActualizacion: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const useSegments = () => {
  const [segments, setSegments] = useState<Segment[]>(MOCK_SEGMENTS);
  const [isLoading, setIsLoading] = useState(false);

  const createSegment = async (form: SegmentForm): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulando red

    // Métrica mock calculada en base a filtros (aleatoria para el demo)
    const randomTotal = Math.floor(Math.random() * 500) + 10;

    const newSegment: Segment = {
      ...form,
      id: Math.random().toString(36).substr(2, 9),
      totalContactos: randomTotal,
      creadoEn: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString(),
    };

    setSegments((prev) => [newSegment, ...prev]);
    setIsLoading(false);
    return true;
  };

  const updateSegment = async (id: string, form: Partial<SegmentForm>): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulando red
    setSegments((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...form, ultimaActualizacion: new Date().toISOString() } : s
      )
    );
    setIsLoading(false);
    return true;
  };

  const deleteSegment = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulando red
    setSegments((prev) => prev.filter((s) => s.id !== id));
    setIsLoading(false);
    return true;
  };

  return {
    segments,
    isLoading,
    createSegment,
    updateSegment,
    deleteSegment,
  };
};
