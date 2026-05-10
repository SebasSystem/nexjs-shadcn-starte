import type {
  DocumentType,
  DocumentTypePayload,
} from 'src/features/settings/types/document-type.types';
import axiosInstance, { endpoints } from 'src/lib/axios';

export const documentTypeService = {
  async list(params?: { search?: string }): Promise<DocumentType[]> {
    const res = await axiosInstance.get(endpoints.documentTypes, { params });
    return res.data.data;
  },

  async create(payload: DocumentTypePayload): Promise<DocumentType> {
    const res = await axiosInstance.post(endpoints.documentTypes, payload);
    return res.data.data;
  },

  async update(uid: string, payload: Partial<DocumentTypePayload>): Promise<DocumentType> {
    const res = await axiosInstance.put(`${endpoints.documentTypes}/${uid}`, payload);
    return res.data.data;
  },

  async delete(uid: string): Promise<void> {
    await axiosInstance.delete(`${endpoints.documentTypes}/${uid}`);
  },
};
