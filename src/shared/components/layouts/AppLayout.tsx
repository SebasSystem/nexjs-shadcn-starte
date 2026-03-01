'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUiStore } from 'src/store/ui.store';
import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';
import { useNavData, BackendModule } from 'src/shared/hooks/use-nav-data';
import { NavVertical } from './dashboard/nav-vertical';
import { HeaderSection } from './dashboard/header-section';
import { LayoutSection } from './core/layout-section';
import { NavMobile } from './dashboard/nav-mobile';
import { HeaderUserButton } from './dashboard/header-user-button';
import { SettingsDrawer } from '../settings';

type Props = {
  children: ReactNode;
};

export function AppLayout({ children }: Props) {
  const { user } = useAuthContext();
  const { isMobileNavOpen, toggleMobileNav } = useUiStore();
  const pathname = usePathname();

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => {
    if (isMobileNavOpen) toggleMobileNav();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Transformar módulos del usuario en nav data
  const navData = useNavData(user?.modules as BackendModule[]);

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
