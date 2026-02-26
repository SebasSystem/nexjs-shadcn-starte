import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { allLangs, fallbackLng } from './locales-config';

export function useLocales() {
  const { i18n, t } = useTranslation();
  const router = useRouter();

  const langStorage = i18n.resolvedLanguage || fallbackLng;
  const currentLang = allLangs.find((lang) => lang.value === langStorage) || allLangs[0];

  const onChangeLang = useCallback(
    (newLang: string) => {
      i18n.changeLanguage(newLang);

      // Setting timezone / direction correctly if needed
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
        // Optionally update cookie directly:
        // document.cookie = `i18next=${newLang}; path=/; max-age=31536000;`;
      }

      router.refresh();
    },
    [i18n, router]
  );

  return {
    allLangs,
    t,
    currentLang,
    onChangeLang,
  };
}
