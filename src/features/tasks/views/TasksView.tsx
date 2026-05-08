'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import {
  Button,
  Icon,
  Input,
  SelectField,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
} from 'src/shared/components/ui';
import { Badge } from 'src/shared/components/ui/badge';

import { useTasks } from '../hooks/use-tasks';
import type { Task, TaskPriority, TaskStatus } from '../types/task.types';

// ─── Status & Priority configs ──────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { label: 'En Progreso', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-blue-50 text-blue-600' },
  medium: { label: 'Media', color: 'bg-amber-50 text-amber-600' },
  high: { label: 'Alta', color: 'bg-orange-50 text-orange-600' },
  urgent: { label: 'Urgente', color: 'bg-red-50 text-red-600' },
};

// ─── Table columns ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Task>();

const COLUMNS = (onEdit: (t: Task) => void, onDelete: (t: Task) => void) => [
  columnHelper.accessor('title', {
    header: 'Tarea',
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('priority', {
    header: 'Prioridad',
    cell: (info) => {
      const { label, color } = PRIORITY_CONFIG[info.getValue()];
      return (
        <Badge
          variant="soft"
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-none ${color}`}
        >
          {label}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    cell: (info) => {
      const { label, color } = STATUS_CONFIG[info.getValue()];
      return (
        <Badge
          variant="outline"
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}
        >
          {label}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('assigned_user', {
    header: 'Asignado a',
    cell: (info) => (
      <span className="text-sm text-muted-foreground">{info.getValue()?.name || '—'}</span>
    ),
  }),
  columnHelper.accessor('due_date', {
    header: 'Vence',
    cell: (info) => {
      const val = info.getValue();
      return (
        <span className="text-sm text-muted-foreground">
          {val ? format(new Date(val), 'dd MMM yyyy', { locale: es }) : '—'}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'acciones',
    header: () => <div className="text-right w-full">Acciones</div>,
    cell: (info) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(info.row.original)}
          title="Editar"
        >
          <Icon name="Pencil" size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(info.row.original)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          title="Eliminar"
        >
          <Icon name="Trash2" size={14} />
        </Button>
      </div>
    ),
  }),
];

// ─── View ───────────────────────────────────────────────────────────────────

export function TasksView() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const { table, dense, onChangeDense } = useTable({
    data: tasks,
    columns: COLUMNS(handleEdit, handleDelete),
    defaultRowsPerPage: 10,
  });

  function handleEdit(task: Task) {
    setEditing(task);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date ? task.due_date.substring(0, 10) : '');
    setDrawerOpen(true);
  }

  function handleDelete(task: Task) {
    if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      deleteTask.mutate(task.uid);
    }
  }

  function openCreate() {
    setEditing(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('pending');
    setDueDate('');
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        due_date: dueDate || undefined,
      };
      if (editing) {
        await updateTask.mutateAsync({ uid: editing.uid, payload });
      } else {
        await createTask.mutateAsync(payload);
      }
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tareas"
        subtitle="Gestión de tareas con prioridad y seguimiento de estados."
        action={
          <Button color="primary" onClick={openCreate} className="gap-2">
            <Icon name="Plus" size={16} />
            Nueva Tarea
          </Button>
        }
      />

      <SectionCard noPadding>
        <TableContainer className="relative">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS(handleEdit, handleDelete).length}
                    className="py-10 text-center text-muted-foreground text-sm"
                  >
                    {isLoading
                      ? 'Cargando...'
                      : 'No hay tareas. Usá el botón "Nueva Tarea" para crear la primera.'}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar Tarea' : 'Nueva Tarea'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué hay que hacer?"
            />
            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la tarea"
              className="min-h-[80px] resize-none"
            />
            <SelectField
              label="Prioridad"
              options={[
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' },
                { value: 'urgent', label: 'Urgente' },
              ]}
              value={priority}
              onChange={(v) => setPriority(v as TaskPriority)}
            />
            <SelectField
              label="Estado"
              options={[
                { value: 'pending', label: 'Pendiente' },
                { value: 'in_progress', label: 'En Progreso' },
                { value: 'completed', label: 'Completada' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
              value={status}
              onChange={(v) => setStatus(v as TaskStatus)}
            />
            <Input
              label="Fecha de vencimiento"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button color="primary" onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
