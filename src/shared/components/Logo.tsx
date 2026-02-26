import { cn } from 'src/lib/utils';

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
};

/**
 * Logo global de la aplicación.
 * Ajusta el SVG o imagen según el branding del proyecto.
 */
export function Logo({ className, width = 40, height = 40, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Icono / SVG del logo */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo"
      >
        <rect width="40" height="40" rx="10" className="fill-primary" />
        <path
          d="M10 20C10 14.477 14.477 10 20 10s10 4.477 10 10-4.477 10-10 10S10 25.523 10 20Z"
          className="fill-primary-foreground"
          opacity="0.9"
        />
        <path
          d="M16 20l3 3 6-6"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && <span className="text-lg font-bold tracking-tight">CRM</span>}
    </div>
  );
}
