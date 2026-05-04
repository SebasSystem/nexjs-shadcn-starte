'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'src/features/auth/services/auth.service';
import { cn } from 'src/lib/utils';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';
import type { AuthUser } from 'src/shared/auth/types';
import { Icon } from 'src/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui';

type Props = {
  user: AuthUser | null;
};

// Genera iniciales a partir del nombre
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function HeaderUserButton({ user }: Props) {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    await checkUserSession?.();
    router.push(paths.auth.jwt.signIn);
  };

  const displayName = user?.name || 'Usuario';
  const email = user?.email ?? '';
  const initials = getInitials(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-xl',
            'hover:bg-accent transition-colors duration-200 outline-none cursor-pointer',
            'focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          {/* Info text (solo sm+) */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold leading-none text-foreground">
              {displayName}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 leading-none">{email}</span>
          </div>

          {/* Avatar */}
          <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-primary/20 shadow-sm">
            <span className="text-[12px] font-bold text-primary-foreground">{initials}</span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-52 shadow-8">
        <DropdownMenuLabel className="font-normal pb-2">
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer text-muted-foreground">
          <Icon name="User" size={15} />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer text-muted-foreground">
          <Icon name="Settings" size={15} />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Icon name="LogOut" size={15} />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
