'use client';

import { NavSectionData } from './nav-section';
import { NavVertical } from './nav-vertical';

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
        className="fixed inset-0 bg-black/50 z-40 min-[1200px]:hidden backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar z-50 min-[1200px]:hidden shadow-2xl">
        <NavVertical navData={navData} onClose={onClose} />
      </aside>
    </>
  );
}
