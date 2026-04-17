'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui';
import { Textarea } from 'src/shared/components/ui';
import { cn } from 'src/lib/utils';
import { toast } from 'sonner';
import { MOCK_INTERNAL_USERS } from 'src/_mock/_partners';
import type { Partner, PartnerOpportunity, PartnerOpportunityStatus } from '../types';

const STATUS_OPTIONS: { value: PartnerOpportunityStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'rejected', label: 'Rechazada' },
  { value: 'converted', label: 'Convertida' },
  { value: 'lost', label: 'Perdida' },
];

const CURRENCY_OPTIONS = ['USD', 'COP', 'MXN'] as const;

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  opportunity?: PartnerOpportunity | null;
  partners: Partner[];
  onClose: () => void;
  onCreate: (data: Omit<PartnerOpportunity, 'id'>) => void;
  onUpdate: (id: string, changes: Partial<PartnerOpportunity>) => void;
}

interface FormProps {
  opportunity?: PartnerOpportunity | null;
  partners: Partner[];
  isEdit: boolean;
  onClose: () => void;
  onCreate: (data: Omit<PartnerOpportunity, 'id'>) => void;
  onUpdate: (id: string, changes: Partial<PartnerOpportunity>) => void;
}

function OpportunityForm({
  opportunity,
  partners,
  isEdit,
  onClose,
  onCreate,
  onUpdate,
}: FormProps) {
  const init = isEdit && opportunity;
  const [partnerId, setPartnerId] = useState(init ? opportunity.partnerId : '');
  const [clientName, setClientName] = useState(init ? opportunity.clientName : '');
  const [clientEmail, setClientEmail] = useState(init ? (opportunity.clientEmail ?? '') : '');
  const [product, setProduct] = useState(init ? opportunity.product : '');
  const [estimatedValue, setEstimatedValue] = useState(
    init ? String(opportunity.estimatedValue) : ''
  );
  const [currency, setCurrency] = useState<'USD' | 'COP' | 'MXN'>(
    init ? opportunity.currency : 'USD'
  );
  const [status, setStatus] = useState<PartnerOpportunityStatus>(
    init ? opportunity.status : 'pending'
  );
  const [assignedToInternal, setAssignedToInternal] = useState(
    init ? (opportunity.assignedToInternal ?? 'unassigned') : 'unassigned'
  );
  const [notes, setNotes] = useState(init ? (opportunity.notes ?? '') : '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!partnerId) errs.partnerId = 'Seleccioná un partner';
    if (!clientName.trim()) errs.clientName = 'El nombre del cliente es requerido';
    if (!product.trim()) errs.product = 'El producto/servicio es requerido';
    if (!estimatedValue || Number(estimatedValue) <= 0)
      errs.estimatedValue = 'Ingresá un valor mayor a 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const selectedPartner = partners.find((p) => p.id === partnerId);

    const data: Omit<PartnerOpportunity, 'id'> = {
      partnerId,
      partnerName: selectedPartner?.name ?? '',
      clientName,
      clientEmail: clientEmail || undefined,
      product,
      estimatedValue: Number(estimatedValue),
      currency,
      status,
      registeredDate: new Date().toISOString().split('T')[0],
      assignedToInternal: assignedToInternal === 'unassigned' ? undefined : assignedToInternal,
      notes: notes || undefined,
    };

    if (isEdit && opportunity) {
      onUpdate(opportunity.id, data);
      toast.success('Oportunidad actualizada');
    } else {
      onCreate(data);
      toast.success('Oportunidad registrada');
    }

    setLoading(false);
    onClose();
  };

  const activePartners = partners.filter((p) => p.status === 'active');

  return (
    <>
      <SheetHeader className="border-b border-border/60 pb-4">
        <SheetTitle>{isEdit ? 'Editar oportunidad' : 'Registrar oportunidad'}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        <div className="space-y-1.5">
          <Label>Partner *</Label>
          <Select value={partnerId} onValueChange={setPartnerId}>
            <SelectTrigger className={cn(errors.partnerId && 'border-error')}>
              <SelectValue placeholder="Seleccioná un partner" />
            </SelectTrigger>
            <SelectContent>
              {activePartners.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.partnerId && <p className="text-caption text-error">{errors.partnerId}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opp-client">Nombre del cliente *</Label>
          <Input
            id="opp-client"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Empresa o persona"
            className={cn(errors.clientName && 'border-error')}
          />
          {errors.clientName && <p className="text-caption text-error">{errors.clientName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opp-client-email">Email del cliente</Label>
          <Input
            id="opp-client-email"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="contacto@cliente.com (opcional)"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opp-product">Producto / Servicio de interés *</Label>
          <Input
            id="opp-product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Ej: Módulo CRM completo + inventario"
            className={cn(errors.product && 'border-error')}
          />
          {errors.product && <p className="text-caption text-error">{errors.product}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="opp-value">Valor estimado *</Label>
            <Input
              id="opp-value"
              type="number"
              min={0}
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0"
              className={cn(errors.estimatedValue && 'border-error')}
            />
            {errors.estimatedValue && (
              <p className="text-caption text-error">{errors.estimatedValue}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as typeof currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as PartnerOpportunityStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Vendedor interno asignado</Label>
          <Select value={assignedToInternal} onValueChange={setAssignedToInternal}>
            <SelectTrigger>
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {MOCK_INTERNAL_USERS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opp-notes">Notas</Label>
          <Textarea
            id="opp-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contexto adicional de la oportunidad..."
            rows={3}
          />
        </div>
      </div>

      <SheetFooter className="border-t border-border/60 pt-4 px-4 pb-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </SheetFooter>
    </>
  );
}

export function PartnerOpportunityDrawer({
  open,
  mode,
  opportunity,
  partners,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = mode === 'edit';
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <OpportunityForm
          key={`${open}-${opportunity?.id ?? 'new'}`}
          opportunity={opportunity}
          partners={partners}
          isEdit={isEdit}
          onClose={onClose}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      </SheetContent>
    </Sheet>
  );
}
