'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Icon } from 'src/shared/components/ui/icon';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import { Switch } from 'src/shared/components/ui/switch';
import { Badge } from 'src/shared/components/ui/badge';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';

// ─── Types & Mock Data ───────────────────────────────────────────────────────

type CreditException = {
  id: string;
  initials: string;
  name: string;
  rfc: string;
  limit: number;
  days: number;
  active: boolean;
};

const CREDIT_EXCEPTIONS: CreditException[] = [
  {
    id: '1',
    initials: 'TM',
    name: 'Tecnologías Modernas S.A.',
    rfc: 'TMO880512ABC',
    limit: 150000,
    days: 60,
    active: true,
  },
  {
    id: '2',
    initials: 'GI',
    name: 'Grupo Industrial del Norte',
    rfc: 'GIN850723XYZ',
    limit: 300000,
    days: 90,
    active: true,
  },
  {
    id: '3',
    initials: 'DC',
    name: 'Distribuidora Central',
    rfc: 'DCE890315DEF',
    limit: 75000,
    days: 45,
    active: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<CreditException>();

// ─── View ─────────────────────────────────────────────────────────────────────

export function CreditRulesView() {
  const [autoBlock, setAutoBlock] = useState(true);
  const [maxDays, setMaxDays] = useState('30');
  const [maxAmount, setMaxAmount] = useState('50000');

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'client',
        header: 'Cliente',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {row.initials}
              </div>
              <div>
                <p className="font-medium text-foreground">{row.name}</p>
                <p className="text-xs text-muted-foreground">RFC: {row.rfc}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('limit', {
        header: () => <div className="text-right w-full">Límite Especial</div>,
        cell: (info) => (
          <div className="text-right font-semibold text-foreground">
            {formatMXN(info.getValue())} MXN
          </div>
        ),
      }),
      columnHelper.accessor('days', {
        header: () => <div className="text-center w-full">Días Cartera</div>,
        cell: (info) => (
          <div className="text-center text-muted-foreground">{info.getValue()} días</div>
        ),
      }),
      columnHelper.accessor('active', {
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
        cell: () => (
          <div className="flex items-center justify-center gap-2">
            <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10">
              <Icon name="Pencil" size={15} />
            </button>
            <button className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-500/10">
              <Icon name="Trash2" size={15} />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const { table, dense, onChangeDense } = useTable({
    data: CREDIT_EXCEPTIONS,
    columns,
    defaultRowsPerPage: 10,
  });

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Reglas de Bloqueo de Crédito"
        subtitle="Configura las políticas de crédito para controlar el riesgo financiero"
      />

      {/* ── Global Credit Rules ──────────────────────────────────────────── */}
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
            hint="Límite de crédito disponible por cliente (MXN)"
          />
        </div>

        {/* Auto-block toggle */}
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
          <Button color="primary">Guardar configuración</Button>
        </div>
      </SectionCard>

      {/* ── Client Exceptions Table — TanStack ───────────────────────────── */}
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
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border/40">
          <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
        </div>
      </SectionCard>
    </PageContainer>
  );
}
