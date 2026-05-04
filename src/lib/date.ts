import { CurrencyScope, getCurrencyPreferences } from './currency';

/**
 * Parses a date value safely. Handles ISO strings with microsecond precision
 * (6 fractional digits) from Laravel by truncating to milliseconds (3 digits).
 */
function toDate(value: string | number | Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (!value) return new Date();
  // Truncate microseconds to milliseconds: "2026-05-04T03:06:06.000000Z" → "2026-05-04T03:06:06.000Z"
  const safe = value.replace(/\.(\d{3})\d{3}Z$/, '.$1Z');
  return new Date(safe);
}

export { toDate };

/**
 * Formats a date value as relative time: "Hace 2h", "Hace 3d", etc.
 * Returns "—" if value is null or undefined.
 */
export function formatRelative(value: string | null): string {
  if (!value) return '—';
  const diffMs = Date.now() - toDate(value).getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'Hace menos de 1h';
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Hace ${diffD}d`;
  return `Hace ${Math.floor(diffD / 30)} mes(es)`;
}

/**
 * Formats a date value using the tenant's (or platform's) locale preference.
 *
 * @example
 * formatDate('2025-03-15')
 * // → "15/03/2025"  (with es-CO locale)
 *
 * formatDate('2025-03-15', { month: 'short' })
 * // → "15 mar. 2025"
 *
 * formatDate('2025-03-15', { month: 'long' })
 * // → "15 de marzo de 2025"
 */
export function formatDate(
  value: string | number | Date,
  options?: {
    /** Scope from which to read locale preferences. Defaults to 'tenant'. */
    scope?: CurrencyScope;
    /** Override locale directly (e.g. 'es-CO'). Skips preferences lookup. */
    locale?: string;
    day?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    year?: 'numeric' | '2-digit';
  }
): string {
  const scope = options?.scope ?? 'tenant';
  const prefs = getCurrencyPreferences(scope);
  const locale = options?.locale ?? prefs.locale;

  const date = toDate(value);

  try {
    return date.toLocaleDateString(locale, {
      day: options?.day ?? '2-digit',
      month: options?.month ?? '2-digit',
      year: options?.year ?? 'numeric',
    });
  } catch {
    return String(value);
  }
}

/**
 * Formats a time value using the tenant's locale preference.
 */
export function formatTime(
  value: string | number | Date,
  options?: {
    scope?: CurrencyScope;
    locale?: string;
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit';
  }
): string {
  const scope = options?.scope ?? 'tenant';
  const prefs = getCurrencyPreferences(scope);
  const locale = options?.locale ?? prefs.locale;
  const date = toDate(value);

  try {
    return date.toLocaleTimeString(locale, {
      hour: options?.hour ?? '2-digit',
      minute: options?.minute ?? '2-digit',
      second: options?.second,
    });
  } catch {
    return String(value);
  }
}

/**
 * Formats a date and time value using the tenant's locale preference.
 */
export function formatDateTime(
  value: string | number | Date,
  options?: {
    scope?: CurrencyScope;
    locale?: string;
    day?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    year?: 'numeric' | '2-digit';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit';
  }
): string {
  const scope = options?.scope ?? 'tenant';
  const prefs = getCurrencyPreferences(scope);
  const locale = options?.locale ?? prefs.locale;
  const date = toDate(value);

  try {
    return date.toLocaleString(locale, {
      day: options?.day ?? '2-digit',
      month: options?.month ?? '2-digit',
      year: options?.year ?? 'numeric',
      hour: options?.hour ?? '2-digit',
      minute: options?.minute ?? '2-digit',
    });
  } catch {
    return String(value);
  }
}
