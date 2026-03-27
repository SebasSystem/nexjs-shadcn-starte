'use client';

import { useState } from 'react';
import { Pencil, MoreHorizontal, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/shared/components/ui/dropdown-menu';
import { UserStatusBadge } from './user-status-badge';
import type { SettingsUser } from '../../types/settings.types';

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function formatRelative(dateStr: string) {
  const diffH = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000);
  if (diffH < 1) return 'Hace menos de 1h';
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Hace ${diffD}d`;
  return `Hace ${Math.floor(diffD / 30)} mes(es)`;
}

interface UsersTableProps {
  users: SettingsUser[];
  onEdit: (user: SettingsUser) => void;
  onToggleEstado: (user: SettingsUser) => void;
  onDelete: (user: SettingsUser) => void;
}

export function UsersTable({ users, onEdit, onToggleEstado, onDelete }: UsersTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Users className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-body2">No se encontraron usuarios con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[28%]">
              Usuario
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[16%]">
              Rol
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[16%]">
              Equipo
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[16%]">
              Último acceso
            </th>
            <th className="text-left py-3 px-4 text-caption font-semibold text-muted-foreground w-[12%]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-border/20 hover:bg-muted/40 transition-colors"
              onMouseEnter={() => setHoveredRow(user.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs bg-violet-100 text-violet-700 font-semibold">
                      {getInitials(user.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-body2">{user.nombre}</p>
                    <p className="text-caption text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="text-xs">
                  {user.rolNombre}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <span className="text-body2 text-muted-foreground">{user.equipoNombre ?? '—'}</span>
              </td>
              <td className="py-3 px-4">
                <UserStatusBadge estado={user.estado} />
              </td>
              <td className="py-3 px-4">
                <span className="text-body2 text-muted-foreground">
                  {formatRelative(user.ultimoAcceso)}
                </span>
              </td>
              <td className="py-3 px-4">
                <div
                  className={`flex items-center gap-1 transition-opacity ${hoveredRow === user.id ? 'opacity-100' : 'opacity-0'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(user)}
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
                      <DropdownMenuItem onClick={() => onEdit(user)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleEstado(user)}>
                        {user.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(user)}>
                        Eliminar usuario
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
