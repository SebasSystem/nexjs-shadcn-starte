import axiosInstance from 'src/lib/axios';

export type ExportFormat = 'excel' | 'pdf' | 'csv';

export interface ExportParams {
  endpoint: string;
  format: ExportFormat;
  fields?: string[];
  filters?: unknown;
  tab?: string;
  filename?: string;
}

/**
 * Llama a un endpoint de exportación y dispara la descarga del archivo.
 * El backend debe devolver el binario con Content-Disposition: attachment.
 */
export async function downloadExport({
  endpoint,
  format,
  fields,
  filters = {},
  tab,
  filename,
}: ExportParams): Promise<void> {
  const response = await axiosInstance.post(
    endpoint,
    { format, fields, filters, ...(tab ? { tab } : {}) },
    { responseType: 'blob' }
  );

  const blob = new Blob([response.data], {
    type:
      format === 'pdf'
        ? 'application/pdf'
        : format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `export.${format === 'excel' ? 'xlsx' : format}`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
