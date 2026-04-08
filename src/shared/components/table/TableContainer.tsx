'use client';

import * as React from 'react';
import { cn } from 'src/lib/utils';

const SCROLL_END_DELAY_MS = 200; // tiempo sin eventos scroll para considerar que paró
const HIDE_DELAY_MS = 1500; // tiempo después de parar antes de desvanecer

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TableContainer({ children, className }: TableContainerProps) {
  const [visible, setVisible] = React.useState(false);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollEndTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = React.useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  }, []);

  const handleScroll = React.useCallback(() => {
    // Cancelar cualquier temporizador de ocultamiento pendiente
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    setVisible(true);
    // Cuando no haya eventos de scroll por SCROLL_END_DELAY_MS, programar el ocultamiento
    scrollEndTimerRef.current = setTimeout(scheduleHide, SCROLL_END_DELAY_MS);
  }, [scheduleHide]);

  const handleMouseEnter = React.useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    setVisible(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  // Mostrar al montar
  React.useEffect(() => {
    setVisible(true);
    hideTimerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        'table-container overflow-x-auto w-full',
        visible && 'scrollbar-visible',
        className
      )}
      onScroll={handleScroll}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
