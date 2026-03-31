'use client';

import { useUiStore } from 'src/store/ui.store';
import { NavSection, NavSectionData } from './nav-section';
import { Icon } from 'src/shared/components/ui';
import { Scrollbar } from 'src/shared/components/Scrollbar';
import { Logo } from 'src/shared/components/Logo';

type Props = {
  navData: NavSectionData[];
  /** Si se pasa, muestra botón X (modo mobile) en lugar del botón colapsar */
  onClose?: () => void;
};

export function NavVertical({ navData, onClose }: Props) {
  const { navLayout, setNavLayout } = useUiStore();
  const isMini = !onClose && navLayout === 'mini';

  return (
    <div className="flex flex-col h-full w-full relative group/vertical">
      {/* Botón flotante colapsar/expandir (solo desktop) */}
      {!onClose && (
        <button
          onClick={() => setNavLayout(isMini ? 'vertical' : 'mini')}
          className={`
            absolute -right-3.5 top-[88px] z-50
            flex items-center justify-center cursor-pointer
            size-7 rounded-full border border-border bg-background
            text-muted-foreground hover:text-primary hover:border-primary/50
            shadow-sm transition-all duration-300 opacity-100
          `}
          title={isMini ? 'Expandir menú' : 'Contraer menú'}
        >
          {isMini ? (
            <Icon name="ChevronRight" size={14} strokeWidth={2.5} />
          ) : (
            <Icon name="ChevronLeft" size={14} strokeWidth={2.5} />
          )}
        </button>
      )}

      {/* Logo Area */}
      <div
        className={`h-[72px] flex items-center shrink-0 pt-4 ${isMini ? 'justify-center px-2' : 'justify-between px-4'}`}
      >
        <Logo variant={isMini ? 'logo' : 'full'} height={isMini ? 80 : 110} />

        {/* Botón cerrar (solo mobile) */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <Icon name="X" size={18} />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 min-h-0 w-full relative">
        {isMini ? (
          <div className="h-full w-full overflow-y-auto scrollbar-hidden">
            <div className="w-full pb-6 pt-0 px-2">
              <NavSection data={navData} isMini={isMini} />
            </div>
          </div>
        ) : (
          <Scrollbar className="h-full w-full">
            <div className="w-full overflow-hidden pb-6 pt-0 px-4">
              <NavSection data={navData} isMini={isMini} />
            </div>
          </Scrollbar>
        )}
      </div>

      {/* Footer del sidebar */}
      <div
        className={`h-14 border-t border-sidebar-border flex items-center px-3 shrink-0 ${isMini ? 'justify-center' : 'gap-3'}`}
      >
        <div className="size-8 rounded-full bg-sidebar-accent text-sidebar-foreground flex items-center justify-center shrink-0 shadow-inner">
          <span className="text-[0.75rem] font-bold">A</span>
        </div>
        {!isMini && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">
              Admin System
            </span>
            <span className="text-[0.6875rem] text-sidebar-foreground/60 truncate">
              admin@gmail.com
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
