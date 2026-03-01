'use client';

import { useSettings } from 'src/shared/hooks/use-settings';

// ─────────────────────────────────────────────────────────────────────────────
// SettingsInitializer — monta useSettings en el árbol de la app protegida.
// Es un client component invisible (no renderiza nada) que solo activa
// el hook que sincroniza las preferencias del store con el DOM.
// ─────────────────────────────────────────────────────────────────────────────
export function SettingsInitializer() {
  useSettings();
  return null;
}
