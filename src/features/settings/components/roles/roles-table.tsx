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
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
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
      columnHelper.accessor('permissions', {
        header: 'Módulos con acceso',
        cell: (info) => {
          const perms = info.getValue() ?? [];
          return (
            <div className="flex flex-wrap gap-1">
              {perms.slice(0, 3).map((p) => (
                <Badge key={p.module_uid} variant="outline" className="text-xs">
                  {p.module_name}
                </Badge>
              ))}
              {perms.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{perms.length - 3}
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
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(role)}>
                <Icon name="Pencil" size={14} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Icon name="MoreHorizontal" size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(role)}>Editar permisos</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(role)}
                    disabled={role.is_system || (role.total_users ?? 0) > 0}
                  >
                    Eliminar rol
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
