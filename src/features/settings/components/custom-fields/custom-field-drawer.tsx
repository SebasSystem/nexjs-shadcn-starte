'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { useWatch } from 'react-hook-form';
import type { CampoPersonalizado, TipoCampo, ModuloCampo } from '../../types/settings.types';

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

export const CustomFieldDrawer: React.FC<CustomFieldDrawerProps> = ({
  isOpen,
  onClose,
  campo,
  onSave,
}) => {
  const [opciones, setOpciones] = useState<string[]>(campo?.opciones ?? []);
  const [nuevaOpcion, setNuevaOpcion] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid, isSubmitting },
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
        .replace(/[\u0300-\u036f]/g, '')
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[440px] bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold">
              {campo ? 'Editar Campo' : 'Nuevo Campo Personalizado'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Define el campo que se mostrará en el módulo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Etiqueta (visible al usuario) *
            </label>
            <input
              {...register('etiqueta')}
              className={`w-full h-10 px-3 border rounded-md text-sm ${errors.etiqueta ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ej. Código de Licitación"
            />
            {errors.etiqueta && <p className="text-xs text-red-500">{errors.etiqueta.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Nombre técnico *{' '}
              <span className="text-xs font-normal text-gray-400">(solo minúsculas y _)</span>
            </label>
            <input
              {...register('nombre')}
              className={`w-full h-10 px-3 border rounded-md text-sm font-mono ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="codigo_licitacion"
            />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tipo de dato *</label>
              <select
                {...register('tipo')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="texto">Texto</option>
                <option value="numero">Número</option>
                <option value="fecha">Fecha</option>
                <option value="select">Lista de opciones</option>
                <option value="booleano">Sí / No</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Módulo *</label>
              <select
                {...register('modulo')}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="contactos">Contactos</option>
                <option value="empresas">Empresas</option>
                <option value="oportunidades">Oportunidades</option>
                <option value="productos">Productos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requerido"
              {...register('requerido')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="requerido" className="text-sm font-medium text-gray-700 cursor-pointer">
              Campo requerido
            </label>
          </div>

          {tipoWatched === 'select' && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">Opciones de la lista</h4>
              {opciones.length > 0 ? (
                <div className="space-y-1.5">
                  {opciones.map((op) => (
                    <div
                      key={op}
                      className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded border border-gray-200 text-sm"
                    >
                      <span>{op}</span>
                      <button
                        type="button"
                        onClick={() => setOpciones((prev) => prev.filter((o) => o !== op))}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Sin opciones todavía.</p>
              )}
              <div className="flex gap-2">
                <input
                  value={nuevaOpcion}
                  onChange={(e) => setNuevaOpcion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOpcion())}
                  placeholder="Ej. VIP"
                  className="flex-1 h-8 px-3 border border-gray-300 rounded text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addOpcion}
                  className="h-8 gap-1"
                >
                  <Plus size={13} /> Agregar
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="border-t p-4 shrink-0 flex justify-end gap-3 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Campo'}
          </Button>
        </div>
      </div>
    </>
  );
};
