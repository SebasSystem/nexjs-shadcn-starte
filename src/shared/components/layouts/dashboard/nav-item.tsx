'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from 'src/shared/components/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from 'src/shared/components/ui';

export type NavItemProps = {
  title: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItemProps[];
  isMini?: boolean;
  isSubItem?: boolean;
};

export function NavItem({
  title,
  path,
  icon,
  children,
  isMini = false,
  isSubItem = false,
}: NavItemProps) {
  const pathname = usePathname();

  const hasChildren = !!children?.length;

  // Para items sin hijos usamos exact match — evita que rutas padre queden
  // activas cuando se navega a un hijo (ej: /inventory activo en /inventory/products).
  // Para items con hijos también consideramos si el pathname desciende del path.
  const isDirectActive = hasChildren
    ? pathname === path || pathname.startsWith(`${path}/`)
    : pathname === path;
  const isChildActive =
    children?.some((c) => pathname === c.path || pathname.startsWith(`${c.path}/`)) ?? false;
  const isActive = isDirectActive || isChildActive;

  // Si tiene hijos y alguno está activo, expandimos por defecto
  const [open, setOpen] = useState(isChildActive);

  // Si the URL changes, we might want to expand if child becomes active
  useEffect(() => {
    if (isChildActive) {
      const timer = setTimeout(() => setOpen(true), 0);
      return () => clearTimeout(timer);
    }
  }, [isChildActive, pathname]);

  // Estilos base compartidos
  const baseClasses = `
    transition-all duration-200 group relative w-full min-w-0 outline-none cursor-pointer
    ${
      isMini
        ? 'flex flex-col items-center justify-center gap-1.5 h-[68px] rounded-xl px-1 text-[0.625rem] font-medium leading-tight' // Estilo M3-like para sidebar colapsado
        : 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium' // Estilo estándar list item
    }
    ${
      isActive && !hasChildren
        ? 'bg-primary text-primary-foreground shadow-sm'
        : isActive && hasChildren
          ? 'bg-sidebar-accent/50 text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    }
    ${isSubItem && !isMini ? 'pl-9 h-9 text-[0.8125rem] py-1.5' : ''}
  `;

  // Contenido interno del item (con ícono, título y dot/chevron)
  const innerContent = (
    <>
      {/* Contenedor del ícono para permitir absolute positioning relativos al ícono (útil si isMini) */}
      <div
        className={`relative flex items-center justify-center ${isMini ? 'w-auto' : 'shrink-0'}`}
      >
        {icon && (
          <span
            className={`size-5 ${isActive && !hasChildren ? 'text-primary-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'}`}
          >
            {icon}
          </span>
        )}

        {/* Si es subitem pero no pasaron icono, mostramos un dot */}
        {isSubItem && !icon && !isMini && (
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 mr-1 ${isActive ? 'bg-primary' : 'bg-sidebar-foreground group-hover:bg-sidebar-accent-foreground'}`}
          />
        )}

        {/* Mini flecha al lado del ícono SOLO en modo mini si tiene hijos */}
        {hasChildren && isMini && (
          <Icon
            name="ChevronRight"
            size={12}
            strokeWidth={3}
            className={`absolute -right-5 top-1/2 -translate-y-1/2 transition-colors ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'}`}
          />
        )}
      </div>

      {/* Título */}
      <span
        className={`min-w-0 break-words ${isMini ? 'w-full line-clamp-1 px-1 text-center' : 'flex-1 line-clamp-1 text-left'}`}
      >
        {title}
      </span>

      {/* Chevron de hijos (solo en modo full) */}
      {hasChildren && !isMini && (
        <Icon
          name="ChevronRight"
          size={16}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0'}`}
        />
      )}
    </>
  );

  // El render principal de este nivel
  const mainNode = hasChildren ? (
    <button type="button" onClick={() => setOpen(!open)} className={baseClasses}>
      {innerContent}
    </button>
  ) : (
    <Link href={path} className={baseClasses}>
      {innerContent}
    </Link>
  );

  // ---------------------------------------------------------------------------
  // RENDER MODO MINI (Sidebar Colapsado)
  // ---------------------------------------------------------------------------
  if (isMini) {
    if (hasChildren) {
      // Si está colapsado y tiene hijos, mostramos Tooltip al hacer hover
      // y abrimos un DropdownMenu al hacer click.
      return (
        <DropdownMenu>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>{mainNode}</DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuContent
            side="right"
            sideOffset={14}
            align="start"
            className="w-52 p-1.5 z-[100]"
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {title}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-1" />

            {children.map((child) => {
              const isChildItemActive =
                pathname === child.path || pathname.startsWith(`${child.path}/`);
              return (
                <DropdownMenuItem key={child.path} asChild className="cursor-pointer">
                  <Link
                    href={child.path}
                    className={`flex items-center gap-3 w-full min-w-0 rounded-md px-2 py-2 text-[0.8125rem] font-medium transition-colors ${
                      isChildItemActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {child.icon ? (
                      <span className="shrink-0 size-4">{child.icon}</span>
                    ) : (
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${isChildItemActive ? 'bg-primary' : 'bg-muted-foreground'}`}
                      />
                    )}
                    <span className="min-w-0 flex-1 line-clamp-1 break-words text-left">
                      {child.title}
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Si está colapsado pero NO tiene hijos, mostramos tooltip normal
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{mainNode}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER MODO VERTICAL (Sidebar Expandido)
  // ---------------------------------------------------------------------------

  // Si no tiene hijos, retornamos el nodo directamente
  if (!hasChildren) return mainNode;

  // Si tiene hijos, los renderizamos de forma anidada (Accordion)
  return (
    <div className="flex flex-col gap-0.5 w-full min-w-0">
      {mainNode}

      <div
        className={`flex flex-col gap-0.5 overflow-hidden transition-all duration-200 ${
          open ? 'max-h-[999px] opacity-100 mt-0.5' : 'max-h-0 opacity-0'
        }`}
      >
        {children.map((child) => (
          <NavItem key={child.path} {...child} isMini={isMini} isSubItem={true} />
        ))}
      </div>
    </div>
  );
}
