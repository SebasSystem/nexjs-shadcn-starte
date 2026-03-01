'use client';

import { LogOut, User } from 'lucide-react';
import { signOut } from 'src/features/auth/services/auth.service';
import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';
import { useRouter } from 'next/navigation';
import { paths } from 'src/routes/paths';
import type { AuthUser } from 'src/shared/auth/types';

type Props = {
  user: AuthUser | null;
};

export function HeaderUserButton({ user }: Props) {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    await checkUserSession?.();
    router.push(paths.auth.jwt.signIn);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatar + name */}
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-sm font-semibold leading-none">
          {user?.displayName || user?.names || 'Usuario'}
        </span>
        <span className="text-[11px] text-muted-foreground mt-0.5">{user?.email}</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={16} className="text-primary" />
        </div>

        <button
          onClick={handleSignOut}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
