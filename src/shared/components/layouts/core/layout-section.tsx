'use client';

import { ReactNode, useRef, useState, useCallback } from 'react';
import { useUiStore } from 'src/store/ui.store';
import { layoutClasses } from './classes';

type Props = {
  children: ReactNode;
  headerSection?: ReactNode;
  sidebarSection?: ReactNode;
  footerSection?: ReactNode;
};

export function LayoutSection({ children, headerSection, sidebarSection, footerSection }: Props) {
  const { navLayout, navColor } = useUiStore();

  const isNavMini = navLayout === 'mini';
  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  // Throttle con rAF: evita "forced reflow" al leer scrollTop síncronamente
  // en cada evento de scroll. El browser lee scrollTop en el próximo frame,
  // cuando el layout ya está calculado, eliminando el reflow forzado.
  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return; // ya hay un frame pendiente, skip
    rafRef.current = requestAnimationFrame(() => {
      if (mainRef.current) {
        setIsScrolled(mainRef.current.scrollTop > 10);
      }
      rafRef.current = null;
    });
  }, []);

  return (
    <div
      className={`fixed inset-0 flex w-full h-[100dvh] overflow-hidden bg-background text-foreground ${layoutClasses.root}`}
    >
      {/* Sidebar Area */}
      {sidebarSection && (
        <aside
          className={`
            transition-all duration-300 flex max-[1199px]:hidden shrink-0 flex-col z-20 border-r
            bg-sidebar text-sidebar-foreground border-sidebar-border
            ${navColor === 'dark' ? 'sidebar-dark' : ''}
            ${isNavMini ? 'w-[88px]' : 'w-[280px]'}
            ${layoutClasses.nav.root}
          `}
        >
          {sidebarSection}
        </aside>
      )}

      {/* Main Container Area: flex column, fills remaining space */}
      <div className={`flex flex-1 flex-col min-h-0 min-w-0 ${layoutClasses.content}`}>
        {/* Content Area — the ONLY scroll container */}
        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-hidden overflow-y-auto min-h-0 min-w-0"
        >
          {/* Header floats over content using sticky inside the scroll container */}
          {headerSection && (
            <header
              className={`
                h-[72px] sticky top-0 z-10 flex items-center px-4 w-full
                transition-[background-color,backdrop-filter] duration-200
                ${isScrolled ? 'bg-background/80 backdrop-blur-xs' : 'bg-transparent'}
                ${layoutClasses.header}
              `}
            >
              {headerSection}
            </header>
          )}

          {/* Page content */}
          {children}
        </main>

        {/* Footer Area */}
        {footerSection}
      </div>
    </div>
  );
}
