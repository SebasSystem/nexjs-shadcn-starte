'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { formatMoney } from 'src/lib/currency';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadCustom,
  TablePaginationCustom,
  TableRow,
  useTable,
} from 'src/shared/components/table';
import { DeleteButton, EditButton } from 'src/shared/components/ui/action-buttons';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { ConfirmDialog } from 'src/shared/components/ui/confirm-dialog';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';
import { Switch } from 'src/shared/components/ui/switch';

import { SalesPageSkeleton } from '../components/SalesPageSkeleton';
import { useCreditRules } from '../hooks/useCreditRules';
import type { CreditException } from '../types/sales.types';

const columnHelper = createColumnHelper<CreditException>();

export function CreditRulesView() {
  const { rules, exceptions, isLoading, saveRules, updateException, deleteException } =
    useCreditRules();

  const [maxDays, setMaxDays] = useState(() => (rules ? String(rules.max_days) : ''));
  const [maxAmount, setMaxAmount] = useState(() => (rules ? String(rules.max_amount) : ''));
  const [autoBlock, setAutoBlock] = useState(() => (rules ? rules.auto_block : true));

  // ─── Delete confirmation state ────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<CreditException | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteException(deleteTarget.uid);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Edit drawer state ────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<CreditException | null>(null);
  const [editCreditLimit, setEditCreditLimit] = useState('');
  const [editMaxDays, setEditMaxDays] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEditDrawer = useCallback((exception: CreditException) => {
    setEditTarget(exception);
    setEditCreditLimit(String(exception.credit_limit));
    setEditMaxDays(String(exception.max_days));
  }, []);

  const closeEditDrawer = useCallback(() => {
    setEditTarget(null);
    setEditCreditLimit('');
    setEditMaxDays('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editTarget) return;
    setIsSavingEdit(true);
    try {
      await updateException(editTarget.uid, {
        credit_limit: parseFloat(editCreditLimit),
      });
      closeEditDrawer();
    } finally {
      setIsSavingEdit(false);
    }
  }, [editTarget, editCreditLimit, updateException, closeEditDrawer]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'client',
        header: 'Cliente',
        cell: (info) => {
          const row = info.row.original;
          const initials = row.client_name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-medium text-foreground">{row.client_name}</p>
                <p className="text-xs text-muted-foreground">{row.client_identifier}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('credit_limit', {
        header: () => <div className="text-right w-full">Límite Especial</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">
            {formatMoney(info.getValue(), { maximumFractionDigits: 0, currencyDisplay: 'code' })}
          </div>
        ),
      }),
      columnHelper.accessor('max_days', {
        header: () => <div className="text-center w-full">Días Cartera</div>,
        cell: (info) => (
          <div className="text-center text-muted-foreground">{info.getValue()} días</div>
        ),
      }),
      columnHelper.accessor('is_active', {
        header: () => <div className="text-center w-full">Estado</div>,
        cell: (info) => (
          <div className="flex justify-center">
            <Badge variant="soft" color={info.getValue() ? 'success' : 'secondary'}>
              {info.getValue() ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center w-full">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <EditButton onClick={() => openEditDrawer(row.original)} />
            <DeleteButton onClick={() => setDeleteTarget(row.original)} />
          </div>
        ),
      }),
    ],
    [openEditDrawer]
  );

  const { table, dense, onChangeDense } = useTable({
    data: exceptions,
    columns,
    defaultRowsPerPage: 10,
  });

  const handleSaveRules = async () => {
    await saveRules({
      max_days: parseInt(maxDays, 10),
      max_amount: parseFloat(maxAmount),
      auto_block: autoBlock,
    });
  };

  if (isLoading)
    return (
      <SalesPageSkeleton
        title="Reglas de Bloqueo de Crédito"
        subtitle="Configura las políticas de crédito para controlar el riesgo financiero"
      />
    );

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Reglas de Bloqueo de Crédito"
        subtitle="Configura las políticas de crédito para controlar el riesgo financiero"
      />

      <SectionCard className="p-6 space-y-5">
        <h2 className="text-h6 text-foreground">Reglas globales de crédito</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Días máximos de cartera"
            type="number"
            value={maxDays}
            onChange={(e) => setMaxDays(e.target.value)}
            hint="Número máximo de días que una factura puede estar pendiente"
          />
          <Input
            label="Monto máximo permitido de crédito"
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            hint="Límite de crédito disponible por cliente"
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
          <div className="flex-1 mr-4">
            <p className="text-sm font-semibold text-foreground">
              Activar bloqueo automático de crédito
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cuando un cliente supere el límite configurado o tenga facturas vencidas, el sistema
              bloqueará nuevas cotizaciones o facturas.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="soft" color={autoBlock ? 'success' : 'secondary'}>
              {autoBlock ? 'Activo' : 'Inactivo'}
            </Badge>
            <Switch checked={autoBlock} onCheckedChange={setAutoBlock} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button color="primary" onClick={handleSaveRules}>
            Guardar configuración
          </Button>
        </div>
      </SectionCard>

      <SectionCard noPadding>
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-h6 text-foreground">Excepciones por cliente</h2>
          <Button variant="outline" size="sm">
            <Icon name="Plus" size={15} />
            Agregar excepción
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody dense={dense}>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    Sin excepciones configuradas
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar excepción"
        description={
          deleteTarget
            ? `¿Estás seguro de que querés eliminar la excepción para ${deleteTarget.client_name}? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        loading={isDeleting}
        variant="error"
      />

      {/* Edit exception drawer */}
      <Sheet open={!!editTarget} onOpenChange={(open) => !open && closeEditDrawer()}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar excepción — {editTarget?.client_name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Input
              label="Límite de crédito especial"
              type="number"
              value={editCreditLimit}
              onChange={(e) => setEditCreditLimit(e.target.value)}
              hint="Monto máximo de crédito permitido para este cliente"
            />
            <Input
              label="Días máximos de cartera"
              type="number"
              value={editMaxDays}
              onChange={(e) => setEditMaxDays(e.target.value)}
              hint="Número máximo de días que una factura puede estar pendiente"
              disabled
            />
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={closeEditDrawer} disabled={isSavingEdit}>
              Cancelar
            </Button>
            <Button color="primary" onClick={handleSaveEdit} loading={isSavingEdit}>
              Guardar cambios
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
