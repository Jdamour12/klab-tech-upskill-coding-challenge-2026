import { cn } from '../../lib/cn';

const SIZE_CLASSES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-28 w-28 text-3xl',
};

export function Avatar({ initials, online, size = 'md', className }) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span className={cn('inline-flex items-center justify-center rounded-full bg-ink font-semibold text-card', SIZE_CLASSES[size])}>
        {initials}
      </span>
      {online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />}
    </span>
  );
}
