'use client';

import * as React from 'react';
import { ScrollArea, ScrollBar } from 'src/shared/components/ui/scroll-area';
import { cn } from 'src/lib/utils';

type ScrollbarProps = {
  children: React.ReactNode;
  className?: string;
  /** Mostrar scrollbar horizontal */
  horizontal?: boolean;
};

/**
 * Componente de scrollbar personalizado.
 * Envuelve el contenido con un ScrollArea de Shadcn para un scroll estilizado.
 */
export function Scrollbar({ children, className, horizontal = false }: ScrollbarProps) {
  return (
    <ScrollArea className={cn('h-full w-full', className)}>
      {children}
      {horizontal && <ScrollBar orientation="horizontal" />}
    </ScrollArea>
  );
}
