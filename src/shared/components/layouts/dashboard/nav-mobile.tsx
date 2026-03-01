'use client';

import { X } from 'lucide-react';
import { NavSection, NavSectionData } from './nav-section';

type Props = {
  open: boolean;
  onClose: () => void;
  navData: NavSectionData[];
};

export function NavMobile({ open, onClose, navData }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r z-50 md:hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-[72px] flex items-center justify-between px-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">C</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">CRM System</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2">
          <NavSection data={navData} isMini={false} />
        </div>
      </aside>
    </>
  );
}
