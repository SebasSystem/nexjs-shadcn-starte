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
 * Detecta si el backend devolvió error en vez del binario.
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
    { responseType: 'blob', timeout: 120_000 }
  );

  const blob = response.data as Blob;

  // Si el backend devolvió JSON (error) en vez del binario
  if (blob.type.includes('json')) {
    const text = await blob.text();
    let message = 'Error al generar la descarga';
    try {
      const parsed = JSON.parse(text);
      const errors = parsed?.errors as Record<string, string[]> | undefined;
      if (errors) {
        const first = Object.values(errors)[0];
        message = first?.[0] ?? message;
      } else if (parsed?.message) {
        message = parsed.message;
      }
    } catch {
      // text is not valid JSON, use default message
    }
    throw new Error(message);
  }

  const mime =
    format === 'pdf'
      ? 'application/pdf'
      : format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const url = URL.createObjectURL(new Blob([blob], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `export.${format === 'excel' ? 'xlsx' : format}`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
