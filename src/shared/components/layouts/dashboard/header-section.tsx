'use client';

import { ReactNode } from 'react';
import { Icon } from 'src/shared/components/ui';
import { useUiStore } from 'src/store/ui.store';

type Props = {
  children?: ReactNode;
  slots?: {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
  };
};

export function HeaderSection({ slots }: Props) {
  const { toggleMobileNav } = useUiStore();

  return (
    <div className="flex items-center justify-between w-full h-full px-4 gap-4">
      {/* Left: Hamburger (solo mobile) + slot izquierdo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileNav}
          className="min-[1200px]:hidden p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Icon name="Menu" size={20} />
        </button>
        {slots?.left}
      </div>

      {/* Center */}
      {slots?.center && (
        <div className="flex-1 flex items-center justify-center">{slots.center}</div>
      )}

      {/* Right */}
      {slots?.right && <div className="flex items-center gap-2">{slots.right}</div>}
    </div>
  );
}
