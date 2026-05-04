'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Alerta } from 'src/features/admin/types/admin.types';
import { formatDate } from 'src/lib/date';
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
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Switch } from 'src/shared/components/ui/switch';

const columnHelper = createColumnHelper<Alerta>();

interface AlertasTableProps {
  data: Alerta[];
  isLoading: boolean;
  onEdit: (alerta: Alerta) => void;
  onToggle: (id: string) => void;
  onNewAlerta: () => void;
}

export function AlertasTable({
  data,
  isLoading,
  onEdit,
  onToggle,
  onNewAlerta,
}: AlertasTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Alerta',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'condicion',
        header: 'Condición',
        cell: (info) => {
          const a = info.row.original;
          return (
            <span className="text-muted-foreground text-sm">
              {a.metric} {a.operator} {a.value} en {a.period}
            </span>
          );
        },
      }),
      columnHelper.accessor('canales', {
        header: 'Canal',
        cell: (info) => (
          <div className="flex gap-1.5 flex-wrap">
            {info.getValue().map((c: string) => (
              <Badge key={c} variant="outline" className="text-[10px] bg-card">
                {c}
              </Badge>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => {
          const alerta = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={alerta.estado === 'ACTIVO'}
                onCheckedChange={() => onToggle(alerta.uid)}
              />
              <span className="text-xs text-muted-foreground">
                {alerta.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('last_triggered_at', {
        header: 'Última activación',
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.getValue() ? formatDate(info.getValue() as string) : 'Nunca'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => (
          <div className="text-right">
            <Button variant="ghost" size="sm" onClick={() => onEdit(info.row.original)}>
              Editar
            </Button>
          </div>
        ),
      }),
    ],
    [onToggle, onEdit]
  );

  const { table, dense, onChangeDense } = useTable({
    data,
    columns: COLUMNS,
    defaultRowsPerPage: 25,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/40 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Icon name="Bell" className="h-12 w-12 text-primary opacity-80" />
        </div>
        <h3 className="text-h6 text-foreground font-semibold mb-2">No hay alertas configuradas</h3>
        <p className="text-body2 text-muted-foreground max-w-sm mb-6">
          Configura reglas para recibir notificaciones cuando ocurran errores o eventos críticos en
          los tenants.
        </p>
        <Button color="primary" onClick={onNewAlerta} className="gap-2">
          Configura tu primera alerta <Icon name="ArrowRight" className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TableContainer>
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={!dense ? 'py-4 px-6' : 'px-6'}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="border-t border-border/40">
        <TablePaginationCustom table={table} dense={dense} onChangeDense={onChangeDense} />
      </div>
    </div>
  );
}
