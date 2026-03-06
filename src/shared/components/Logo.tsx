import { cn } from 'src/lib/utils';

// Importamos ambas versiones del logo desde assets
import logoImg from 'src/assets/logos/logo.webp';
import logoFullImg from 'src/assets/logos/logo-full.webp';

type LogoVariant = 'logo' | 'full';

type LogoProps = {
  /** "logo" → solo isotipo | "full" → logo con nombre */
  variant?: LogoVariant;
  /** Altura de la imagen. El ancho se ajusta de forma proporcional (auto). */
  height?: number;
  className?: string;
};

/**
 * Logo global de la aplicación.
 *
 * - variant="logo"  → muestra únicamente el isotipo  (logo.webp)
 * - variant="full"  → muestra el logo con el nombre  (logo-full.webp)
 *
 * El tamaño base es height=40px; se puede sobreescribir desde el padre.
 */
export function Logo({ variant = 'logo', height = 80, className }: LogoProps) {
  const src = variant === 'full' ? logoFullImg : logoImg;
  const alt = variant === 'full' ? 'CRM Logo' : 'CRM Isotipo';

  return (
    <div className={cn('flex items-center', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src.src}
        alt={alt}
        height={height}
        style={{ height: `${height}px`, width: 'auto' }}
        draggable={false}
      />
      {/* Texto comentado: el nombre ya viene incluido en logo-full.webp */}
      {/* {variant === 'full' && <span className="text-lg font-bold tracking-tight">CRM</span>} */}
    </div>
  );
}
