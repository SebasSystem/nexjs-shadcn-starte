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
import { MOCK_CONSULTANTS } from 'src/_mock/_projects';
import type { Project, ProjectStatus } from '../types';

const MOCK_CLIENTS = [
  { id: 'contact-001', name: 'Distribuidora Mayorista S.A.' },
  { id: 'contact-002', name: 'Retail Corp Ltda.' },
  { id: 'contact-003', name: 'TechParts Global' },
  { id: 'contact-004', name: 'Moda Express S.A.' },
  { id: 'contact-005', name: 'GovPro Institucional' },
  { id: 'contact-006', name: 'SportZone Mayorista' },
  { id: 'contact-007', name: 'Ferretera del Norte' },
  { id: 'contact-008', name: 'Agro Exportaciones Ltda.' },
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planificación' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'on_hold', label: 'En pausa' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  project?: Project | null;
  onClose: () => void;
  onCreate: (
    data: Omit<Project, 'id' | 'milestones' | 'resources' | 'progress' | 'createdAt'>
  ) => void;
  onUpdate: (id: string, changes: Partial<Project>) => void;
  onCancel?: (id: string) => void;
}

interface FormProps {
  project?: Project | null;
  isEdit: boolean;
  onClose: () => void;
  onCreate: (
    data: Omit<Project, 'id' | 'milestones' | 'resources' | 'progress' | 'createdAt'>
  ) => void;
  onUpdate: (id: string, changes: Partial<Project>) => void;
  onCancel?: (id: string) => void;
}

function ProjectForm({ project, isEdit, onClose, onCreate, onUpdate, onCancel }: FormProps) {
  const init = isEdit && project;
  const [name, setName] = useState(init ? project.name : '');
  const [clientId, setClientId] = useState(init ? project.clientId : '');
  const [manager, setManager] = useState(init ? project.manager : '');
  const [status, setStatus] = useState<ProjectStatus>(init ? project.status : 'planning');
  const [startDate, setStartDate] = useState(init ? project.startDate : '');
  const [endDate, setEndDate] = useState(init ? project.endDate : '');
  const [description, setDescription] = useState(init ? (project.description ?? '') : '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (!clientId) errs.clientId = 'Seleccioná un cliente';
    if (!manager) errs.manager = 'Seleccioná un manager';
    if (!startDate) errs.startDate = 'La fecha de inicio es requerida';
    if (!endDate) errs.endDate = 'La fecha de fin estimado es requerida';
    if (startDate && endDate && startDate > endDate)
      errs.endDate = 'La fecha fin debe ser posterior al inicio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const client = MOCK_CLIENTS.find((c) => c.id === clientId);

    if (isEdit && project) {
      onUpdate(project.id, {
        name,
        clientId,
        clientName: client?.name ?? '',
        manager,
        status,
        startDate,
        endDate,
        description,
      });
      toast.success('Proyecto actualizado');
    } else {
      onCreate({
        name,
        clientId,
        clientName: client?.name ?? '',
        manager,
        status,
        startDate,
        endDate,
        description,
      });
      toast.success('Proyecto creado');
    }

    setLoading(false);
    onClose();
  };

  const handleCancel = () => {
    if (project && onCancel) {
      onCancel(project.id);
      toast.success('Proyecto cancelado');
      onClose();
    }
  };

  const showDangerZone =
    isEdit && project && project.status !== 'completed' && project.status !== 'cancelled';

  return (
    <>
      <SheetHeader className="border-b border-border/60 pb-4">
        <SheetTitle>{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="proj-name">Nombre del proyecto *</Label>
          <Input
            id="proj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Onboarding ERP — Cliente XYZ"
            className={cn(errors.name && 'border-error focus-visible:border-error')}
          />
          {errors.name && <p className="text-caption text-error">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Cliente *</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className={cn(errors.clientId && 'border-error')}>
              <SelectValue placeholder="Seleccioná un cliente" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CLIENTS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clientId && <p className="text-caption text-error">{errors.clientId}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Manager responsable *</Label>
          <Select value={manager} onValueChange={setManager}>
            <SelectTrigger className={cn(errors.manager && 'border-error')}>
              <SelectValue placeholder="Seleccioná el manager" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CONSULTANTS.map((c) => (
                <SelectItem key={c.email} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.manager && <p className="text-caption text-error">{errors.manager}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Estado *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="proj-start">Fecha inicio *</Label>
            <Input
              id="proj-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(errors.startDate && 'border-error')}
            />
            {errors.startDate && <p className="text-caption text-error">{errors.startDate}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="proj-end">Fin estimado *</Label>
            <Input
              id="proj-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={cn(errors.endDate && 'border-error')}
            />
            {errors.endDate && <p className="text-caption text-error">{errors.endDate}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proj-desc">Descripción</Label>
          <Textarea
            id="proj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contexto del proyecto, objetivos principales..."
            rows={3}
          />
        </div>

        {showDangerZone && (
          <div className="rounded-xl border border-error/20 p-4 bg-error/5">
            <p className="text-subtitle2 text-error font-medium mb-1">Zona de peligro</p>
            <p className="text-caption text-muted-foreground mb-3">
              Cancelar el proyecto lo cerrará permanentemente.
            </p>
            <Button variant="outline" color="error" size="sm" onClick={handleCancel}>
              Cancelar proyecto
            </Button>
          </div>
        )}
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

export function ProjectDrawer({
  open,
  mode,
  project,
  onClose,
  onCreate,
  onUpdate,
  onCancel,
}: Props) {
  const isEdit = mode === 'edit';
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <ProjectForm
          key={`${open}-${project?.id ?? 'new'}`}
          project={project}
          isEdit={isEdit}
          onClose={onClose}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onCancel={onCancel}
        />
      </SheetContent>
    </Sheet>
  );
}
