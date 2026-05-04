'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from 'src/shared/components/ui/button';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { z } from 'zod';

import type { CampoPersonalizado, ModuloCampo, TipoCampo } from '../../types/settings.types';

const schema = z.object({
  etiqueta: z.string().min(2, 'Requerido'),
  nombre: z
    .string()
    .min(2, 'Requerido')
    .regex(/^[a-z_]+$/, 'Solo minúsculas y guiones bajos'),
  tipo: z.enum(['texto', 'numero', 'fecha', 'select', 'booleano']),
  modulo: z.enum(['contactos', 'empresas', 'oportunidades', 'productos']),
  requerido: z.boolean(),
});

type CampoForm = z.infer<typeof schema>;

interface CustomFieldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campo: CampoPersonalizado | null;
  onSave: (data: Omit<CampoPersonalizado, 'id' | 'creadoEn'>) => Promise<boolean>;
}

const TIPO_OPTIONS = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'select', label: 'Lista de opciones' },
  { value: 'booleano', label: 'Sí / No' },
];

const MODULO_OPTIONS = [
  { value: 'contactos', label: 'Contactos' },
  { value: 'empresas', label: 'Empresas' },
  { value: 'oportunidades', label: 'Oportunidades' },
  { value: 'productos', label: 'Productos' },
];

export const CustomFieldDrawer: React.FC<CustomFieldDrawerProps> = ({
  isOpen,
  onClose,
  campo,
  onSave,
}) => {
  const [opciones, setOpciones] = useState<string[]>(campo?.opciones ?? []);
  const [nuevaOpcion, setNuevaOpcion] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, isSubmitting },
  } = useForm<CampoForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { tipo: 'texto', modulo: 'contactos', requerido: false },
  });

  const tipoWatched = useWatch({ control, name: 'tipo' });
  const etiquetaWatched = useWatch({ control, name: 'etiqueta' });

  useEffect(() => {
    if (etiquetaWatched && !campo) {
      const slug = etiquetaWatched
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z_]/g, '');
      setValue('nombre', slug, { shouldValidate: true });
    }
  }, [etiquetaWatched, campo, setValue]);

  useEffect(() => {
    if (isOpen) {
      if (campo) {
        reset({
          etiqueta: campo.etiqueta,
          nombre: campo.nombre,
          tipo: campo.tipo,
          modulo: campo.modulo,
          requerido: campo.requerido,
        });
      } else {
        reset({ etiqueta: '', nombre: '', tipo: 'texto', modulo: 'contactos', requerido: false });
      }
    }
  }, [isOpen, campo, reset]);

  const onSubmit = async (data: CampoForm) => {
    const success = await onSave({
      ...data,
      tipo: data.tipo as TipoCampo,
      modulo: data.modulo as ModuloCampo,
      opciones: data.tipo === 'select' ? opciones : undefined,
    });
    if (success) onClose();
  };

  const addOpcion = () => {
    if (nuevaOpcion.trim() && !opciones.includes(nuevaOpcion.trim())) {
      setOpciones((prev) => [...prev, nuevaOpcion.trim()]);
      setNuevaOpcion('');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[440px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{campo ? 'Editar Campo' : 'Nuevo Campo Personalizado'}</SheetTitle>
          <SheetDescription>Define el campo que se mostrará en el módulo</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-5">
            <FormInput
              control={control}
              name="etiqueta"
              label="Etiqueta (visible al usuario)"
              required
              placeholder="Ej. Código de Licitación"
            />

            <FormInput
              control={control}
              name="nombre"
              label="Nombre técnico"
              required
              hint="Solo minúsculas y guiones bajos"
              placeholder="codigo_licitacion"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelectField
                control={control}
                name="tipo"
                label="Tipo de dato"
                required
                options={TIPO_OPTIONS}
              />
              <FormSelectField
                control={control}
                name="modulo"
                label="Módulo"
                required
                options={MODULO_OPTIONS}
              />
            </div>

            <Controller
              control={control}
              name="requerido"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Checkbox id="requerido" checked={field.value} onCheckedChange={field.onChange} />
                  <label htmlFor="requerido" className="text-sm font-medium cursor-pointer">
                    Campo requerido
                  </label>
                </div>
              )}
            />

            {tipoWatched === 'select' && (
              <div className="space-y-3 bg-muted/40 p-4 rounded-lg border border-border/40">
                <h4 className="text-sm font-semibold text-foreground">Opciones de la lista</h4>
                {opciones.length > 0 ? (
                  <div className="space-y-1.5">
                    {opciones.map((op) => (
                      <div
                        key={op}
                        className="flex items-center justify-between gap-2 bg-background px-3 py-2 rounded border border-border/40 text-sm"
                      >
                        <span>{op}</span>
                        <button
                          type="button"
                          onClick={() => setOpciones((prev) => prev.filter((o) => o !== op))}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sin opciones todavía.</p>
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={nuevaOpcion}
                      onChange={(e) => setNuevaOpcion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOpcion())}
                      placeholder="Ej. VIP"
                      size="sm"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addOpcion}
                    className="h-8 gap-1"
                  >
                    <Icon name="Plus" size={13} /> Agregar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Campo'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
