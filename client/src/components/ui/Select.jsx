import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Select({ className, children, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select
        className="h-9 w-full appearance-none rounded-card border border-border bg-card pl-3 pr-8 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
        strokeWidth={2}
      />
    </div>
  );
}
