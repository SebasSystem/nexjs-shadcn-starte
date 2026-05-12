'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Badge } from 'src/shared/components/ui/badge';
import { Button } from 'src/shared/components/ui/button';
import { Icon } from 'src/shared/components/ui/icon';
import { Input } from 'src/shared/components/ui/input';
import { SelectField } from 'src/shared/components/ui/select-field';

import { contactsService } from '../../services/contacts.service';
import type { Contact } from '../../types/contacts.types';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  company: 'bg-blue-100 text-blue-700',
  person: 'bg-emerald-100 text-emerald-700',
  government: 'bg-amber-100 text-amber-700',
};

interface ContactDetailRelationsProps {
  contacto: Contact;
  todos: Contact[];
  onAddRelacion: (aId: string, bId: string, role?: string) => Promise<void>;
  onRemoveRelacion: (aId: string, bId: string) => Promise<void>;
}

export function ContactDetailRelations({
  contacto,
  todos,
  onAddRelacion,
  onRemoveRelacion,
}: ContactDetailRelationsProps) {
  const [selectedRelId, setSelectedRelId] = useState('');
  const [linkingCargo, setLinkingCargo] = useState('');

  // Fetch relations from backend
  const { data: relations = [] } = useQuery({
    queryKey: ['relations', 'contact', contacto.uid],
    queryFn: () => contactsService.getRelations(contacto.uid),
    staleTime: 0,
  });

  const relacionIds = relations.map((r) => r.related_uid);
  const disponibles = todos.filter((c) => c.uid !== contacto.uid && !relacionIds.includes(c.uid));

  const handleAddRelacion = async () => {
    if (!selectedRelId || !contacto) return;
    await onAddRelacion(contacto.uid, selectedRelId, linkingCargo || undefined);
    setSelectedRelId('');
    setLinkingCargo('');
  };

  return (
    <div className="space-y-4">
      {relations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm text-center">
          <Icon name="Link2" className="h-8 w-8 mb-3 opacity-40" />
          <p>Sin relaciones vinculadas todavía.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {relations.map((rel) => (
            <div
              key={rel.related_uid}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={`text-xs ${AVATAR_COLORS[rel.related_type]}`}>
                    {getInitials(rel.related_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{rel.related_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {rel.related_type}
                    </Badge>
                    {rel.role && <span className="text-xs text-muted-foreground">{rel.role}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemoveRelacion(contacto.uid, rel.related_uid)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Desvincular"
              >
                <Icon name="Unlink" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link new relationship */}
      <div className="border-t border-border/40 pt-4 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Vincular entidad
        </h4>
        <SelectField
          label="Contacto o empresa"
          value={selectedRelId}
          onChange={(val) => setSelectedRelId(val as string)}
          options={disponibles.map((d) => ({ value: d.uid, label: `${d.name} (${d.type})` }))}
          placeholder="Buscar contacto o empresa..."
          searchable
        />
        <Input
          value={linkingCargo}
          onChange={(e) => setLinkingCargo(e.target.value)}
          placeholder="Cargo / rol en la relación (opcional)"
          size="sm"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddRelacion}
          disabled={!selectedRelId}
          className="w-full gap-1.5 cursor-pointer"
        >
          <Icon name="Link2" size={14} /> Vincular
        </Button>
      </div>
    </div>
  );
}
