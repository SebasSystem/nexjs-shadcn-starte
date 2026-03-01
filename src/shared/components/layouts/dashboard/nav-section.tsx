'use client';

import { useState } from 'react';
import { Icon } from 'src/shared/components/ui';
import { cn } from 'src/lib/utils';
import { NavItem, NavItemProps } from './nav-item';

export type NavSectionData = {
  subheader: string;
  items: NavItemProps[];
  defaultOpen?: boolean;
};

type Props = {
  data: NavSectionData[];
  isMini?: boolean;
};

// ─── Sección colapsable individual ───────────────────────────────────────────
function CollapsibleSection({ section, isMini }: { section: NavSectionData; isMini: boolean }) {
  // "General" siempre abierto; el resto empieza abierto por defecto también (puedes cambiar a false)
  const [open, setOpen] = useState(section.defaultOpen ?? true);

  return (
    <div className="flex flex-col w-full min-w-0">
      {/* Subheader / trigger — solo visible en modo vertical */}
      {!isMini && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex items-center justify-start gap-1 w-full min-w-0',
            'px-2 pt-4 pb-1',
            'text-[11px] font-semibold uppercase tracking-widest',
            'text-muted-foreground/60 hover:text-muted-foreground',
            'transition-colors duration-150 select-none group focus:outline-none'
          )}
        >
          <Icon
            name="ChevronDown"
            size={14}
            className={cn(
              'shrink-0 transition-all duration-200 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0',
              !open && '-rotate-90'
            )}
          />
          <span className="min-w-0 flex-1 line-clamp-1 break-words text-left">
            {section.subheader}
          </span>
        </button>
      )}

      {/* Separador en modo mini */}
      {isMini && <div className="mx-auto w-6 border-t border-border/60 my-2" />}

      {/* Items — con animación de altura */}
      <div
        className={cn(
          'flex flex-col gap-0.5 overflow-hidden transition-all duration-200',
          open ? 'max-h-[999px] opacity-100' : 'max-h-0 opacity-0',
          isMini && 'max-h-[999px] opacity-100' // en mini siempre visible
        )}
      >
        {section.items.map((item) => (
          <NavItem key={item.path} {...item} isMini={isMini} />
        ))}
      </div>
    </div>
  );
}

// ─── NavSection principal ─────────────────────────────────────────────────────
export function NavSection({ data, isMini = false }: Props) {
  if (!data?.length) return null;

  return (
    <nav className="flex flex-col gap-1 w-full min-w-0">
      {data.map((section) => (
        <CollapsibleSection key={section.subheader} section={section} isMini={isMini} />
      ))}
    </nav>
  );
}
