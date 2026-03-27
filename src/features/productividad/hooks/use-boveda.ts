import { useState, useCallback, useEffect } from 'react';
import type { Documento } from '../types/productividad.types';
import { ProductividadService } from '../services/productividad.service';
import { toast } from 'sonner';

export const useBoveda = (contactoId: string) => {
  const [data, setData] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await ProductividadService.getDocumentos(contactoId);
      setData(items);
    } catch {
      toast.error('Error al cargar documentos');
    } finally {
      setIsLoading(false);
    }
  }, [contactoId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      await ProductividadService.uploadDocumento(contactoId, file);
      await fetchItems();
      toast.success('Documento subido con éxito');
      return true;
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'Error al subir documento');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      setIsUploading(true);
      await ProductividadService.deleteDocumento(id);
      await fetchItems();
      toast.success('Documento eliminado');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setIsUploading(false);
    }
  };

  return { data, isLoading, isUploading, uploadFile, deleteFile, refresh: fetchItems };
};
