import { cn } from '../../lib/cn';

const TONE_CLASSES = {
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  primary: 'bg-primary-soft text-primary-dark',
  violet: 'bg-violet-soft text-violet',
  danger: 'bg-danger-soft text-danger',
  muted: 'bg-muted-soft text-muted',
};

export function Badge({ tone = 'muted', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        TONE_CLASSES[tone],
        className
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}
