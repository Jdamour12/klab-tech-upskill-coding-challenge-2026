import { cn } from '../../lib/cn';

export function AuthLayout({ children, wide }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface px-6 py-12">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-serif text-lg font-bold text-ink">
          T
        </span>
        <span className="font-serif text-2xl font-bold tracking-tight text-ink">Taskly</span>
      </div>

      <div className={cn('w-full rounded-card border border-border bg-card p-8 shadow-sm', wide ? 'max-w-md' : 'max-w-sm')}>
        {children}
      </div>
    </div>
  );
}
