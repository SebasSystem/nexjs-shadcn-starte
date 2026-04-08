'use client';

import * as React from 'react';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { cn } from 'src/lib/utils';

// ─── Constantes de diseño ─────────────────────────────────────────────────────
const SCROLLBAR_COLOR = '#cbd1d7';
const HIDE_DELAY_MS = 1500;

// ─── Props ────────────────────────────────────────────────────────────────────
type ScrollbarProps = {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
  /** Oculta el track del scrollbar sin ocupar espacio (ej. modo mini del nav) */
  hideBar?: boolean;
};

// ─── Componente ───────────────────────────────────────────────────────────────
export function Scrollbar({
  children,
  className,
  horizontal = false,
  hideBar = false,
}: ScrollbarProps) {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerShow = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  }, []);

  // Mostrar al montar el componente
  React.useEffect(() => {
    triggerShow();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerShow]);

  const scrollbarClass = cn(
    'touch-none select-none transition-opacity duration-300 ease-in-out',
    visible ? 'opacity-100' : 'opacity-0'
  );

  return (
    <ScrollAreaPrimitive.Root
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={triggerShow}
    >
      <ScrollAreaPrimitive.Viewport
        className="h-full w-full rounded-[inherit]"
        onScroll={triggerShow}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* Scrollbar vertical */}
      {!hideBar && (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          forceMount
          orientation="vertical"
          className={cn('flex w-2 p-px', scrollbarClass)}
        >
          <ScrollAreaPrimitive.ScrollAreaThumb
            className="relative flex-1 rounded-full"
            style={{ background: SCROLLBAR_COLOR }}
          />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
      )}

      {/* Scrollbar horizontal (opcional) */}
      {!hideBar && horizontal && (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          forceMount
          orientation="horizontal"
          className={cn('flex h-1.5 flex-col p-px', scrollbarClass)}
        >
          <ScrollAreaPrimitive.ScrollAreaThumb
            className="relative flex-1 rounded-full"
            style={{ background: SCROLLBAR_COLOR }}
          />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
      )}

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
