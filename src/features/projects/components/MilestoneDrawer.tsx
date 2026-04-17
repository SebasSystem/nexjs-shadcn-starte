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
import type { Milestone, MilestoneStatus } from '../types';

const STATUS_OPTIONS: { value: MilestoneStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'delayed', label: 'Vencido' },
];

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  milestone?: Milestone | null;
  onClose: () => void;
  onSave: (data: Omit<Milestone, 'id'>) => void;
}

interface FormProps {
  milestone?: Milestone | null;
  isEdit: boolean;
  onClose: () => void;
  onSave: (data: Omit<Milestone, 'id'>) => void;
}

function MilestoneForm({ milestone, isEdit, onClose, onSave }: FormProps) {
  const init = isEdit && milestone;
  const [name, setName] = useState(init ? milestone.name : '');
  const [description, setDescription] = useState(init ? (milestone.description ?? '') : '');
  const [assignedTo, setAssignedTo] = useState(init ? milestone.assignedTo : '');
  const [dueDate, setDueDate] = useState(init ? milestone.dueDate : '');
  const [status, setStatus] = useState<MilestoneStatus>(init ? milestone.status : 'pending');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (!assignedTo.trim()) errs.assignedTo = 'El responsable es requerido';
    if (!dueDate) errs.dueDate = 'La fecha límite es requerida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    onSave({ name, description, assignedTo, dueDate, status });
    toast.success(isEdit ? 'Hito actualizado' : 'Hito agregado');
    setLoading(false);
    onClose();
  };

  return (
    <>
      <SheetHeader className="border-b border-border/60 pb-4">
        <SheetTitle>{isEdit ? 'Editar hito' : 'Nuevo hito'}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="ms-name">Nombre del hito *</Label>
          <Input
            id="ms-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Kick-off con el cliente"
            className={cn(errors.name && 'border-error')}
          />
          {errors.name && <p className="text-caption text-error">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ms-desc">Descripción</Label>
          <Textarea
            id="ms-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles del hito (opcional)..."
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ms-assigned">Responsable *</Label>
          <Input
            id="ms-assigned"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Nombre del responsable"
            className={cn(errors.assignedTo && 'border-error')}
          />
          {errors.assignedTo && <p className="text-caption text-error">{errors.assignedTo}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ms-due">Fecha límite *</Label>
          <Input
            id="ms-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={cn(errors.dueDate && 'border-error')}
          />
          {errors.dueDate && <p className="text-caption text-error">{errors.dueDate}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Estado *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as MilestoneStatus)}>
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

export function MilestoneDrawer({ open, mode, milestone, onClose, onSave }: Props) {
  const isEdit = mode === 'edit';
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col overflow-y-auto">
        <MilestoneForm
          key={`${open}-${milestone?.id ?? 'new'}`}
          milestone={milestone}
          isEdit={isEdit}
          onClose={onClose}
          onSave={onSave}
        />
      </SheetContent>
    </Sheet>
  );
}
