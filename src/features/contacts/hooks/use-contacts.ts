'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from 'src/lib/api-errors';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { queryKeys } from 'src/lib/query-keys';
import { usePaginationParams } from 'src/shared/hooks/use-pagination';
import { extractPaginationMeta } from 'src/shared/lib/pagination';

import { contactsService } from '../services/contacts.service';
import type { Contact, ContactPayload, ContactType } from '../types/contacts.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — module-level (owned by the hook, exported for component reuse)
// ─────────────────────────────────────────────────────────────────────────────

/** Resolves which API section to use based on contact type */
const resolveApi = (type: ContactType): 'accounts' | 'contacts' =>
  type === 'company' ? 'accounts' : 'contacts';

/** Builds payload for /accounts (company — B2B) */
export function buildCompanyPayload(form: ContactPayload): Record<string, unknown> {
  return {
    name: form.name,
    email: form.email,
    phone: form.phone,
    country: form.country,
    city: form.city,
    status: form.status,
    tax_id: form.tax_id,
    industry: form.industry,
    company_size: form.company_size,
    website: form.website,
  };
}

/** Builds payload for /contacts (person or government — B2C/B2G) */
export function buildContactPayload(form: ContactPayload): Record<string, unknown> {
  return {
    type: form.type,
    name: form.name,
    email: form.email,
    phone: form.phone,
    country: form.country,
    city: form.city,
    status: form.status,
    id_number: form.id_number,
    job_title: form.job_title,
    company_uid: form.company_uid,
    institution_type: form.institution_type,
    is_public_entity: form.is_public_entity,
    bid_code: form.bid_code,
  };
}

/** Builds the correct payload based on contact type */
export function buildPayload(form: ContactPayload): Record<string, unknown> {
  return form.type === 'company' ? buildCompanyPayload(form) : buildContactPayload(form);
}

/** Maps snake_case duplicate-check response to camelCase */
export function mapDuplicateCheckResponse(raw: Record<string, unknown>): {
  emailDuplicate: boolean;
  taxIdDuplicate: boolean;
} {
  return {
    emailDuplicate: (raw.email_duplicate as boolean) ?? false,
    taxIdDuplicate: (raw.tax_id_duplicate as boolean) ?? false,
  };
}

/**
 * Checks for duplicate email or tax_id.
 * Thin wrapper around the service — mapping happens here.
 */
export async function checkDuplicate(
  email: string,
  taxId?: string,
  excludeUid?: string
): Promise<{ emailDuplicate: boolean; taxIdDuplicate: boolean }> {
  const raw = await contactsService.checkDuplicate({
    email,
    tax_id: taxId ?? null,
    exclude_uid: excludeUid ?? null,
  });
  return mapDuplicateCheckResponse(raw as Record<string, unknown>);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useContacts() {
  const queryClient = useQueryClient();
  const pagination = usePaginationParams();

  // ── Merge de /accounts + /contacts ──────────────────────────────────────
  // La lógica de merge vive en el hook, no en el servicio. El servicio solo
  // llama al endpoint correcto y retorna la respuesta raw.

  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    queryKey: [...queryKeys.contacts.list, 'company', pagination.params],
    queryFn: () => contactsService.accounts.list(pagination.params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const { data: contactsData, isLoading: isLoadingContacts } = useQuery({
    queryKey: [...queryKeys.contacts.list, 'contact', pagination.params],
    queryFn: () => contactsService.contacts.list(pagination.params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const companies = ((accountsData as Record<string, unknown>)?.data ?? []) as Contact[];
  const persons = ((contactsData as Record<string, unknown>)?.data ?? []) as Contact[];

  // Merge both arrays and extract pagination meta from accounts response
  const contactos: Contact[] = [...companies, ...persons];

  const isLoading = isLoadingAccounts || isLoadingContacts;

  // Derive pagination from accounts response (dominant endpoint for totals)
  const accountsMeta = (accountsData as Record<string, unknown>)?.meta;
  if (accountsMeta) {
    const meta = extractPaginationMeta(accountsMeta);
    if (meta) pagination.setTotal(meta.total);
  }

  // ── Create ───────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (form: ContactPayload) => {
      const api = resolveApi(form.type);
      const payload = buildPayload(form);
      return contactsService[api].create(payload) as Promise<Contact>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
      toast.success('Contacto creado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  // ── Update ───────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async ({ uid, form }: { uid: string; form: Partial<ContactPayload> }) => {
      const api = resolveApi(form.type as ContactType);
      const payload = buildPayload(form as ContactPayload);
      return contactsService[api].update(uid, payload) as Promise<Contact>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
      toast.success('Contacto actualizado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  // ── Delete — resolves type from cached data ────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (uid: string) => {
      // Look up the contact in the merged list to determine its type
      const found = contactos.find((c) => c.uid === uid);
      const api = found ? resolveApi(found.type) : 'contacts';
      // TODO: if found is undefined (race condition / cache miss),
      // we can't reliably know the endpoint. Consider passing type
      // from the caller if this becomes an issue.
      await contactsService[api].delete(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
      toast.success('Contacto eliminado correctamente');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  // ── Relations — add (already thin) ──────────────────────────────────────

  const addRelacionMutation = useMutation({
    mutationFn: ({ aId, bId, role }: { aId: string; bId: string; role?: string }) =>
      contactsService.addRelacion(aId, bId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  // ── Relations — remove (orquestración: GET → find match → DELETE) ───────

  const removeRelacionMutation = useMutation({
    mutationFn: async ({ aId, bId }: { aId: string; bId: string }) => {
      const res = await axiosInstance.get(endpoints.relations.byEntity('contact', aId));
      const relations = res.data?.data ?? res.data ?? [];
      const match = (relations as Record<string, unknown>[]).find(
        (r) => r.child_uid === bId || r.parent_uid === bId
      );
      if (match?.uid) {
        await axiosInstance.delete(endpoints.relations.delete(match.uid as string));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list });
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  // ── Public API wrappers ─────────────────────────────────────────────────

  const createContacto = async (form: ContactPayload): Promise<boolean> => {
    await createMutation.mutateAsync(form);
    return true;
  };

  const updateContacto = async (uid: string, form: Partial<ContactPayload>): Promise<boolean> => {
    await updateMutation.mutateAsync({ uid, form });
    return true;
  };

  const addRelacion = async (aId: string, bId: string, role?: string): Promise<void> => {
    await addRelacionMutation.mutateAsync({ aId, bId, role });
  };

  const removeRelacion = async (aId: string, bId: string): Promise<void> => {
    await removeRelacionMutation.mutateAsync({ aId, bId });
  };

  const deleteContacto = async (uid: string): Promise<void> => {
    await deleteMutation.mutateAsync(uid);
  };

  return {
    contactos,
    isLoading,
    createContacto,
    updateContacto,
    addRelacion,
    removeRelacion,
    deleteContacto,
    checkDuplicate,
    refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.contacts.list }),
    pagination: {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      total: pagination.total,
      onChangePage: pagination.onChangePage,
      onChangeRowsPerPage: pagination.onChangeRowsPerPage,
    },
  };
}
