'use client';

import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';
import { formatRelative } from 'src/lib/date';
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
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';

import type { SettingsUser } from '../../types/settings.types';
import { UserStatusBadge } from './user-status-badge';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const columnHelper = createColumnHelper<SettingsUser>();

interface UsersTableProps {
  users: SettingsUser[];
  onEdit: (user: SettingsUser) => void;
  onToggleStatus: (user: SettingsUser) => void;
  onDelete: (user: SettingsUser) => void;
}

export function UsersTable({ users, onEdit, onToggleStatus, onDelete }: UsersTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Usuario',
        cell: (info) => {
          const user = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs bg-violet-100 text-violet-700 font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-body2">{user.name}</p>
                <p className="text-caption text-muted-foreground">{user.email}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('role_name', {
        header: 'Rol',
        cell: (info) => (
          <Badge variant="outline" className="text-xs">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('team_name', {
        header: 'Equipo',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground">{info.getValue() ?? '—'}</span>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => <UserStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('last_access_at', {
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
          const user = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(user)}>
                <Icon name="Pencil" size={14} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Icon name="MoreHorizontal" size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(user)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                    {user.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete(user)}>
                    Eliminar usuario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onEdit, onToggleStatus, onDelete]
  );

  const { table, dense, onChangeDense } = useTable({
    data: users,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Icon name="Users" size={40} className="mb-3 opacity-40" />
        <p className="text-body2">No se encontraron usuarios con los filtros aplicados.</p>
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
