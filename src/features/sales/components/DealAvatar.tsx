import { cn } from 'src/lib/utils';

const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
];

function getColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface DealAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
};

export function DealAvatar({ name, size = 'md', className }: DealAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0',
        COLORS[name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLORS.length],
        SIZE_CLASSES[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

// Export helpers for reuse
export { getColor, getInitials };
