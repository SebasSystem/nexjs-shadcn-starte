import { cookies, headers } from 'next/headers';

export async function detectLanguage() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLang = cookieStore.get('i18next')?.value;
  const headerLang = headerStore.get('accept-language')?.split(',')[0].split('-')[0];

  const lang = cookieLang || headerLang || 'es';

  return lang;
}
