'use client';

import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';

interface TenantAvatarProps {
  nombre: string | null;
  className?: string;
  fallbackClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-sm' };

function getInitials(nombre: string | null): string {
  if (!nombre) return 'T';
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function TenantAvatar({
  nombre,
  className,
  fallbackClassName,
  size = 'md',
}: TenantAvatarProps) {
  return (
    <Avatar className={`${sizeMap[size]} shrink-0 ${className ?? ''}`}>
      <AvatarFallback className={`bg-blue-100 text-blue-700 font-bold ${fallbackClassName ?? ''}`}>
        {getInitials(nombre)}
      </AvatarFallback>
    </Avatar>
  );
}
