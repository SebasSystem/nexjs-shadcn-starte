import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from 'src/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-sm',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        soft: 'bg-primary/10 text-primary hover:bg-primary/20', // New variant
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  color?: ButtonColor;
}

function getButtonColorClasses(color?: ButtonColor, variant?: string | null) {
  if (!color || color === 'default') return '';

  const variantsMap: Record<string, Record<string, string>> = {
    primary: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border-primary text-primary hover:bg-primary/10',
      soft: 'bg-primary/10 text-primary hover:bg-primary/20 border-transparent',
      ghost: 'text-primary hover:bg-primary/10',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    secondary: {
      default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border-secondary text-secondary-foreground hover:bg-secondary/20',
      soft: 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border-transparent',
      ghost: 'text-secondary-foreground hover:bg-secondary/20',
      link: 'text-secondary-foreground underline-offset-4 hover:underline',
    },
    success: {
      default: 'bg-success text-success-foreground hover:bg-success/90',
      outline: 'border-success text-success hover:bg-success/10',
      soft: 'bg-success/10 text-success hover:bg-success/20 border-transparent',
      ghost: 'text-success hover:bg-success/10',
      link: 'text-success underline-offset-4 hover:underline',
    },
    warning: {
      default: 'bg-warning text-warning-foreground hover:bg-warning/90',
      outline: 'border-warning text-warning hover:bg-warning/10',
      soft: 'bg-warning/10 text-warning hover:bg-warning/20 border-transparent',
      ghost: 'text-warning hover:bg-warning/10',
      link: 'text-warning underline-offset-4 hover:underline',
    },
    error: {
      default: 'bg-error text-error-foreground hover:bg-error/90',
      outline: 'border-error text-error hover:bg-error/10',
      soft: 'bg-error/10 text-error hover:bg-error/20 border-transparent',
      ghost: 'text-error hover:bg-error/10',
      link: 'text-error underline-offset-4 hover:underline',
    },
    info: {
      default: 'bg-info text-info-foreground hover:bg-info/90',
      outline: 'border-info text-info hover:bg-info/10',
      soft: 'bg-info/10 text-info hover:bg-info/20 border-transparent',
      ghost: 'text-info hover:bg-info/10',
      link: 'text-info underline-offset-4 hover:underline',
    },
  };

  const targetColor = variantsMap[color as keyof typeof variantsMap];
  if (!targetColor) return '';

  // Si envían "destructive", lo manejamos como "default" del color elegido
  const baseVariant = (variant === 'destructive' ? 'default' : variant) || 'default';
  return targetColor[baseVariant as keyof typeof targetColor] || targetColor.default;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';

    // Mantenemos size y variant original para cva de Shadcn, luego sobreescribimos color
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          getButtonColorClasses(color, variant)
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
