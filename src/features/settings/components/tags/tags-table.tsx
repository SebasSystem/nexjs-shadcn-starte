import { createColumnHelper, flexRender } from '@tanstack/react-table';
import React, { useMemo } from 'react';
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
import { DeleteButton, EditButton } from 'src/shared/components/ui/action-buttons';

import type { Tag, TagColor, TagEntity } from '../../types/tags.types';

interface TagsTableProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
  /** Server-side pagination (optional — falls back to client-side) */
  total?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const columnHelper = createColumnHelper<Tag>();

export const BadgeColorMap: Record<TagColor, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
};

const EntityLabelMap: Record<TagEntity, string> = {
  CONTACT: 'Contactos',
  DEAL: 'Negocios',
  LEAD: 'Prospectos',
  COMPANY: 'Empresas',
};

export const TagsTable: React.FC<TagsTableProps> = ({
  tags,
  onEdit,
  onDelete,
  total,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const COLUMNS = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Etiqueta',
        cell: (info) => {
          const tag = info.row.original;
          return (
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                BadgeColorMap[tag.color]
              }`}
            >
              {tag.name}
            </span>
          );
        },
      }),
      columnHelper.accessor('entity_types', {
        header: 'Aplica en',
        cell: (info) => {
          const entities = (info.getValue() as TagEntity[]) ?? [];
          return (
            <div className="flex flex-wrap gap-1.5">
              {entities.map((e) => (
                <span
                  key={e}
                  className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium"
                >
                  {EntityLabelMap[e]}
                </span>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha de Creación',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: '',
        cell: (info) => (
          <div className="flex justify-end gap-1">
            <EditButton onClick={() => onEdit(info.row.original)} />
            <DeleteButton onClick={() => onDelete(info.row.original.uid)} />
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const { table, dense, onChangeDense } = useTable({
    data: tags,
    columns: COLUMNS,
    total,
    pageIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
    defaultRowsPerPage: 10,
  });

  return (
    <div className="w-full">
      <TableContainer className="relative min-h-[300px]">
        <Table>
          <TableHeadCustom table={table} />
          <TableBody dense={dense}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="border-t border-border/40">
        <TablePaginationCustom
          table={table}
          dense={dense}
          onChangeDense={onChangeDense}
          total={total}
        />
      </div>
    </div>
  );
};
