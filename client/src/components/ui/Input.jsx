import { cn } from '../../lib/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-card border border-border bg-card px-3 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40',
        className
      )}
      {...props}
    />
  );
}

export function Label({ children, className, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1.5 block text-[12.5px] font-medium text-ink-soft', className)}>
      {children}
    </label>
  );
}
