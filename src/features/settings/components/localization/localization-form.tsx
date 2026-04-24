'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import type { ConfigLocalizacion } from '../../types/settings.types';

const ZONAS_HORARIAS = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Lima',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/Caracas',
  'America/Guayaquil',
  'America/Montevideo',
  'America/Panama',
  'America/New_York',
  'Europe/Madrid',
  'UTC',
];

const MONEDAS = [
  { code: 'COP', label: 'Peso colombiano (COP)', symbol: '$' },
  { code: 'MXN', label: 'Peso mexicano (MXN)', symbol: '$' },
  { code: 'PEN', label: 'Sol peruano (PEN)', symbol: 'S/' },
  { code: 'CLP', label: 'Peso chileno (CLP)', symbol: '$' },
  { code: 'ARS', label: 'Peso argentino (ARS)', symbol: '$' },
  { code: 'USD', label: 'Dólar estadounidense (USD)', symbol: '$' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
];

const FORMATOS_FECHA = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA (31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA (12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD (2025-12-31)' },
];

const IDIOMAS = [
  { value: 'es-CO', label: 'Español (Colombia)' },
  { value: 'es-MX', label: 'Español (México)' },
  { value: 'es-PE', label: 'Español (Perú)' },
  { value: 'es-AR', label: 'Español (Argentina)' },
  { value: 'en-US', label: 'English (US)' },
];

interface LocalizationFormProps {
  config: ConfigLocalizacion;
  isSaving: boolean;
  onSave: (data: Partial<ConfigLocalizacion>) => Promise<boolean>;
}

export function LocalizationForm({ config, isSaving, onSave }: LocalizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ConfigLocalizacion>({
    defaultValues: config,
  });

  const [saved, setSaved] = React.useState(false);

  const onSubmit = async (data: ConfigLocalizacion) => {
    const monedaInfo = MONEDAS.find((m) => m.code === data.moneda);
    const success = await onSave({ ...data, simboloMoneda: monedaInfo?.symbol ?? '$' });
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Icon name="Clock" size={15} className="text-muted-foreground" />
            Zona horaria
          </label>
          <select
            {...register('zonaHoraria')}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
          >
            {ZONAS_HORARIAS.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Icon name="DollarSign" size={15} className="text-muted-foreground" />
            Moneda principal
          </label>
          <select
            {...register('moneda')}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
          >
            {MONEDAS.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Icon name="Calendar" size={15} className="text-muted-foreground" />
            Formato de fecha
          </label>
          <select
            {...register('formatoFecha')}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
          >
            {FORMATOS_FECHA.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Icon name="Languages" size={15} className="text-muted-foreground" />
            Idioma
          </label>
          <select
            {...register('idioma')}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
          >
            {IDIOMAS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={!isDirty || isSaving}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
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
