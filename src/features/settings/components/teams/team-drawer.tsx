'use client';

import React, { useState } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { Button } from 'src/shared/components/ui/button';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import type { Equipo, SettingsUser } from '../../types/settings.types';

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface TeamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  usuarios: SettingsUser[];
  onSave: (
    data: Omit<Equipo, 'id' | 'creadoEn' | 'totalMiembros' | 'miembros'>
  ) => Promise<boolean>;
  onAddMember: (equipoId: string, usuarioId: string) => void;
  onRemoveMember: (equipoId: string, usuarioId: string) => void;
}

export const TeamDrawer: React.FC<TeamDrawerProps> = ({
  isOpen,
  onClose,
  equipo,
  usuarios,
  onSave,
  onAddMember,
  onRemoveMember,
}) => {
  const [nombre, setNombre] = useState(equipo?.nombre ?? '');
  const [liderId, setLiderId] = useState(equipo?.liderId ?? '');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim() || !liderId) return;
    const lider = usuarios.find((u) => u.id === liderId);
    setIsSubmitting(true);
    const success = await onSave({
      nombre,
      liderId,
      liderNombre: lider?.nombre ?? '',
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  const handleAddMember = () => {
    if (!selectedUserId || !equipo) return;
    const user = usuarios.find((u) => u.id === selectedUserId);
    if (!user) return;
    onAddMember(equipo.id, selectedUserId);
    setSelectedUserId('');
  };

  const memberIds = equipo?.miembros.map((m) => m.usuarioId) ?? [];
  const availableUsers = usuarios.filter((u) => !memberIds.includes(u.id) && u.estado === 'ACTIVO');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold">{equipo ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
            <p className="text-sm text-gray-500 mt-1">Configura el equipo y sus miembros</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nombre del equipo *</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
              placeholder="Ej. Equipo Norte"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Líder del equipo *</label>
            <select
              value={liderId}
              onChange={(e) => setLiderId(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="">-- Seleccionar líder --</option>
              {usuarios
                .filter((u) => u.estado === 'ACTIVO')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.rolNombre})
                  </option>
                ))}
            </select>
          </div>

          {equipo && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Miembros</h3>

              {equipo.miembros.length > 0 ? (
                <div className="space-y-2">
                  {equipo.miembros.map((miembro) => (
                    <div
                      key={miembro.usuarioId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {getInitials(miembro.usuarioNombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{miembro.usuarioNombre}</p>
                        <p className="text-xs text-gray-500">
                          {miembro.rolNombre} · {miembro.clientesAsignados} clientes
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveMember(equipo.id, miembro.usuarioId)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin miembros todavía.</p>
              )}

              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 h-9 px-3 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="">Agregar miembro...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  className="gap-1.5 h-9"
                >
                  <UserPlus size={14} /> Agregar
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 shrink-0 flex justify-end gap-3 bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!nombre.trim() || !liderId || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Equipo'}
          </Button>
        </div>
      </div>
    </>
  );
};
