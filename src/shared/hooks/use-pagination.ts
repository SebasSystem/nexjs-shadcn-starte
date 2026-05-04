import { useMemo, useState } from 'react';

export function usePagination<T>(items: T[], pageSize = 9) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginated = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return {
    page,
    totalPages,
    total: items.length,
    paginated,
    goTo,
  };
}
