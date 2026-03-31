'use client';

import { useMemo } from 'react';
import { Pencil, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import type { Rol } from '../../types/settings.types';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from 'src/shared/components/table';
import { createColumnHelper, flexRender } from '@tanstack/react-table';

const columnHelper = createColumnHelper<Rol>();

interface RolesTableProps {
  roles: Rol[];
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
}

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Rol',
        cell: (info) => {
          const rol = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground text-sm">{rol.nombre}</p>
              {rol.esDefecto && (
                <Badge variant="soft" color="default" className="text-xs">
                  Por defecto
                </Badge>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => (
          <p className="text-sm text-muted-foreground truncate max-w-[220px]">{info.getValue()}</p>
        ),
      }),
      columnHelper.accessor('permisos', {
        header: 'Módulos con acceso',
        cell: (info) => {
          const permisos = info.getValue();
          return (
            <div className="flex flex-wrap gap-1">
              {permisos.slice(0, 3).map((p) => (
                <Badge key={p.moduloId} variant="outline" className="text-xs">
                  {p.moduloNombre}
                </Badge>
              ))}
              {permisos.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{permisos.length - 3}
                </Badge>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('totalUsuarios', {
        header: 'Usuarios',
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const rol = info.row.original;
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(rol)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(rol)}>Editar permisos</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(rol)}
                    disabled={rol.esDefecto || rol.totalUsuarios > 0}
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
        <ShieldCheck className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No hay roles configurados.</p>
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
