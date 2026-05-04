'use client';

import { Avatar as AvatarPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Avatar({
  className,
  size = 48,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: 24 | 32 | 40 | 48 | 56;
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none',
        // Mapping sizes to tailwind sizing classes (24px = size-6, 32 = size-8, 40 = size-10, 48 = size-12, 56 = size-14)
        'data-[size="24"]:size-6',
        'data-[size="32"]:size-8',
        'data-[size="40"]:size-10',
        'data-[size="48"]:size-12',
        'data-[size="56"]:size-14',
        // Fallback default just in case
        ![24, 32, 40, 48, 56].includes(size) && 'size-12',
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-base font-medium',
        'group-data-[size="24"]/avatar:text-xs',
        'group-data-[size="32"]/avatar:text-base',
        'group-data-[size="40"]/avatar:text-lg',
        'group-data-[size="48"]/avatar:text-2xl',
        'group-data-[size="56"]/avatar:text-3xl',
        className
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none',
        'group-data-[size="24"]/avatar:size-2 group-data-[size="24"]/avatar:[&>svg]:hidden',
        'group-data-[size="32"]/avatar:size-2.5 group-data-[size="32"]/avatar:[&>svg]:size-2',
        'group-data-[size="40"]/avatar:size-3 group-data-[size="40"]/avatar:[&>svg]:size-2',
        'group-data-[size="48"]/avatar:size-3.5 group-data-[size="48"]/avatar:[&>svg]:size-2.5',
        'group-data-[size="56"]/avatar:size-4 group-data-[size="56"]/avatar:[&>svg]:size-3',
        className
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        '*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2',
        className
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'bg-muted text-muted-foreground ring-background relative flex shrink-0 items-center justify-center rounded-full ring-2',
        'group-has-data-[size="24"]/avatar-group:size-6 group-has-data-[size="24"]/avatar-group:text-[10px]',
        'group-has-data-[size="32"]/avatar-group:size-8 group-has-data-[size="32"]/avatar-group:text-xs',
        'group-has-data-[size="40"]/avatar-group:size-10 group-has-data-[size="40"]/avatar-group:text-sm',
        'group-has-data-[size="48"]/avatar-group:size-12 group-has-data-[size="48"]/avatar-group:text-base',
        'group-has-data-[size="56"]/avatar-group:size-14 group-has-data-[size="56"]/avatar-group:text-lg',
        '[&>svg]:size-4',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage };
