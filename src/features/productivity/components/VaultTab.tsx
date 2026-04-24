'use client';

import React from 'react';
import { useVault } from '../hooks/use-vault';
import { Icon } from 'src/shared/components/ui/icon';
import { format } from 'date-fns';

export const VaultTab = ({ contactoId }: { contactoId: string }) => {
  const { data, isLoading, isUploading, uploadFile, deleteFile } = useVault(contactoId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  return (
    <div className="p-5 flex flex-col h-full bg-slate-50">
      <div className="mb-4 bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="text-sm font-semibold">Bóveda Documental</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sube contratos, propuestas o documentos (PDF)
          </p>
        </div>
        <div>
          <label htmlFor={`file-upload-${contactoId}`} className="cursor-pointer">
            <div
              className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors ${isUploading ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
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

      <div className="flex-1 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-500">Cargando documentos...</div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Icon name="FileText" size={32} className="mb-2 opacity-50" />
            <span className="text-sm">No hay documentos en la bóveda</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((doc) => (
              <div
                key={doc.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                    <Icon name="File" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {doc.nombreArchivo}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      <span>{format(new Date(doc.fechaSubida), 'dd MMM yyyy')}</span>
                      <span>•</span>
                      <span>{(doc.tamanoBytes / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>Por: {doc.subidoPor}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteFile(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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
