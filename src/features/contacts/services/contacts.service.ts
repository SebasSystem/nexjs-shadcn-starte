import axiosInstance, { endpoints } from 'src/lib/axios';
import { type PaginationParams } from 'src/shared/lib/pagination';

import type { Contact, ContactPayload } from '../types/contacts.types';

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const contactsService = {
  /** Fetches all contacts from /accounts (companies) and /contacts (persons + government) */
  getAll: async (params?: PaginationParams): Promise<Contact[]> => {
    const [accountsRes, contactsRes] = await Promise.all([
      axiosInstance.get(endpoints.contacts.accounts.list, { params }),
      axiosInstance.get(endpoints.contacts.contacts.list, { params }),
    ]);

    const companies = (accountsRes.data?.data ?? accountsRes.data ?? []) as Contact[];
    const entities = (contactsRes.data?.data ?? contactsRes.data ?? []) as Contact[];

    // Return merged array with meta from accounts response attached
    const merged = [...companies, ...entities] as Contact[] & { meta?: Record<string, unknown> };
    merged.meta = accountsRes.data?.meta;
    return merged;
  },

  /** Tries /accounts/{uid} first, falls back to /contacts/{uid} */
  getById: async (uid: string): Promise<Contact | undefined> => {
    try {
      const res = await axiosInstance.get(endpoints.contacts.accounts.detail(uid));
      return (res.data?.data ?? res.data) as Contact;
    } catch {
      try {
        const res = await axiosInstance.get(endpoints.contacts.contacts.detail(uid));
        return (res.data?.data ?? res.data) as Contact;
      } catch {
        return undefined;
      }
    }
  },

  /** Checks for duplicate email or tax_id via backend POST /contacts/check-duplicate */
  checkDuplicate: async (
    email: string,
    taxId?: string,
    excludeUid?: string
  ): Promise<{ emailDuplicate: boolean; taxIdDuplicate: boolean }> => {
    try {
      const res = await axiosInstance.post(endpoints.contacts.checkDuplicate, {
        email,
        tax_id: taxId ?? null,
        exclude_uid: excludeUid ?? null,
      });
      const data = res.data?.data ?? res.data;
      return {
        emailDuplicate: data.email_duplicate ?? false,
        taxIdDuplicate: data.tax_id_duplicate ?? false,
      };
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
      return (res.data?.data ?? res.data) as Contact;
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
    return (res.data?.data ?? res.data) as Contact;
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
      return (res.data?.data ?? res.data) as Contact;
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
      return (res.data?.data ?? res.data) as Contact;
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
      return (res.data?.data ?? res.data) as Contact;
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
