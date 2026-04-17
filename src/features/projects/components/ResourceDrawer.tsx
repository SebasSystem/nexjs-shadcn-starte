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
import { cn } from 'src/lib/utils';
import { toast } from 'sonner';
import { MOCK_CONSULTANTS } from 'src/_mock/_projects';
import type { ProjectResource, ResourceRole } from '../types';

const ROLE_OPTIONS: { value: ResourceRole; label: string }[] = [
  { value: 'manager', label: 'Manager' },
  { value: 'consultant', label: 'Consultor' },
  { value: 'technician', label: 'Técnico' },
  { value: 'support', label: 'Soporte' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAssign: (resource: Omit<ProjectResource, 'id'>) => void;
}

export function ResourceDrawer({ open, onClose, onAssign }: Props) {
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [role, setRole] = useState<ResourceRole>('consultant');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const consultant = MOCK_CONSULTANTS.find((c) => c.name === selectedConsultant);

  const reset = () => {
    setSelectedConsultant('');
    setRole('consultant');
    setStartDate('');
    setEndDate('');
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedConsultant) errs.consultant = 'Seleccioná un recurso';
    if (!startDate) errs.startDate = 'La fecha de inicio es requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAssign = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    onAssign({
      name: selectedConsultant,
      role,
      email: consultant?.email ?? '',
      startDate,
      endDate: endDate || undefined,
    });
    toast.success('Recurso asignado al proyecto');
    setLoading(false);
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col overflow-y-auto">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>Asignar recurso</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label>Persona *</Label>
            <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
              <SelectTrigger className={cn(errors.consultant && 'border-error')}>
                <SelectValue placeholder="Seleccioná un consultor/técnico" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CONSULTANTS.map((c) => (
                  <SelectItem key={c.email} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.consultant && <p className="text-caption text-error">{errors.consultant}</p>}
          </div>

          {consultant && (
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={consultant.email} readOnly className="bg-muted/30 cursor-default" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Rol en el proyecto *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as ResourceRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="res-start">Fecha inicio *</Label>
              <Input
                id="res-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(errors.startDate && 'border-error')}
              />
              {errors.startDate && <p className="text-caption text-error">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-end">Fecha fin</Label>
              <Input
                id="res-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border/60 pt-4 px-4 pb-4">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleAssign} disabled={loading}>
            {loading ? 'Asignando...' : 'Asignar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
