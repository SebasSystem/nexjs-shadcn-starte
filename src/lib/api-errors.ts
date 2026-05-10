// Extrae el mensaje más útil de un error de API
// El interceptor en axios.ts ya adjunta error.data = response.data
export function extractApiError(error: unknown): string {
  const err = error as Error & { data?: { errors?: Record<string, string[]>; message?: string } };

  // Si tiene errors de validación, tomar el primer mensaje de campo
  const errors = err?.data?.errors;
  if (errors) {
    const firstKey = Object.keys(errors)[0];
    const firstMsg = errors[firstKey]?.[0];
    if (firstMsg) return firstMsg;
  }

  // Fallback al message general
  return err?.message || 'Ocurrió un error inesperado';
}
