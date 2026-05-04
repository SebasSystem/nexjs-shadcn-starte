import { flexRender, Table } from '@tanstack/react-table';
import { TableHead, TableHeader, TableRow } from 'src/shared/components/ui/table';

interface Props<TData> {
  table: Table<TData>;
}

export function TableHeadCustom<TData>({ table }: Props<TData>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            return (
              <TableHead key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}
