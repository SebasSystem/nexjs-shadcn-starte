'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';
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
import { DeleteButton, EditButton } from 'src/shared/components/ui/action-buttons';
import { Badge } from 'src/shared/components/ui/badge';
import { Icon } from 'src/shared/components/ui/icon';

import type { Role } from '../../types/settings.types';

const columnHelper = createColumnHelper<Role>();

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Rol',
        cell: (info) => {
          const role = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground text-sm">{role.name}</p>
              {role.is_system && (
                <Badge variant="soft" color="default" className="text-xs">
                  Por defecto
                </Badge>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: (info) => (
          <p className="text-sm text-muted-foreground truncate max-w-[220px]">{info.getValue()}</p>
        ),
      }),
      columnHelper.display({
        id: 'permission_uids',
        header: 'Permisos',
        cell: (info) => {
          const entries = info.row.original.permission_entries ?? [];
          if (entries.length === 0) {
            return <span className="text-xs text-muted-foreground">Sin permisos</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {entries.slice(0, 3).map((entry) => (
                <Badge key={entry.key} variant="outline" className="text-xs">
                  {entry.key}
                </Badge>
              ))}
              {entries.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{entries.length - 3}
                </Badge>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('total_users', {
        header: 'Usuarios',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const role = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <EditButton onClick={() => onEdit(role)} />
              <DeleteButton
                onClick={() => onDelete(role)}
                disabled={role.is_system || (role.total_users ?? 0) > 0}
              />
            </div>
          );
        },
      }),
    ],
    [onEdit, onDelete]
  );

  const { table, dense, onChangeDense } = useTable({
    data: roles,
    columns: COLUMNS,
    defaultRowsPerPage: 25,
  });

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Icon name="ShieldCheck" size={40} className="mb-3 opacity-40" />
        <p className="text-sm">No hay roles configurados.</p>
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
                  <TableCell key={cell.id}>
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
