'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'src/shared/components/ui/button';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
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

const ZONA_OPTIONS = ZONAS_HORARIAS.map((tz) => ({ value: tz, label: tz }));
const MONEDA_OPTIONS = MONEDAS.map((m) => ({ value: m.code, label: m.label }));

interface LocalizationFormProps {
  config: ConfigLocalizacion;
  isSaving: boolean;
  onSave: (data: Partial<ConfigLocalizacion>) => Promise<boolean>;
}

export function LocalizationForm({ config, isSaving, onSave }: LocalizationFormProps) {
  const {
    control,
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
        <FormSelectField
          control={control}
          name="zonaHoraria"
          label="Zona horaria"
          options={ZONA_OPTIONS}
        />

        <FormSelectField
          control={control}
          name="moneda"
          label="Moneda principal"
          options={MONEDA_OPTIONS}
        />

        <FormSelectField
          control={control}
          name="formatoFecha"
          label="Formato de fecha"
          options={FORMATOS_FECHA}
        />

        <FormSelectField control={control} name="idioma" label="Idioma" options={IDIOMAS} />
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
