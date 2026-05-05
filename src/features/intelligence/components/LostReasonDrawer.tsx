'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Button,
  Input,
  SelectField,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui';
import { Textarea } from 'src/shared/components/ui';

import { type LostReasonFormData, lostReasonSchema } from '../schemas/lost-reason.schema';
import type { Competitor, LostReason } from '../types';
import { LOST_REASON_OPTIONS } from '../types';

interface Props {
  open: boolean;
  item?: LostReason | null;
  competitors: Competitor[];
  onClose: () => void;
  onCreate: (data: Omit<LostReason, 'uid'>) => Promise<boolean>;
  onUpdate: (uid: string, changes: Partial<Omit<LostReason, 'uid'>>) => Promise<boolean>;
}

const COMPETITOR_OPTIONS_FROM = (competitors: Competitor[]) => [
  { value: '', label: 'Sin competidor identificado' },
  ...competitors.map((c) => ({ value: c.uid, label: c.name })),
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'COP', label: 'COP' },
  { value: 'MXN', label: 'MXN' },
];

const DEFAULT_VALUES: LostReasonFormData = {
  opportunityName: '',
  clientName: '',
  amount: 0,
  currency: 'USD',
  competitorId: '',
  lostReasonCategory: 'price',
  lostReasonDetail: '',
  lostDate: '',
  salesRepName: '',
};

export function LostReasonDrawer({ open, item, competitors, onClose, onCreate, onUpdate }: Props) {
  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LostReasonFormData>({
    resolver: zodResolver(lostReasonSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          opportunityName: item.opportunity_name,
          clientName: item.client_name,
          amount: item.amount,
          currency: item.currency,
          competitorId: item.competitor_uid ?? '',
          lostReasonCategory: item.lost_reason_category,
          lostReasonDetail: item.lost_reason_detail,
          lostDate: item.lost_date,
          salesRepName: item.sales_rep_name,
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [open, item, reset]);

  const onSubmit = async (data: LostReasonFormData) => {
    const competitor = competitors.find((c) => c.uid === data.competitorId);
    const payload: Omit<LostReason, 'uid'> = {
      opportunity_name: data.opportunityName,
      client_name: data.clientName,
      amount: data.amount,
      currency: data.currency,
      competitor_uid: data.competitorId || undefined,
      competitor_name: competitor?.name,
      lost_reason_category: data.lostReasonCategory,
      lost_reason_detail: data.lostReasonDetail,
      lost_date: data.lostDate,
      sales_rep_name: data.salesRepName,
    };

    let success: boolean;
    if (isEdit && item) {
      success = await onUpdate(item.uid, payload);
      if (success) toast.success('Deal actualizado');
    } else {
      success = await onCreate(payload);
      if (success) toast.success('Pérdida registrada');
    }
    if (success) onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-[440px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <SheetTitle>{isEdit ? 'Editar pérdida' : 'Registrar deal perdido'}</SheetTitle>
          <SheetDescription>
            Documentá los detalles del deal para enriquecer el análisis competitivo.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <form id="lost-reason-form" onSubmit={handleSubmit(onSubmit)} className="py-6 space-y-5">
            <Input
              label="Nombre del deal"
              required
              {...register('opportunityName')}
              placeholder="Ej: Distribuidora Andina ERP"
              error={errors.opportunityName?.message}
            />

            <Input
              label="Cliente"
              required
              {...register('clientName')}
              placeholder="Nombre de la empresa o persona"
              error={errors.clientName?.message}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monto"
                required
                type="number"
                min={0}
                {...register('amount', { valueAsNumber: true })}
                placeholder="0"
                error={errors.amount?.message}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Moneda"
                    options={CURRENCY_OPTIONS}
                    value={field.value}
                    onChange={(v) => field.onChange(v as string)}
                  />
                )}
              />
            </div>

            <Controller
              name="competitorId"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Competidor que ganó"
                  options={COMPETITOR_OPTIONS_FROM(competitors)}
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v as string)}
                  searchable
                  clearable
                  placeholder="Sin competidor identificado"
                />
              )}
            />

            <Controller
              name="lostReasonCategory"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Razón principal *"
                  required
                  options={LOST_REASON_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(v as string)}
                  error={errors.lostReasonCategory?.message}
                />
              )}
            />

            <Textarea
              label="Detalle"
              required
              {...register('lostReasonDetail')}
              placeholder="Contá qué pasó con el mayor detalle posible. Esto ayuda al equipo a aprender."
              rows={4}
              error={errors.lostReasonDetail?.message}
            />

            <Input
              label="Fecha de pérdida"
              required
              type="date"
              {...register('lostDate')}
              error={errors.lostDate?.message}
            />

            <Input
              label="Vendedor responsable"
              required
              {...register('salesRepName')}
              placeholder="Nombre del rep"
              error={errors.salesRepName?.message}
            />
          </form>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="lost-reason-form"
            color="primary"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isEdit ? 'Guardar cambios' : 'Registrar pérdida'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
