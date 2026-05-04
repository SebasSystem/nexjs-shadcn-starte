'use client';

import { useEffect, useState } from 'react';

import { localizationService } from '../services/localization.service';
import type { ConfigLocalizacion } from '../types/settings.types';

export function useLocalization() {
  const [config, setConfig] = useState<ConfigLocalizacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localizationService.get().then((data) => {
      setConfig(data);
      setIsLoading(false);
    });
  }, []);

  const saveConfig = async (data: Partial<ConfigLocalizacion>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await localizationService.update(data);
      setConfig(updated);
      return true;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { config, isLoading, isSaving, saveConfig };
}
