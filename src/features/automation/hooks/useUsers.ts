'use client';

import { useQuery } from '@tanstack/react-query';
import { usersService } from 'src/features/settings/services/users.service';
import { queryKeys } from 'src/lib/query-keys';

export interface UserOption {
  value: string;
  label: string;
}

const STALE_TIME = 5 * 60 * 1000; // 5 min — users rarely change mid-session
const PER_PAGE = 500;

export function useUsers() {
  const { data } = useQuery({
    queryKey: [...queryKeys.settings.users, { per_page: PER_PAGE, status: 'active' }] as const,
    staleTime: STALE_TIME,
    queryFn: async () => {
      const res = await usersService.getAll({ per_page: PER_PAGE });
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
