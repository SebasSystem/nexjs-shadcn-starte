'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { contactsService } from 'src/features/contacts/services/contacts.service';
import { useUsers } from 'src/features/automation/hooks/useUsers';
import { localizationService } from 'src/features/settings/services/localization.service';
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
import { useTenantOptions } from 'src/shared/hooks/useTenantOptions';

import { type LostReasonFormData, lostReasonSchema } from '../schemas/lost-reason.schema';
import type { Competitor, LostReason } from '../types';

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

const DEFAULT_VALUES: LostReasonFormData = {
  opportunityName: '',
  clientName: '',
  amount: 0,
  currency: 'USD',
  competitorId: '',
  lostReasonCategory: '',
  lostReasonDetail: '',
  lostDate: new Date().toISOString().split('T')[0],
  salesRepName: '',
};

export function LostReasonDrawer({ open, item, competitors, onClose, onCreate, onUpdate }: Props) {
  const isEdit = !!item;

  const { lostReasonCategories } = useTenantOptions();
  const { userOptions } = useUsers();

  const { data: currencyOptions = [] } = useQuery({
    queryKey: ['settings', 'localization', 'options', 'currencies'],
    queryFn: async () => {
      const res = (await localizationService.getOptions()) as Record<string, unknown>;
      const data = (res?.data ?? res) as { currencies?: Array<{ code: string; name: string }> };
      return (data.currencies ?? []).map((c) => ({
        value: c.code,
        label: `${c.code} - ${c.name}`,
      }));
    },
    staleTime: 0,
  });

  const salesRepOptions = useMemo(
    () => [{ value: '', label: 'Seleccionar vendedor...' }, ...userOptions],
    [userOptions]
  );

  const reasonOptions = useMemo(() => {
    const data = lostReasonCategories.data as
      | { uid: string; name: string; key: string }[]
      | undefined;
    if (!data || data.length === 0) return [{ value: '', label: 'Cargando...' }];
    return data.map((opt) => ({ value: opt.key, label: opt.name }));
  }, [lostReasonCategories.data]);

  const [accountSearch, setAccountSearch] = useState('');
  const { data: accountOptions = [] } = useQuery({
    queryKey: ['accounts', 'search', accountSearch],
    queryFn: async () => {
      const res = await contactsService.accounts.list({ page: 1, per_page: 25, search: accountSearch || undefined });
      return ((res as Record<string, unknown>).data as Array<{ uid: string; name: string }> ?? [])
        .map((a) => ({ value: a.uid, label: a.name }));
    },
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

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
          lostDate: item.lost_at,
          salesRepName: item.sales_rep_name,
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [open, item, reset]);

  const onSubmit = async (data: LostReasonFormData) => {
    const competitor = competitors.find((c) => c.uid === data.competitorId);
    const account = accountOptions.find((a) => a.value === data.clientName);
    const payload: Omit<LostReason, 'uid'> = {
      opportunity_name: data.opportunityName,
      client_name: account?.label ?? data.clientName,
      entity_type: account ? 'account' : undefined,
      entity_uid: account ? account.value : undefined,
      amount: data.amount,
      currency: data.currency,
      competitor_uid: data.competitorId || undefined,
      competitor_name: competitor?.name,
      lost_reason_category: data.lostReasonCategory,
      lost_reason_detail: data.lostReasonDetail,
      lost_at: data.lostDate,
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

            <Controller
              name="clientName"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Cliente"
                  required
                  searchable
                  options={accountOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v as string)}
                  onSearch={setAccountSearch}
                  placeholder="Buscar empresa..."
                  error={errors.clientName?.message}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monto"
                required
                type="text"
                inputMode="decimal"
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
                    options={currencyOptions}
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
                  options={reasonOptions}
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

            <Controller
              name="salesRepName"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Vendedor responsable"
                  required
                  searchable
                  options={salesRepOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v as string)}
                  placeholder="Seleccionar vendedor..."
                  error={errors.salesRepName?.message}
                />
              )}
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
