'use client';

import { useState, useMemo, useCallback } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { RefreshCw, AlertTriangle, Save } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Badge } from 'src/shared/components/ui/badge';
import { SelectField } from 'src/shared/components/ui/select-field';
import { Card, CardContent } from 'src/shared/components/ui/card';
import { Table, TableBody, TableRow, TableCell } from 'src/shared/components/ui';
import { PageContainer, PageHeader } from 'src/shared/components/layouts/page';
import { useTable, TableHeadCustom, TablePaginationCustom } from 'src/shared/components/table';

// ─── Types & Mock Data ───────────────────────────────────────────────────────

type CurrencyRow = {
  code: string;
  name: string;
  rate: string;
  lastUpdate: string;
  status: 'active' | 'outdated';
};

const INITIAL_CURRENCIES: CurrencyRow[] = [
  { code: 'EUR', name: 'Euro', rate: '0.92', lastUpdate: '2024-01-13', status: 'outdated' },
  {
    code: 'COP',
    name: 'Peso colombiano',
    rate: '4000',
    lastUpdate: '2024-01-15',
    status: 'active',
  },
  { code: 'COP', name: 'Peso mexicano', rate: '17.15', lastUpdate: '2024-01-15', status: 'active' },
];

const BASE_CURRENCY_OPTIONS = [
  { value: 'COP', label: 'USD — Dólar estadounidense' },
  { value: 'COP', label: 'MXN — Peso mexicano' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'COP', label: 'COP — Peso colombiano' },
];

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<CurrencyRow>();

// ─── View ─────────────────────────────────────────────────────────────────────

export function MultiCurrencyView() {
  const [baseCurrency, setBaseCurrency] = useState('COP');
  const [currencies, setCurrencies] = useState<CurrencyRow[]>(INITIAL_CURRENCIES);

  const updateRate = useCallback((code: string, value: string) => {
    setCurrencies((prev) => prev.map((c) => (c.code === code ? { ...c, rate: value } : c)));
  }, []);

  const hasOutdated = currencies.some((c) => c.status === 'outdated');

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'currency',
        header: 'Moneda',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant="soft"
                className="text-xs font-bold bg-primary/10 text-primary rounded border-none px-2 py-0.5"
              >
                {row.code}
              </Badge>
              <span className="text-foreground">{row.name}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('rate', {
        header: () => <div className="text-center w-full">Tipo de Cambio</div>,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>1 USD =</span>
              <input
                type="number"
                value={row.rate}
                step="0.01"
                onChange={(e) => updateRate(row.code, e.target.value)}
                className="w-28 text-center bg-muted/20 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <span>{row.code}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('lastUpdate', {
        header: () => <div className="text-center w-full">Última Actualización</div>,
        cell: (info) => <div className="text-center text-muted-foreground">{info.getValue()}</div>,
      }),
      columnHelper.accessor('status', {
        header: () => <div className="text-center w-full">Estado</div>,
        cell: (info) => (
          <div className="flex justify-center">
            {info.getValue() === 'active' ? (
              <Badge variant="soft" color="success">
                Activo
              </Badge>
            ) : (
              <Badge variant="soft" color="warning">
                Desactualizado
              </Badge>
            )}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center w-full">Acciones</div>,
        cell: () => (
          <div className="flex justify-center">
            <Button variant="outline" size="sm">
              <Save size={13} />
              Guardar
            </Button>
          </div>
        ),
      }),
    ],
    [updateRate]
  );

  const { table, dense, onChangeDense } = useTable({
    data: currencies,
    columns,
    defaultRowsPerPage: 10,
  });

  return (
    <PageContainer className="pb-10">
      <PageHeader
        title="Configuración Multimoneda"
        subtitle="Gestiona las monedas y tipos de cambio de tu sistema"
      />

      {/* ── Moneda base ──────────────────────────────────────────────────── */}
      <Card className="border-none shadow-card">
        <CardContent className="p-6">
          <h2 className="text-h6 text-foreground mb-4">Moneda base del sistema</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <SelectField
                label="Moneda principal"
                options={BASE_CURRENCY_OPTIONS}
                value={baseCurrency}
                onChange={(v) => setBaseCurrency(v as string)}
              />
            </div>
            <Button color="primary">Guardar configuración</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tipo de cambio — TanStack ─────────────────────────────────────── */}
      <Card className="border-none shadow-card py-0 gap-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-h6 text-foreground">Tipo de cambio</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeadCustom table={table} />
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
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

        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </Card>

      {/* ── Visualización doble moneda ────────────────────────────────────── */}
      <div>
        <h2 className="text-h6 text-foreground mb-4">Visualización doble moneda</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Ejemplo */}
          <Card className="border-none shadow-card">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total cotización
                </p>
                <Badge variant="soft" color="secondary">
                  Ejemplo
                </Badge>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">COP 1,000.00</p>
                <p className="text-xs text-muted-foreground mt-0.5">Moneda base</p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <p className="text-lg font-semibold text-foreground">COP 4,000,000.00</p>
                <p className="text-xs text-muted-foreground mt-0.5">Equivalente</p>
              </div>
            </CardContent>
          </Card>

          {/* Alerta */}
          {hasOutdated && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 p-5 flex flex-col justify-between">
              <div className="flex gap-3">
                <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">
                    Tipo de cambio desactualizado
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-500/80 mt-1">
                    El tipo de cambio EUR tiene más de 24 horas sin actualizar.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                >
                  <RefreshCw size={14} />
                  Actualizar tipo de cambio
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
