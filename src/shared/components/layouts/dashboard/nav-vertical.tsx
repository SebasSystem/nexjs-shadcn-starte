'use client';

import { useUiStore } from 'src/store/ui.store';
import { NavSection, NavSectionData } from './nav-section';
import { Icon } from 'src/shared/components/ui';
import { ScrollArea } from 'src/shared/components/ui';

type Props = {
  navData: NavSectionData[];
};

export function NavVertical({ navData }: Props) {
  const { navLayout, setNavLayout } = useUiStore();
  const isMini = navLayout === 'mini';

  return (
    <div className="flex flex-col h-full w-full relative group/vertical">
      {/* Botón flotante para expandir/colapsar (en la línea derecha, un poco más abajo del top) */}
      <button
        onClick={() => setNavLayout(isMini ? 'vertical' : 'mini')}
        className={`
          absolute -right-3.5 top-[88px] z-50
          flex items-center justify-center cursor-pointer
          size-7 rounded-full border border-slate-200 bg-white
          text-slate-500 hover:text-indigo-600 hover:border-indigo-200
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

      {/* Logo Area */}
      <div
        className={`h-[72px] flex items-center shrink-0 ${isMini ? 'justify-center px-2' : 'justify-between px-4'}`}
      >
        <div className="flex items-center gap-2">
          {/* Logo icon (siempre visible) */}
          <div className="size-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-black text-sm">C</span>
          </div>
          {/* Texto del logo (solo en modo full) */}
          {!isMini && (
            <span className="font-semibold text-sm tracking-tight text-slate-800">CRM System</span>
          )}
        </div>
      </div>

      {/* Nav Links */}
      {/* Nav Links: contenedor restrictivo para garantizar que ScrollArea calcule bien el overflow */}
      <div className="flex-1 min-h-0 w-full relative">
        <ScrollArea
          className={`h-full w-full ${isMini ? '[&_[data-slot=scroll-area-scrollbar]]:hidden' : ''}`}
        >
          <div className={`w-full overflow-hidden pb-6 pt-3 ${isMini ? 'px-2' : 'px-4'}`}>
            <NavSection data={navData} isMini={isMini} />
          </div>
        </ScrollArea>
      </div>

      {/* Footer del sidebar */}
      <div
        className={`h-14 border-t border-slate-100 flex items-center px-3 shrink-0 ${isMini ? 'justify-center' : 'gap-3'}`}
      >
        <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-inner">
          <span className="text-[12px] font-bold">A</span>
        </div>
        {!isMini && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-800 truncate leading-tight">
              Admin System
            </span>
            <span className="text-[11px] text-slate-500 truncate">admin@gmail.com</span>
          </div>
        )}
      </div>
    </div>
  );
}
