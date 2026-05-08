import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

interface UseTableProps<TData> {
  data: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  defaultRowsPerPage?: number;
  /** Server-side pagination: total items from backend meta */
  total?: number;
  /** Server-side pagination: controlled page index */
  pageIndex?: number;
  /** Server-side pagination: controlled page size */
  pageSize?: number;
  /** Callbacks for server-side pagination */
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function useTable<TData>({
  data,
  columns,
  defaultRowsPerPage = 25,
  total,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  onPageChange,
  onPageSizeChange,
}: UseTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: controlledPageIndex ?? 0,
    pageSize: controlledPageSize ?? defaultRowsPerPage,
  });
  const [dense, setDense] = useState(false);

  const isServerSide = total !== undefined;

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table useReactTable() cannot be memoized by React Compiler
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination: {
        pageIndex: controlledPageIndex ?? pagination.pageIndex,
        pageSize: controlledPageSize ?? pagination.pageSize,
      },
    },
    // Server-side: manual pagination, page count from backend
    ...(isServerSide
      ? {
          manualPagination: true,
          pageCount: Math.ceil(total / (controlledPageSize ?? pagination.pageSize)),
        }
      : {}),
    // Client-side: TanStack handles pagination internally
    ...(isServerSide
      ? {}
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(next);
      if (onPageChange && next.pageIndex !== pagination.pageIndex) {
        onPageChange(next.pageIndex);
      }
      if (onPageSizeChange && next.pageSize !== pagination.pageSize) {
        onPageSizeChange(next.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return {
    table,
    dense,
    onChangeDense: (checked: boolean) => setDense(checked),
  };
}
