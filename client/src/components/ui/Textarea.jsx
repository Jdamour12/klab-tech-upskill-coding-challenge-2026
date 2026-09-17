import { cn } from '../../lib/cn';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      rows={3}
      className={cn(
        'w-full resize-none rounded-card border border-border bg-card px-3 py-2.5 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40',
        className
      )}
      {...props}
    />
  );
}
