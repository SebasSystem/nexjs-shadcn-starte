'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
import { FormInput } from 'src/shared/components/ui/form-input';
import { FormSelectField } from 'src/shared/components/ui/form-select-field';
import { Checkbox } from 'src/shared/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from 'src/shared/components/ui/sheet';
import { contactsService } from '../services/contacts.service';
import type { Contacto, ContactoForm, TipoEntidad } from '../types/contacts.types';

const schema = z.object({
  tipo: z.enum(['B2B', 'B2C', 'B2G']),
  nombre: z.string().min(2, 'Requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  pais: z.string().min(1, 'Requerido'),
  ciudad: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'PROSPECTO']),
  // B2B
  nit: z.string().optional(),
  sector: z.string().optional(),
  tamano: z.enum(['MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE']).optional(),
  sitioWeb: z.string().optional(),
  // B2C
  cedula: z.string().optional(),
  cargo: z.string().optional(),
  empresaId: z.string().optional(),
  // B2G
  tipoInstitucion: z.string().optional(),
  entidadPublica: z.boolean().optional(),
  codigoLicitacion: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contacto: Contacto | null;
  empresas: Contacto[];
  onSave: (form: ContactoForm) => Promise<boolean>;
}

const ESTADO_OPTIONS = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'PROSPECTO', label: 'Prospecto' },
  { value: 'INACTIVO', label: 'Inactivo' },
];

const TAMANO_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'MICRO', label: 'Micro (<10)' },
  { value: 'PEQUENA', label: 'Pequeña (10-50)' },
  { value: 'MEDIANA', label: 'Mediana (50-200)' },
  { value: 'GRANDE', label: 'Grande (200+)' },
];

const TIPO_INSTITUCION_OPTIONS = [
  { value: '', label: 'Seleccionar...' },
  { value: 'Ministerio', label: 'Ministerio' },
  { value: 'Alcaldía', label: 'Alcaldía / Municipio' },
  { value: 'Gobernación', label: 'Gobernación' },
  { value: 'Universidad Pública', label: 'Universidad Pública' },
  { value: 'Hospital Público', label: 'Hospital Público' },
  { value: 'Empresa Pública', label: 'Empresa Pública' },
  { value: 'Otro', label: 'Otro' },
];

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  isOpen,
  onClose,
  contacto,
  empresas,
  onSave,
}) => {
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { tipo: 'B2B', estado: 'ACTIVO', entidadPublica: true },
  });

  const tipo = useWatch({ control, name: 'tipo' });
  const email = useWatch({ control, name: 'email' });
  const nit = useWatch({ control, name: 'nit' });

  useEffect(() => {
    if (isOpen) {
      if (contacto) {
        reset({
          tipo: contacto.tipo as TipoEntidad,
          nombre: contacto.nombre,
          email: contacto.email,
          telefono: contacto.telefono ?? '',
          pais: contacto.pais,
          ciudad: contacto.ciudad ?? '',
          estado: contacto.estado,
          nit: contacto.tipo === 'B2B' ? contacto.nit : '',
          sector: contacto.tipo === 'B2B' ? (contacto.sector ?? '') : '',
          tamano: contacto.tipo === 'B2B' ? contacto.tamano : undefined,
          sitioWeb: contacto.tipo === 'B2B' ? (contacto.sitioWeb ?? '') : '',
          cedula: contacto.tipo === 'B2C' ? (contacto.cedula ?? '') : '',
          cargo: contacto.tipo === 'B2C' ? (contacto.cargo ?? '') : '',
          empresaId: contacto.tipo === 'B2C' ? (contacto.empresaId ?? '') : '',
          tipoInstitucion: contacto.tipo === 'B2G' ? (contacto.tipoInstitucion ?? '') : '',
          entidadPublica: contacto.tipo === 'B2G' ? contacto.entidadPublica : true,
          codigoLicitacion: contacto.tipo === 'B2G' ? (contacto.codigoLicitacion ?? '') : '',
        });
      } else {
        reset({ tipo: 'B2B', estado: 'ACTIVO', entidadPublica: true });
      }
    }
  }, [isOpen, contacto, reset]);

  const checkDuplicate = useCallback(async () => {
    if (!email || email.length < 5) return;
    const { emailDuplicate, nitDuplicate } = await contactsService.checkDuplicate(
      email,
      tipo === 'B2B' ? nit : undefined,
      contacto?.id
    );
    if (emailDuplicate) setDuplicateWarning('Ya existe un contacto con este email.');
    else if (nitDuplicate) setDuplicateWarning('Ya existe una empresa con este NIT.');
    else setDuplicateWarning(null);
  }, [email, nit, tipo, contacto?.id]);

  useEffect(() => {
    const t = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(t);
  }, [checkDuplicate]);

  const onSubmit = async (data: FormData) => {
    const success = await onSave(data as ContactoForm);
    if (success) onClose();
  };

  const empresaOptions = [
    { value: '', label: 'Sin empresa' },
    ...empresas.map((e) => ({ value: e.id, label: e.nombre })),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[500px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/30">
          <SheetTitle>{contacto ? 'Editar Contacto' : 'Nuevo Contacto'}</SheetTitle>
          <SheetDescription>
            {contacto
              ? 'Actualiza los datos del contacto'
              : 'Completa el formulario según el tipo de entidad'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <div className="py-6 space-y-5">
            {/* Tipo de entidad — custom radio cards, se mantiene */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Tipo de entidad *</p>
              <div className="grid grid-cols-3 gap-2">
                {(['B2B', 'B2C', 'B2G'] as TipoEntidad[]).map((t) => {
                  const labels = { B2B: 'Empresa', B2C: 'Persona', B2G: 'Institución' };
                  const isActive = tipo === t;
                  return (
                    <label
                      key={t}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'
                      }`}
                    >
                      <input type="radio" {...register('tipo')} value={t} className="sr-only" />
                      <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {t}
                      </span>
                      <span className={`text-sm font-medium mt-0.5 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {labels[t]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <FormInput
              control={control}
              name="nombre"
              label="Nombre"
              required
              placeholder={
                tipo === 'B2B' ? 'Razón social' : tipo === 'B2C' ? 'Nombre completo' : 'Nombre de la institución'
              }
            />

            <div>
              <FormInput
                control={control}
                name="email"
                type="email"
                label="Email"
                required
                placeholder="correo@ejemplo.com"
              />
              {duplicateWarning && !errors.email && (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs mt-1.5">
                  <Icon name="AlertTriangle" size={13} />
                  <span>{duplicateWarning}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput control={control} name="telefono" label="Teléfono" placeholder="+57 300 000 0000" />
              <FormSelectField control={control} name="estado" label="Estado" options={ESTADO_OPTIONS} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput control={control} name="pais" label="País" required placeholder="Colombia" />
              <FormInput control={control} name="ciudad" label="Ciudad" placeholder="Bogotá" />
            </div>

            {/* Campos B2B */}
            {tipo === 'B2B' && (
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Datos de Empresa
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput control={control} name="nit" label="NIT / RUT" placeholder="900.123.456-7" />
                  <FormInput control={control} name="sector" label="Sector" placeholder="Tecnología" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormSelectField control={control} name="tamano" label="Tamaño" options={TAMANO_OPTIONS} />
                  <FormInput control={control} name="sitioWeb" label="Sitio web" placeholder="https://empresa.com" />
                </div>
              </div>
            )}

            {/* Campos B2C */}
            {tipo === 'B2C' && (
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Datos de Persona
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput control={control} name="cedula" label="Cédula / ID" placeholder="12.345.678" />
                  <FormInput control={control} name="cargo" label="Cargo" placeholder="Director Comercial" />
                </div>
                <FormSelectField
                  control={control}
                  name="empresaId"
                  label="Empresa vinculada"
                  options={empresaOptions}
                />
              </div>
            )}

            {/* Campos B2G */}
            {tipo === 'B2G' && (
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Datos de Institución
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormSelectField
                    control={control}
                    name="tipoInstitucion"
                    label="Tipo de institución"
                    options={TIPO_INSTITUCION_OPTIONS}
                  />
                  <FormInput
                    control={control}
                    name="codigoLicitacion"
                    label="Código de Licitación"
                    placeholder="LIC-2025-001"
                  />
                </div>
                <Controller
                  control={control}
                  name="entidadPublica"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="entidadPublica"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="entidadPublica"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Entidad del sector público
                      </label>
                    </div>
                  )}
                />
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
            {isSubmitting ? 'Guardando...' : contacto ? 'Guardar cambios' : 'Crear contacto'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
