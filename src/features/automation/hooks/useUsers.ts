'use client';

import { useQuery } from '@tanstack/react-query';
import { usersService } from 'src/features/settings/services/users.service';
import { queryKeys } from 'src/lib/query-keys';

export interface UserOption {
  value: string;
  label: string;
}

const PER_PAGE = 25;

export function useUsers(search = '') {
  const { data } = useQuery({
    queryKey: [
      ...queryKeys.settings.users,
      { per_page: PER_PAGE, search: search || undefined },
    ] as const,
    staleTime: 0,
    queryFn: async () => {
      const params: Record<string, unknown> = { per_page: PER_PAGE };
      if (search) params.search = search;
      const res = await usersService.getAll(params);
      return res;
    },
  });

  const rawUsers =
    (data as unknown as { data?: { uid: string; name: string }[] } | undefined)?.data ?? [];

  const userOptions: UserOption[] = rawUsers.map((u) => ({
    value: u.uid,
    label: u.name,
  }));

  const userMap = new Map(rawUsers.map((u) => [u.uid, u.name]));

  return { userOptions, userMap } as const;
}
