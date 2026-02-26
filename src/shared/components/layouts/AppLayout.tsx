import { ReactNode } from 'react';
import { useUiStore } from 'src/store/ui.store';

type Props = {
  children: ReactNode;
};

export function AppLayout({ children }: Props) {
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Skeleton */}
      <aside
        className={`bg-card border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}
      >
        <div className="h-16 border-b flex items-center justify-between px-4">
          <span className={`font-bold truncate ${!isSidebarOpen && 'hidden'}`}>CRM Dashboard</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">{/* Navegación futura */}</nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar Skeleton */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 z-10">
          <button
            onClick={toggleSidebar}
            className="p-2 border rounded-md hover:bg-muted md:hidden"
          >
            Menú
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 border rounded-md hover:bg-muted hidden md:block"
          >
            {isSidebarOpen ? 'Cerrar Menú' : 'Abrir'}
          </button>

          <div className="flex items-center gap-4">
            {/* Futuro Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/20"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
