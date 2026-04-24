'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
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
            {/* Tipo de entidad */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de entidad *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['B2B', 'B2C', 'B2G'] as TipoEntidad[]).map((t) => {
                  const labels = { B2B: 'Empresa', B2C: 'Persona', B2G: 'Institución' };
                  const isActive = tipo === t;
                  return (
                    <label
                      key={t}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" {...register('tipo')} value={t} className="sr-only" />
                      <span
                        className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {t}
                      </span>
                      <span
                        className={`text-sm font-medium mt-0.5 ${isActive ? 'text-blue-700' : 'text-gray-700'}`}
                      >
                        {labels[t]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Campos base */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nombre *</label>
              <input
                {...register('nombre')}
                className={`w-full h-10 px-3 border rounded-md text-sm ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={
                  tipo === 'B2B'
                    ? 'Razón social'
                    : tipo === 'B2C'
                      ? 'Nombre completo'
                      : 'Nombre de la institución'
                }
              />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input
                {...register('email')}
                type="email"
                className={`w-full h-10 px-3 border rounded-md text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              {duplicateWarning && !errors.email && (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs">
                  <Icon name="AlertTriangle" size={13} />
                  <span>{duplicateWarning}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  {...register('telefono')}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  placeholder="+57 300 000 0000"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <select
                  {...register('estado')}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="PROSPECTO">Prospecto</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">País *</label>
                <input
                  {...register('pais')}
                  className={`w-full h-10 px-3 border rounded-md text-sm ${errors.pais ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Colombia"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  {...register('ciudad')}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  placeholder="Bogotá"
                />
              </div>
            </div>

            {/* Campos B2B */}
            {tipo === 'B2B' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Datos de Empresa
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">NIT / RUT</label>
                    <input
                      {...register('nit')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      placeholder="900.123.456-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Sector</label>
                    <input
                      {...register('sector')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      placeholder="Tecnología"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Tamaño</label>
                    <select
                      {...register('tamano')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="">Sin especificar</option>
                      <option value="MICRO">Micro (&lt;10)</option>
                      <option value="PEQUENA">Pequeña (10-50)</option>
                      <option value="MEDIANA">Mediana (50-200)</option>
                      <option value="GRANDE">Grande (200+)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Sitio web</label>
                    <input
                      {...register('sitioWeb')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      placeholder="https://empresa.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campos B2C */}
            {tipo === 'B2C' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Datos de Persona
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Cédula / ID</label>
                    <input
                      {...register('cedula')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      placeholder="12.345.678"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Cargo</label>
                    <input
                      {...register('cargo')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      placeholder="Director Comercial"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Empresa vinculada</label>
                  <select
                    {...register('empresaId')}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    <option value="">Sin empresa</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Campos B2G */}
            {tipo === 'B2G' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Datos de Institución
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Tipo de institución</label>
                    <select
                      {...register('tipoInstitucion')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Ministerio">Ministerio</option>
                      <option value="Alcaldía">Alcaldía / Municipio</option>
                      <option value="Gobernación">Gobernación</option>
                      <option value="Universidad Pública">Universidad Pública</option>
                      <option value="Hospital Público">Hospital Público</option>
                      <option value="Empresa Pública">Empresa Pública</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Código de Licitación
                    </label>
                    <input
                      {...register('codigoLicitacion')}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                      placeholder="LIC-2025-001"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="entidadPublica"
                    {...register('entidadPublica')}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <label
                    htmlFor="entidadPublica"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Entidad del sector público
                  </label>
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : contacto ? 'Guardar cambios' : 'Crear contacto'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
