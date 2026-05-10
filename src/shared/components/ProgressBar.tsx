'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { Suspense } from 'react';

// ─── Barra interna — necesita Suspense por useSearchParams ────────────────────
function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const isRunningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setBarWidth = useCallback((pct: number, opacity = 1) => {
    if (!barRef.current) return;
    barRef.current.style.width = `${pct}%`;
    barRef.current.style.opacity = String(opacity);
  }, []);

  const startProgress = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    progressRef.current = 5;
    setBarWidth(5, 1);

    const tick = () => {
      if (!isRunningRef.current) return;
      // Incremento decelerado: avanza rápido al principio, lento al final
      const remaining = 90 - progressRef.current;
      const increment = remaining * 0.08 + 0.5;
      progressRef.current = Math.min(progressRef.current + increment, 90);
      setBarWidth(progressRef.current, 1);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    // Pequeño delay inicial para que no parpadee en páginas rápidas
    timerRef.current = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(tick);
    }, 150);
  }, [setBarWidth]);

  const finishProgress = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    isRunningRef.current = false;
    progressRef.current = 100;
    setBarWidth(100, 1);

    // Fade out después de completar
    setTimeout(() => {
      setBarWidth(100, 0);
      setTimeout(() => {
        progressRef.current = 0;
        setBarWidth(0, 0);
      }, 300);
    }, 200);
  }, [setBarWidth]);

  // Arrancar la barra al iniciar navegación (click en Link)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (!target) return;
      const href = target.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('blob:') ||
        href.startsWith('mailto')
      )
        return;
      // Solo iniciar si es una ruta diferente a la actual
      if (href !== pathname) startProgress();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, startProgress]);

  // Completar la barra cuando el pathname/searchParams cambian (navegación lista)
  useEffect(() => {
    finishProgress();
  }, [pathname, searchParams, finishProgress]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        pointerEvents: 'none',
        height: '2px',
      }}
    >
      <div
        ref={barRef}
        style={{
          height: '100%',
          width: '0%',
          opacity: 0,
          background: 'linear-gradient(90deg, #818cf8, #a5b4fc)',
          boxShadow: '0 0 6px rgba(129, 140, 248, 0.5)',
          transition: 'width 0.2s ease, opacity 0.25s ease',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
}

// ─── Wrapper público con Suspense obligatorio para App Router ─────────────────
export function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
