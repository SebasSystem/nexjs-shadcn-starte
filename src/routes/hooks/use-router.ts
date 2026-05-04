import type { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter as useNextRouter } from 'next/navigation';
import { useMemo } from 'react';

export function useRouter() {
  const router = useNextRouter();

  return useMemo(
    () => ({
      back: () => router.back(),
      forward: () => router.forward(),
      refresh: () => router.refresh(),
      push: (href: string, options?: NavigateOptions) => router.push(href, options),
      replace: (href: string, options?: NavigateOptions) => router.replace(href, options),
      prefetch: (href: string) => router.prefetch(href),
    }),
    [router]
  );
}
