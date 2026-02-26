'use client';

import { ReactNode, useEffect, useState } from 'react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { fallbackLng, supportedLngs, i18nResourceLoader } from './locales-config';

// Inicialización de la librería en el cliente
i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string) => {
      // Aquí implementas tu Lazy Load, ajustado
      if (language === 'es') return i18nResourceLoader.es();
      if (language === 'en') return i18nResourceLoader.en();
      return i18nResourceLoader.es(); // fallback
    })
  )
  .init({
    fallbackLng,
    supportedLngs,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React protege contra XSS de forma nativa
    },
    detection: {
      order: ['cookie', 'htmlTag', 'localStorage', 'navigator'],
      caches: ['cookie'], // Guardaremos en cookie para que el server lo pueda leer de vuelta
    },
  });

type Props = {
  children: ReactNode;
  lang: string;
};

export function I18nProvider({ children, lang }: Props) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Sincronizar el idioma servidor con el cliente
    if (lang && i18next.language !== lang) {
      i18next.changeLanguage(lang);
    }
  }, [lang]);

  // Esto previene que renderice children antes de tener la librería lista (opcional, por si la UI parpadea)
  useEffect(() => {
    setIsRendered(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (!isRendered) {
    return null; // O un fallback de Next.js
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
