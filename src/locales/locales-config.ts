// 1. Configuracion de la internacionalización

export const fallbackLng = 'es';
export const supportedLngs = ['es', 'en'];

export const cookieName = 'i18next';

export const allLangs = [
  {
    label: 'Español',
    value: 'es',
    icon: 'es',
  },
  {
    label: 'English',
    value: 'en',
    icon: 'us',
  },
];

export const i18nResourceLoader = {
  en: () => import('./langs/en/common.json').then((m) => m.default),
  es: () => import('./langs/es/common.json').then((m) => m.default),
};
