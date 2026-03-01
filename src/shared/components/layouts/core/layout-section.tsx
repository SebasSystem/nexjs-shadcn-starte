import { ReactNode } from 'react';
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

  return (
    <div
      className={`fixed inset-0 flex w-full h-[100dvh] overflow-hidden bg-background text-foreground ${layoutClasses.root}`}
    >
      {/* Sidebar Area */}
      {sidebarSection && (
        <aside
          className={`
            transition-all duration-300 hidden md:flex flex-col z-20 border-r
            bg-sidebar text-sidebar-foreground border-sidebar-border
            ${navColor === 'dark' ? 'sidebar-dark' : ''}
            ${isNavMini ? 'w-[88px]' : 'w-[280px]'}
            ${layoutClasses.nav.root}
          `}
        >
          {sidebarSection}
        </aside>
      )}

      {/* Main Container Area */}
      <div className={`flex flex-1 flex-col overflow-hidden w-full ${layoutClasses.content}`}>
        {/* Header Area */}
        {headerSection && (
          <header
            className={`h-[64px] bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center px-4 z-10 sticky top-0 w-full ${layoutClasses.header}`}
          >
            {headerSection}
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">{children}</main>

        {/* Footer Area */}
        {footerSection}
      </div>
    </div>
  );
}
