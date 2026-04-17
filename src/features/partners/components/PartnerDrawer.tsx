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
import type { Partner, PartnerType, PartnerStatus } from '../types';

const TYPE_OPTIONS: { value: PartnerType; label: string }[] = [
  { value: 'distributor', label: 'Distribuidor' },
  { value: 'reseller', label: 'Reseller' },
  { value: 'ally', label: 'Aliado' },
];

const STATUS_OPTIONS: { value: PartnerStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'prospect', label: 'Prospecto' },
];

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  partner?: Partner | null;
  onClose: () => void;
  onCreate: (data: Omit<Partner, 'id' | 'registeredOpportunities' | 'convertedDeals'>) => void;
  onUpdate: (id: string, changes: Partial<Partner>) => void;
}

interface FormProps {
  partner?: Partner | null;
  isEdit: boolean;
  onClose: () => void;
  onCreate: (data: Omit<Partner, 'id' | 'registeredOpportunities' | 'convertedDeals'>) => void;
  onUpdate: (id: string, changes: Partial<Partner>) => void;
}

function PartnerForm({ partner, isEdit, onClose, onCreate, onUpdate }: FormProps) {
  const init = isEdit && partner;
  const [name, setName] = useState(init ? partner.name : '');
  const [type, setType] = useState<PartnerType>(init ? partner.type : 'distributor');
  const [status, setStatus] = useState<PartnerStatus>(init ? partner.status : 'active');
  const [region, setRegion] = useState(init ? partner.region : '');
  const [contactName, setContactName] = useState(init ? partner.contactName : '');
  const [contactEmail, setContactEmail] = useState(init ? partner.contactEmail : '');
  const [phone, setPhone] = useState(init ? (partner.phone ?? '') : '');
  const [notes, setNotes] = useState(init ? (partner.notes ?? '') : '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (!region.trim()) errs.region = 'La región es requerida';
    if (!contactName.trim()) errs.contactName = 'El nombre de contacto es requerido';
    if (!contactEmail.trim()) errs.contactEmail = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
      errs.contactEmail = 'Formato de email inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const data = {
      name,
      type,
      status,
      region,
      contactName,
      contactEmail,
      phone: phone || undefined,
      notes: notes || undefined,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    if (isEdit && partner) {
      onUpdate(partner.id, data);
      toast.success('Partner actualizado');
    } else {
      onCreate(data);
      toast.success('Partner creado');
    }

    setLoading(false);
    onClose();
  };

  return (
    <>
      <SheetHeader className="border-b border-border/60 pb-4">
        <SheetTitle>{isEdit ? 'Editar partner' : 'Nuevo partner'}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="pt-name">Nombre *</Label>
          <Input
            id="pt-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: TechDistrib Latam"
            className={cn(errors.name && 'border-error')}
          />
          {errors.name && <p className="text-caption text-error">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Select value={type} onValueChange={(v) => setType(v as PartnerType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado *</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PartnerStatus)}>
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-region">Región *</Label>
          <Input
            id="pt-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Ej: Bogotá, Colombia"
            className={cn(errors.region && 'border-error')}
          />
          {errors.region && <p className="text-caption text-error">{errors.region}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-contact-name">Nombre del contacto *</Label>
          <Input
            id="pt-contact-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nombre y apellido"
            className={cn(errors.contactName && 'border-error')}
          />
          {errors.contactName && <p className="text-caption text-error">{errors.contactName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-email">Email del contacto *</Label>
          <Input
            id="pt-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contacto@partner.com"
            className={cn(errors.contactEmail && 'border-error')}
          />
          {errors.contactEmail && <p className="text-caption text-error">{errors.contactEmail}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-phone">Teléfono</Label>
          <Input
            id="pt-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+57 310 555 0000"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-notes">Notas</Label>
          <Textarea
            id="pt-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional sobre el partner..."
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

export function PartnerDrawer({ open, mode, partner, onClose, onCreate, onUpdate }: Props) {
  const isEdit = mode === 'edit';
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <PartnerForm
          key={`${open}-${partner?.id ?? 'new'}`}
          partner={partner}
          isEdit={isEdit}
          onClose={onClose}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      </SheetContent>
    </Sheet>
  );
}
