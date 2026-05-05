import axiosInstance, { endpoints } from 'src/lib/axios';

import type { Contact, ContactPayload, ContactRelation } from '../types/contacts.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mapAccountToCompany(raw: Record<string, unknown>): Contact {
  return {
    uid: raw.uid as string,
    type: 'company',
    name: raw.name as string,
    email: (raw.email as string) ?? '',
    phone: raw.phone as string | undefined,
    country: raw.country as string,
    city: raw.city as string | undefined,
    status: (raw.status as string) ?? 'active',
    relationships: (raw.relations as ContactRelation[]) ?? [],
    created_at: raw.created_at as string,
    tax_id: (raw.tax_id as string) ?? '',
    industry: raw.industry as string | undefined,
    company_size: raw.company_size as string | undefined,
    website: raw.website as string | undefined,
  } as Contact;
}

function mapContactToEntity(raw: Record<string, unknown>): Contact {
  const contactType = raw.type as string;
  if (contactType === 'government') {
    return {
      uid: raw.uid as string,
      type: 'government',
      name: raw.name as string,
      email: (raw.email as string) ?? '',
      phone: raw.phone as string | undefined,
      country: raw.country as string,
      city: raw.city as string | undefined,
      status: (raw.status as string) ?? 'active',
      relationships: (raw.relations as ContactRelation[]) ?? [],
      created_at: raw.created_at as string,
      institution_type: raw.institution_type as string | undefined,
      is_public_entity: (raw.is_public_entity as boolean) ?? true,
      bid_code: raw.bid_code as string | undefined,
    } as Contact;
  }

  return {
    uid: raw.uid as string,
    type: 'person',
    name: raw.name as string,
    email: (raw.email as string) ?? '',
    phone: raw.phone as string | undefined,
    country: raw.country as string,
    city: raw.city as string | undefined,
    status: (raw.status as string) ?? 'active',
    relationships: (raw.relations as ContactRelation[]) ?? [],
    created_at: raw.created_at as string,
    id_number: raw.id_number as string | undefined,
    job_title: raw.job_title as string | undefined,
    company_uid: raw.company_uid as string | undefined,
    company_name: raw.company_name as string | undefined,
  } as Contact;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const contactsService = {
  /** Fetches all contacts from /accounts (companies) and /contacts (persons + government) */
  getAll: async (): Promise<Contact[]> => {
    const [accountsRes, contactsRes] = await Promise.all([
      axiosInstance.get(endpoints.contacts.accounts.list),
      axiosInstance.get(endpoints.contacts.contacts.list),
    ]);

    const companies: Contact[] = (accountsRes.data?.data ?? accountsRes.data ?? []).map(
      mapAccountToCompany
    );
    const entities: Contact[] = (contactsRes.data?.data ?? contactsRes.data ?? []).map(
      mapContactToEntity
    );

    return [...companies, ...entities];
  },

  /** Tries /accounts/{uid} first, falls back to /contacts/{uid} */
  getById: async (uid: string): Promise<Contact | undefined> => {
    try {
      const res = await axiosInstance.get(endpoints.contacts.accounts.detail(uid));
      const data = res.data?.data ?? res.data;
      return mapAccountToCompany(data);
    } catch {
      try {
        const res = await axiosInstance.get(endpoints.contacts.contacts.detail(uid));
        const data = res.data?.data ?? res.data;
        return mapContactToEntity(data);
      } catch {
        return undefined;
      }
    }
  },

  /** Checks for duplicate email or tax_id (client-side check against existing data) */
  checkDuplicate: async (
    email: string,
    taxId?: string,
    excludeId?: string
  ): Promise<{ emailDuplicate: boolean; taxIdDuplicate: boolean }> => {
    try {
      const all = await contactsService.getAll();
      const others = all.filter((c) => c.uid !== excludeId);
      const emailDuplicate = others.some((c) => c.email.toLowerCase() === email.toLowerCase());
      const taxIdDuplicate = taxId
        ? others.some((c) => c.type === 'company' && (c as { tax_id: string }).tax_id === taxId)
        : false;
      return { emailDuplicate, taxIdDuplicate };
    } catch {
      return { emailDuplicate: false, taxIdDuplicate: false };
    }
  },

  /** Creates a contact: if type=company → /accounts, else → /contacts */
  create: async (payload: ContactPayload): Promise<Contact> => {
    if (payload.type === 'company') {
      const body = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        city: payload.city,
        status: payload.status,
        tax_id: payload.tax_id,
        industry: payload.industry,
        company_size: payload.company_size,
        website: payload.website,
      };
      const res = await axiosInstance.post(endpoints.contacts.accounts.create, body);
      const data = res.data?.data ?? res.data;
      return mapAccountToCompany(data);
    }

    const body = {
      type: payload.type,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      country: payload.country,
      city: payload.city,
      status: payload.status,
      id_number: payload.id_number,
      job_title: payload.job_title,
      company_uid: payload.company_uid,
      institution_type: payload.institution_type,
      is_public_entity: payload.is_public_entity,
      bid_code: payload.bid_code,
    };
    const res = await axiosInstance.post(endpoints.contacts.contacts.create, body);
    const data = res.data?.data ?? res.data;
    return mapContactToEntity(data);
  },

  /** Updates a contact: routes to /accounts or /contacts based on type */
  update: async (uid: string, payload: Partial<ContactPayload>): Promise<Contact> => {
    if (payload.type === 'company') {
      const body = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        city: payload.city,
        status: payload.status,
        tax_id: payload.tax_id,
        industry: payload.industry,
        company_size: payload.company_size,
        website: payload.website,
      };
      const res = await axiosInstance.put(endpoints.contacts.accounts.update(uid), body);
      const data = res.data?.data ?? res.data;
      return mapAccountToCompany(data);
    }

    try {
      const body = {
        type: payload.type,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        city: payload.city,
        status: payload.status,
        id_number: payload.id_number,
        job_title: payload.job_title,
        company_uid: payload.company_uid,
        institution_type: payload.institution_type,
        is_public_entity: payload.is_public_entity,
        bid_code: payload.bid_code,
      };
      const res = await axiosInstance.put(endpoints.contacts.contacts.update(uid), body);
      const data = res.data?.data ?? res.data;
      return mapContactToEntity(data);
    } catch {
      // Fallback: maybe it's an account
      const body = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        city: payload.city,
        status: payload.status,
      };
      const res = await axiosInstance.put(endpoints.contacts.accounts.update(uid), body);
      const data = res.data?.data ?? res.data;
      return mapAccountToCompany(data);
    }
  },

  /** Tries both /accounts/{uid} and /contacts/{uid} for deletion */
  delete: async (uid: string): Promise<void> => {
    try {
      await axiosInstance.delete(endpoints.contacts.accounts.delete(uid));
    } catch {
      await axiosInstance.delete(endpoints.contacts.contacts.delete(uid));
    }
  },

  /**
   * Relations — uses the backend /relations endpoint.
   * Creates a bidirectional relationship between two entities.
   */
  addRelacion: async (entityAUid: string, entityBUid: string, role?: string): Promise<void> => {
    await axiosInstance.post('/relations', {
      parent_type: 'contact',
      parent_uid: entityAUid,
      child_type: 'contact',
      child_uid: entityBUid,
      role: role ?? null,
    });
  },

  /** Removes a relationship between two entities */
  removeRelacion: async (entityAUid: string, entityBUid: string): Promise<void> => {
    // Try deleting by finding the relation first, or attempt a direct DELETE
    try {
      const res = await axiosInstance.get(`/relations/contact/${entityAUid}`);
      const relations = res.data?.data ?? res.data ?? [];
      const match = (relations as Record<string, unknown>[]).find(
        (r) => r.child_uid === entityBUid || r.parent_uid === entityBUid
      );
      if (match?.uid) {
        await axiosInstance.delete(`/relations/${match.uid}`);
      }
    } catch {
      // Ignore — relation might not exist
    }
  },
};
