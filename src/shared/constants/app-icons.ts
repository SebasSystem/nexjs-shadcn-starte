import { IconName } from 'src/shared/components/ui/icon';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Iconos de Acción Globales
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralizar los íconos aquí es una excelente práctica.
 * Garantiza consistencia visual en toda la plataforma y hace que
 * reemplazar un ícono en el futuro (ej: cambiar `SquarePen` por `Pencil`)
 * requiera modificar un solo archivo en lugar de 50 componentes distintos.
 */
export const ACTION_ICONS = {
  // Principales acciones en tablas y formularios
  EDIT: 'SquarePen' as IconName,
  DELETE: 'Trash2' as IconName,
  VIEW: 'Eye' as IconName,

  // Otras acciones comunes (se pueden expandir según necesidad)
  ADD: 'Plus' as IconName,
  SEARCH: 'Search' as IconName,
  DOWNLOAD: 'Download' as IconName,
} as const;
