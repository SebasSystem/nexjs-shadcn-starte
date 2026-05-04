import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';
import { cn } from 'src/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background [a&]:hover:bg-foreground/90',
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        soft: 'bg-foreground/5 text-foreground [a&]:hover:bg-foreground/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeColor =
  | 'default'
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  color?: BadgeColor;
}

function getBadgeColorClasses(color?: BadgeColor, variant?: string | null) {
  if (!color || color === 'default') return '';

  const variantsMap: Record<string, Record<string, string>> = {
    inherit: {
      default: 'bg-foreground text-background [a&]:hover:bg-foreground/90',
      outline: 'border-input text-foreground [a&]:hover:bg-accent',
      soft: 'bg-foreground/5 text-foreground [a&]:hover:bg-foreground/10 border-transparent',
      ghost: 'text-foreground [a&]:hover:bg-accent',
    },
    primary: {
      default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
      outline: 'border-primary text-primary [a&]:hover:bg-primary/10',
      soft: 'bg-primary/10 text-primary [a&]:hover:bg-primary/20 border-transparent',
      ghost: 'text-primary [a&]:hover:bg-primary/10',
    },
    secondary: {
      default: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
      outline: 'border-secondary text-secondary-foreground [a&]:hover:bg-secondary/10',
      soft: 'bg-secondary/20 text-secondary-foreground [a&]:hover:bg-secondary/30 border-transparent',
      ghost: 'text-secondary-foreground [a&]:hover:bg-secondary/10',
    },
    success: {
      default: 'bg-success text-success-foreground [a&]:hover:bg-success/90',
      outline: 'border-success text-success [a&]:hover:bg-success/10',
      soft: 'bg-success/10 text-success [a&]:hover:bg-success/20 border-transparent',
      ghost: 'text-success [a&]:hover:bg-success/10',
    },
    warning: {
      default: 'bg-warning text-warning-foreground [a&]:hover:bg-warning/90',
      outline: 'border-warning text-warning [a&]:hover:bg-warning/10',
      soft: 'bg-warning/10 text-warning [a&]:hover:bg-warning/20 border-transparent',
      ghost: 'text-warning [a&]:hover:bg-warning/10',
    },
    error: {
      default: 'bg-error text-error-foreground [a&]:hover:bg-error/90',
      outline: 'border-error text-error [a&]:hover:bg-error/10',
      soft: 'bg-error/10 text-error [a&]:hover:bg-error/20 border-transparent',
      ghost: 'text-error [a&]:hover:bg-error/10',
    },
    info: {
      default: 'bg-info text-info-foreground [a&]:hover:bg-info/90',
      outline: 'border-info text-info [a&]:hover:bg-info/10',
      soft: 'bg-info/10 text-info [a&]:hover:bg-info/20 border-transparent',
      ghost: 'text-info [a&]:hover:bg-info/10',
    },
  };

  const targetColor = variantsMap[color as keyof typeof variantsMap];
  if (!targetColor) return '';

  const baseVariant = variant || 'default';
  return targetColor[baseVariant as keyof typeof targetColor] || targetColor.default;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, color = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'span';

    return (
      <Comp
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        className={cn(badgeVariants({ variant }), getBadgeColorClasses(color, variant), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
