'use client';

import { useMemo } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { Eye, Pencil, MoreHorizontal, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { EntityTypeBadge } from './entity-type-badge';
import { ContactStatusBadge } from './contact-status-badge';
import type { Contacto } from '../types/contacts.types';
import {
  useTable,
  TableHeadCustom,
  TablePaginationCustom,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from 'src/shared/components/table';

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  B2B: 'bg-blue-100 text-blue-700',
  B2C: 'bg-emerald-100 text-emerald-700',
  B2G: 'bg-amber-100 text-amber-700',
};

function getSubtitle(c: Contacto): string {
  if (c.tipo === 'B2B') return c.nit ?? '';
  if (c.tipo === 'B2C') return c.empresaNombre ?? c.cargo ?? '';
  return c.tipoInstitucion ?? '';
}

interface ContactsTableProps {
  contactos: Contacto[];
  onEdit: (c: Contacto) => void;
  onViewDetail: (c: Contacto) => void;
  onDelete: (c: Contacto) => void;
}

const columnHelper = createColumnHelper<Contacto>();

export function ContactsTable({ contactos, onEdit, onViewDetail, onDelete }: ContactsTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className={`text-xs font-semibold ${AVATAR_COLORS[c.tipo]}`}>
                  {getInitials(c.nombre)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-body2 leading-tight">{c.nombre}</p>
                <p className="text-caption text-muted-foreground">{getSubtitle(c)}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('tipo', {
        header: 'Tipo',
        cell: (info) => <EntityTypeBadge tipo={info.getValue()} />,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground truncate block max-w-[180px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('pais', {
        header: 'País',
        cell: (info) => <span className="text-body2">{info.getValue()}</span>,
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <ContactStatusBadge estado={info.getValue()} />,
      }),
      columnHelper.accessor('relaciones', {
        header: 'Relaciones',
        cell: (info) => (
          <span className="text-body2 font-medium text-foreground">{info.getValue().length}</span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onViewDetail(c)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(c)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetail(c)}>Ver detalle</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(c)}>Editar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete(c)}>
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onEdit, onViewDetail, onDelete]
  );

  const { table, dense, onChangeDense } = useTable({
    data: contactos,
    columns: COLUMNS,
    defaultRowsPerPage: 10,
  });

  if (contactos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Users className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron contactos con los filtros aplicados.</p>
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
