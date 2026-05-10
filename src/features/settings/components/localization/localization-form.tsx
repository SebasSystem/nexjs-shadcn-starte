'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { Button } from 'src/shared/components/ui/button';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import { Icon } from 'src/shared/components/ui/icon';

import type { LocalizationConfig } from '../../types/settings.types';

interface LocalizationOptions {
  timezones: string[];
  currencies: { code: string; label: string; symbol: string }[];
  date_formats: string[];
  locales: { value: string; label: string }[];
}

interface LocalizationFormProps {
  config: LocalizationConfig;
  isSaving: boolean;
  onSave: (data: Partial<LocalizationConfig>) => Promise<boolean>;
}

export function LocalizationForm({ config, isSaving, onSave }: LocalizationFormProps) {
  const { data: opts } = useQuery<LocalizationOptions>({
    queryKey: ['localization-options'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.settings.localization.options);
      return (res.data?.data ?? res.data) as LocalizationOptions;
    },
    staleTime: 10 * 60 * 1000,
  });

  const zonaOptions = (opts?.timezones ?? []).map((tz) => ({ value: tz, label: tz }));
  const monedaOptions = (opts?.currencies ?? []).map((m) => ({ value: m.code, label: m.label }));
  const fechaOptions = (opts?.date_formats ?? []).map((f) => ({ value: f, label: f }));
  const idiomaOptions = opts?.locales ?? [];

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<LocalizationConfig>({
    defaultValues: config,
  });

  const [saved, setSaved] = React.useState(false);

  const onSubmit = async (data: LocalizationConfig) => {
    const monedaInfo = opts?.currencies.find((m) => m.code === data.currency);
    const success = await onSave({ ...data, currency_symbol: monedaInfo?.symbol ?? '$' });
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormSelectField
          control={control}
          name="timezone"
          label="Zona horaria"
          options={zonaOptions}
        />

        <FormSelectField
          control={control}
          name="currency"
          label="Moneda principal"
          options={monedaOptions}
        />

        <FormSelectField
          control={control}
          name="date_format"
          label="Formato de fecha"
          options={fechaOptions}
        />

        <FormSelectField control={control} name="locale" label="Idioma" options={idiomaOptions} />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={!isDirty || isSaving}
          className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer"
        >
          <Icon name="Globe" size={15} />
          {isSaving ? 'Guardando...' : 'Guardar configuración'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <Icon name="CheckCircle2" size={15} />
            Guardado correctamente
          </span>
        )}
      </div>
    </form>
  );
}
