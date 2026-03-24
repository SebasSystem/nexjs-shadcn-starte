/**
 * Genera y descarga un archivo CSV desde el navegador sin backend.
 *
 * @param data    Arreglo de objetos a exportar
 * @param filename Nombre del archivo (sin extensión .csv)
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);

  const escape = (value: unknown): string => {
    const str = value === null || value === undefined ? '' : String(value);
    // Envolver en comillas dobles si contiene coma, comilla o salto de línea
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [
    headers.map(escape).join(','),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];

  const csvContent = '\uFEFF' + rows.join('\r\n'); // BOM para Excel en español
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
