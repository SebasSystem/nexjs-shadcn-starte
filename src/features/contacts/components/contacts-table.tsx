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
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { Icon } from 'src/shared/components/ui/icon';

import type { Contact } from '../types/contacts.types';
import { ContactStatusBadge } from './contact-status-badge';
import { EntityTypeBadge } from './entity-type-badge';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  company: 'bg-blue-100 text-blue-700',
  person: 'bg-emerald-100 text-emerald-700',
  government: 'bg-amber-100 text-amber-700',
};

function getSubtitle(c: Contact): string {
  if (c.type === 'company') return c.tax_id ?? '';
  if (c.type === 'person') return c.company_name ?? c.job_title ?? '';
  return c.institution_type ?? '';
}

interface ContactsTableProps {
  contactos: Contact[];
  onEdit: (c: Contact) => void;
  onViewDetail: (c: Contact) => void;
  onDelete: (c: Contact) => void;
}

const columnHelper = createColumnHelper<Contact>();

export function ContactsTable({ contactos, onEdit, onViewDetail, onDelete }: ContactsTableProps) {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className={`text-xs font-semibold ${AVATAR_COLORS[c.type]}`}>
                  {getInitials(c.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-body2 leading-tight">{c.name}</p>
                <p className="text-caption text-muted-foreground">{getSubtitle(c)}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: (info) => <EntityTypeBadge type={info.getValue()} />,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-body2 text-muted-foreground truncate block max-w-[180px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('country', {
        header: 'País',
        cell: (info) => <span className="text-body2">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => <ContactStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('relationships', {
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
                className="h-7 w-7 cursor-pointer"
                onClick={() => onViewDetail(c)}
              >
                <Icon name="Eye" className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => onEdit(c)}
              >
                <Icon name="Pencil" className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                    <Icon name="MoreHorizontal" className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetail(c)} className="cursor-pointer">
                    Ver detalle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(c)} className="cursor-pointer">
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => onDelete(c)}
                  >
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
        <Icon name="Users" className="h-10 w-10 mb-3 opacity-40" />
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
