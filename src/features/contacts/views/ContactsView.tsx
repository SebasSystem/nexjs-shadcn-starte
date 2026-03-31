'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageContainer, PageHeader, SectionCard } from 'src/shared/components/layouts/page';
import { Button } from 'src/shared/components/ui/button';
import { Input } from 'src/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/shared/components/ui/select';
import { useContacts } from '../hooks/use-contacts';
import { ContactsTable } from '../components/contacts-table';
import { ContactDrawer } from '../components/contact-drawer';
import { ContactDetailDrawer } from '../components/contact-detail-drawer';
import type { Contacto, TipoEntidad, ContactoForm } from '../types/contacts.types';

const TABS: { value: 'ALL' | TipoEntidad; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'B2B', label: 'Empresas (B2B)' },
  { value: 'B2C', label: 'Personas (B2C)' },
  { value: 'B2G', label: 'Instituciones (B2G)' },
];

export const ContactsView = () => {
  const {
    contactos,
    isLoading,
    createContacto,
    updateContacto,
    addRelacion,
    removeRelacion,
    deleteContacto,
  } = useContacts();

  const [tab, setTab] = useState<'ALL' | TipoEntidad>('ALL');
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null);

  const empresas = useMemo(() => contactos.filter((c) => c.tipo === 'B2B'), [contactos]);

  const filtered = useMemo(() => {
    return contactos.filter((c) => {
      const matchTab = tab === 'ALL' || c.tipo === tab;
      const matchEstado = filterEstado === 'ALL' || c.estado === filterEstado;
      const matchSearch =
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchEstado && matchSearch;
    });
  }, [contactos, tab, search, filterEstado]);

  const counts = useMemo(
    () => ({
      ALL: contactos.length,
      B2B: contactos.filter((c) => c.tipo === 'B2B').length,
      B2C: contactos.filter((c) => c.tipo === 'B2C').length,
      B2G: contactos.filter((c) => c.tipo === 'B2G').length,
    }),
    [contactos]
  );

  const handleOpenNew = () => {
    setSelectedContacto(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (c: Contacto) => {
    setSelectedContacto(c);
    setIsDetailOpen(false);
    setIsDrawerOpen(true);
  };

  const handleViewDetail = (c: Contacto) => {
    setSelectedContacto(c);
    setIsDetailOpen(true);
  };

  const handleSave = async (form: ContactoForm): Promise<boolean> => {
    if (selectedContacto) return updateContacto(selectedContacto.id, form);
    return createContacto(form);
  };

  // Sync selectedContacto with latest data after mutations
  const currentContacto = selectedContacto
    ? (contactos.find((c) => c.id === selectedContacto.id) ?? selectedContacto)
    : null;

  return (
    <PageContainer>
      <PageHeader
        title="Directorio CRM"
        subtitle="Gestiona empresas, personas e instituciones de tu base comercial"
        action={
          <Button color="primary" onClick={handleOpenNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo contacto
          </Button>
        }
      />

      {/* Tabs de tipo */}
      <div className="flex gap-1 border-b border-border/40">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === value
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab === value ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
              }`}
            >
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      <SectionCard noPadding>
        <div className="flex flex-col sm:flex-row gap-3 items-center px-5 py-4">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1 max-w-sm"
          />
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="PROSPECTO">Prospecto</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-4 p-5 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/40 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          <>
            <ContactsTable
              contactos={filtered}
              onEdit={handleEdit}
              onViewDetail={handleViewDetail}
              onDelete={(c) => deleteContacto(c.id)}
            />
            <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
              {filtered.length} contacto{filtered.length !== 1 ? 's' : ''}
              {tab !== 'ALL' && ` · ${TABS.find((t) => t.value === tab)?.label}`}
            </div>
          </>
        )}
      </SectionCard>

      <ContactDrawer
        key={isDrawerOpen ? (selectedContacto?.id ?? 'new') : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        contacto={selectedContacto}
        empresas={empresas}
        onSave={handleSave}
      />

      <ContactDetailDrawer
        contacto={currentContacto}
        todos={contactos}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onAddRelacion={addRelacion}
        onRemoveRelacion={removeRelacion}
      />
    </PageContainer>
  );
};
