import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

// Solo Geist Mono para elementos `font-mono` (código, monoespaciado).
// La fuente principal de la app la gestiona --font-app via globals.css + useSettings.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CRM',
  description: 'Sistema de gestión empresarial',
};

import { AuthProvider } from 'src/shared/auth/context/jwt';
import { detectLanguage } from 'src/locales/server';
import { I18nProvider } from 'src/locales/i18n-provider';
import { ThemeProvider } from 'src/shared/components/ThemeProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await detectLanguage();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <I18nProvider lang={lang}>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
