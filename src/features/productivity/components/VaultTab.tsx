'use client';

import { format } from 'date-fns';
import React from 'react';
import { Icon } from 'src/shared/components/ui/icon';

import { useVault } from '../hooks/use-vault';

export const VaultTab = ({ contactoId }: { contactoId: string }) => {
  const { data, isLoading, uploadFile, deleteFile } = useVault('contacts', contactoId);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      await uploadFile(file);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-5 flex flex-col h-full bg-muted/10">
      <div className="mb-4 bg-card p-4 rounded-xl border border-border/40 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="text-sm font-semibold">Bóveda Documental</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sube contratos, propuestas o documentos (PDF)
          </p>
        </div>
        <div>
          <label htmlFor={`file-upload-${contactoId}`} className="cursor-pointer">
            <div
              className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                isUploading
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Icon name="UploadCloud" size={14} />
              {isUploading ? 'Subiendo...' : 'Subir Documento'}
            </div>
            <input
              id={`file-upload-${contactoId}`}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Cargando documentos...
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Icon name="FileText" size={32} className="mb-2 opacity-50" />
            <span className="text-sm">No hay documentos en la bóveda</span>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {data.map((doc) => (
              <div
                key={doc.uid}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                    <Icon name="File" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">
                      {doc.file_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span>{format(new Date(doc.uploaded_at), 'dd MMM yyyy')}</span>
                      <span>•</span>
                      <span>{(doc.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>Por: {doc.uploaded_by}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteFile(doc.uid)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
