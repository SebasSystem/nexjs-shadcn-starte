'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
  Input,
  SelectField,
} from 'src/shared/components/ui';
import { Textarea } from 'src/shared/components/ui';
import { toast } from 'sonner';
import { MOCK_COMPETITORS, LOST_REASON_OPTIONS } from 'src/_mock/_intelligence';
import { lostDealSchema, type LostDealFormData } from '../schemas/lost-deal.schema';
import type { LostDeal } from '../types';

interface Props {
  open: boolean;
  item?: LostDeal | null;
  onClose: () => void;
  onCreate: (data: Omit<LostDeal, 'id'>) => void;
  onUpdate: (id: string, changes: Partial<LostDeal>) => void;
}

const COMPETITOR_OPTIONS = [
  { value: '', label: 'Sin competidor identificado' },
  ...MOCK_COMPETITORS.map((c) => ({ value: c.id, label: c.name })),
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'COP', label: 'COP' },
  { value: 'MXN', label: 'MXN' },
];

const DEFAULT_VALUES: LostDealFormData = {
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

export function LostDealDrawer({ open, item, onClose, onCreate, onUpdate }: Props) {
  const isEdit = !!item;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LostDealFormData>({
    resolver: zodResolver(lostDealSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          opportunityName: item.opportunityName,
          clientName: item.clientName,
          amount: item.amount,
          currency: item.currency,
          competitorId: item.competitorId ?? '',
          lostReasonCategory: item.lostReasonCategory,
          lostReasonDetail: item.lostReasonDetail,
          lostDate: item.lostDate,
          salesRepName: item.salesRepName,
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [open, item, reset]);

  const onSubmit = (data: LostDealFormData) => {
    const competitor = MOCK_COMPETITORS.find((c) => c.id === data.competitorId);
    const payload: Omit<LostDeal, 'id'> = {
      ...data,
      competitorId: data.competitorId || undefined,
      competitorName: competitor?.name,
    };

    if (isEdit && item) {
      onUpdate(item.id, payload);
      toast.success('Deal actualizado');
    } else {
      onCreate(payload);
      toast.success('Pérdida registrada');
    }
    onClose();
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
          <form id="lost-deal-form" onSubmit={handleSubmit(onSubmit)} className="py-6 space-y-5">
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
                  options={COMPETITOR_OPTIONS}
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
            form="lost-deal-form"
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
