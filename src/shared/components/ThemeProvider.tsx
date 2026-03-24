'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeProvider — wrapper client para next-themes
// Se usa en el root layout (server component) sin problemas.
// attribute="class" → agrega/quita la clase .dark en <html>
// ─────────────────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
