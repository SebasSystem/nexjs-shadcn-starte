'use client';

import { useState } from 'react';
import { Pencil, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import type { Rol } from '../../types/settings.types';

interface RolesTableProps {
  roles: Rol[];
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
}

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShieldCheck className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No hay roles configurados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[22%]">
              Rol
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[28%]">
              Descripción
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[30%]">
              Módulos con acceso
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
              Usuarios
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[10%]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr
              key={rol.id}
              className="border-b border-border/20 hover:bg-muted/40 transition-colors"
              onMouseEnter={() => setHoveredRow(rol.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-body2">{rol.nombre}</p>
                  {rol.esDefecto && (
                    <Badge variant="soft" color="default" className="text-xs">
                      Por defecto
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <p className="text-body2 text-muted-foreground truncate max-w-[220px]">
                  {rol.descripcion}
                </p>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {rol.permisos.slice(0, 3).map((p) => (
                    <Badge key={p.moduloId} variant="outline" className="text-xs">
                      {p.moduloNombre}
                    </Badge>
                  ))}
                  {rol.permisos.length > 3 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{rol.permisos.length - 3}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="font-medium text-foreground">{rol.totalUsuarios}</span>
              </td>
              <td className="py-3 px-4">
                <div
                  className={`flex items-center gap-1 transition-opacity ${hoveredRow === rol.id ? 'opacity-100' : 'opacity-0'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(rol)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(rol)}>
                        Editar permisos
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(rol)}
                        disabled={rol.esDefecto || rol.totalUsuarios > 0}
                      >
                        Eliminar rol
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
