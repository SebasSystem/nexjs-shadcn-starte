'use client';

// ─────────────────────────────────────────────────────────────────────────────
// usePaginationParams — Estado centralizado de paginación
//
// Uso en cualquier hook que consuma un endpoint paginado:
//
//   const pagination = usePaginationParams();
//   const { data } = useQuery({
//     queryKey: ['users', pagination.params],
//     queryFn: () => usersService.getAll(pagination.params),
//   });
//   const meta = extractPaginationMeta(response);
//   pagination.setTotal(meta?.total ?? 0);
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE, type PaginationParams } from '../lib/pagination';

interface UsePaginationParamsOptions {
  defaultPerPage?: number;
}

export function usePaginationParams(options: UsePaginationParamsOptions = {}) {
  const perPage = options.defaultPerPage ?? DEFAULT_PER_PAGE;

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState(perPage);
  const [sort, setSort] = useState<string | undefined>();
  const [order, setOrder] = useState<'asc' | 'desc' | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [total, setTotal] = useState(0);

  const params: PaginationParams = useMemo(
    () => ({
      page,
      per_page: rowsPerPage,
      ...(sort ? { sort } : {}),
      ...(order ? { order } : {}),
      ...(search ? { search } : {}),
    }),
    [page, rowsPerPage, sort, order, search]
  );

  const onChangePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((newPerPage: number) => {
    setRowsPerPage(newPerPage);
    setPage(DEFAULT_PAGE); // reset a página 1 al cambiar tamaño
  }, []);

  const onChangeSort = useCallback((field: string, dir: 'asc' | 'desc') => {
    setSort(field);
    setOrder(dir);
    setPage(DEFAULT_PAGE);
  }, []);

  const onChangeSearch = useCallback((term: string) => {
    setSearch(term || undefined);
    setPage(DEFAULT_PAGE);
  }, []);

  return {
    params,
    page,
    rowsPerPage,
    total,
    sort,
    order,
    search,
    setTotal,
    onChangePage,
    onChangeRowsPerPage,
    onChangeSort,
    onChangeSearch,
  };
}
