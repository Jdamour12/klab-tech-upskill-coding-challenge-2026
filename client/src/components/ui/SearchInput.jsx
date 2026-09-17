import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';

export function SearchInput({ placeholder = 'Search…', className, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        strokeWidth={2}
      />
      <input
        type="text"
        placeholder={placeholder}
        className="h-9 w-full rounded-card border border-border bg-card pl-9 pr-3 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
        {...props}
      />
    </div>
  );
}
