'use client';

import { useCallback, useEffect, useState } from 'react';

import { customFieldsService } from '../services/custom-fields.service';
import type { CampoPersonalizado } from '../types/settings.types';

export function useCustomFields() {
  const [campos, setCampos] = useState<CampoPersonalizado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await customFieldsService.getAll();
      setCampos(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampos();
  }, [fetchCampos]);

  const createCampo = async (
    data: Omit<CampoPersonalizado, 'id' | 'creadoEn'>
  ): Promise<boolean> => {
    try {
      const newCampo = await customFieldsService.create(data);
      setCampos((prev) => [...prev, newCampo]);
      return true;
    } catch {
      return false;
    }
  };

  const updateCampo = async (id: string, data: Partial<CampoPersonalizado>): Promise<boolean> => {
    try {
      const updated = await customFieldsService.update(id, data);
      setCampos((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return true;
    } catch {
      return false;
    }
  };

  const deleteCampo = async (id: string): Promise<void> => {
    await customFieldsService.delete(id);
    setCampos((prev) => prev.filter((c) => c.id !== id));
  };

  return { campos, isLoading, createCampo, updateCampo, deleteCampo };
}
