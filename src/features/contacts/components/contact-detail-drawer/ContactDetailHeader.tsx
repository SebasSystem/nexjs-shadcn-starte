'use client';

import React from 'react';
import { Avatar, AvatarFallback } from 'src/shared/components/ui/avatar';
import { Button } from 'src/shared/components/ui/button';

import type { Contact } from '../../types/contacts.types';
import { ContactStatusBadge } from '../contact-status-badge';
import { EntityTypeBadge } from '../entity-type-badge';

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

interface ContactDetailHeaderProps {
  contacto: Contact;
  onClose: () => void;
  onEdit: (c: Contact) => void;
}

export function ContactDetailHeader({ contacto, onClose, onEdit }: ContactDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b shrink-0 bg-muted/30">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarFallback className={`text-lg font-bold ${AVATAR_COLORS[contacto.type]}`}>
            {getInitials(contacto.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">{contacto.name}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <EntityTypeBadge type={contacto.type} />
            <ContactStatusBadge status={contacto.status} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(contacto)}
          className="h-8 text-xs cursor-pointer"
        >
          Editar
        </Button>
        <button
          onClick={onClose}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
