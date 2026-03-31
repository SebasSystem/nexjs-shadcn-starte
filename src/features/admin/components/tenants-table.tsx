'use client';

import { useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Eye, Pencil, MoreHorizontal, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { TenantStatusBadge } from 'src/features/admin/components/tenant-status-badge';
import { Tenant } from 'src/features/admin/types/admin.types';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';

interface TenantsTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onViewDetail: (tenant: Tenant) => void;
  onSuspend: (tenant: Tenant) => void;
}

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatRelative(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'Hace menos de 1h';
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Hace ${diffD}d`;
  return `Hace ${Math.floor(diffD / 30)} mes(es)`;
}

function getUserProgressColor(pct: number) {
  if (pct > 95) return 'bg-red-500';
  if (pct > 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

const columnHelper = createColumnHelper<Tenant>();

export function TenantsTable({ tenants, onEdit, onViewDetail, onSuspend }: TenantsTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Tenant',
        cell: (info) => {
          const tenant = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(tenant.nombre)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-body2">{tenant.nombre}</p>
                <p className="text-caption text-muted-foreground">{tenant.dominio}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('planNombre', {
        header: 'Plan',
        cell: (info) => (
          <Badge variant="outline" className="text-xs">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'usuarios',
        header: 'Usuarios',
        cell: (info) => {
          const tenant = info.row.original;
          const userPct = Math.round((tenant.totalUsuarios / tenant.limiteUsuarios) * 100);
          const progressColor = getUserProgressColor(userPct);
          return (
            <div>
              <p className="text-body2 text-foreground font-medium mb-1">
                {tenant.totalUsuarios} / {tenant.limiteUsuarios}
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all ${progressColor}`}
                  style={{ width: `${Math.min(userPct, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('mrr', {
        header: 'MRR',
        cell: (info) => <span className="font-semibold text-foreground">${info.getValue()}</span>,
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <TenantStatusBadge estado={info.getValue()} />,
      }),
      columnHelper.accessor('creadoEn', {
        header: 'Creado',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('ultimoAcceso', {
        header: 'Último acceso',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">
            {formatRelative(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => {
          const tenant = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onViewDetail(tenant)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(tenant)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(tenant)}>Cambiar Plan</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => onSuspend(tenant)}>
                    Suspender Tenant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onEdit, onViewDetail, onSuspend]
  );

  const { table, dense, onChangeDense } = useTable({
    data: tenants,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <UserCheck className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron tenants con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
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
    </div>
  );
}
