'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';
import { useNavData } from 'src/shared/hooks/use-nav-data';
import { useUiStore } from 'src/store/ui.store';

import { SettingsDrawer } from '../settings';
import { LayoutSection } from './core/layout-section';
import { HeaderSection } from './dashboard/header-section';
import { HeaderUserButton } from './dashboard/header-user-button';
import { NavMobile } from './dashboard/nav-mobile';
import { NavVertical } from './dashboard/nav-vertical';

type Props = {
  children: ReactNode;
};

export function AppLayout({ children }: Props) {
  const { user, hasPermission } = useAuthContext();
  const { isMobileNavOpen, toggleMobileNav } = useUiStore();
  const pathname = usePathname();

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => {
    if (isMobileNavOpen) toggleMobileNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navData = useNavData(hasPermission, user?.permissions ?? []);

  return (
    <LayoutSection
      sidebarSection={<NavVertical navData={navData} />}
      headerSection={
        <HeaderSection
          slots={{
            left: null,
            right: (
              <div className="flex items-center gap-2">
                <SettingsDrawer />
                <HeaderUserButton user={user} />
              </div>
            ),
          }}
        />
      }
    >
      {/* Mobile Drawer */}
      <NavMobile open={isMobileNavOpen} onClose={toggleMobileNav} navData={navData} />

      {/* Contenido de la página actual */}
      {children}
    </LayoutSection>
  );
}
