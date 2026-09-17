import { cn } from '../../lib/cn';

export function Table({ className, children }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-[13px]', className)}>{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="border-b border-border">{children}</thead>;
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ className, children, ...props }) {
  return (
    <tr className={cn('transition-colors hover:bg-muted-soft/60', className)} {...props}>
      {children}
    </tr>
  );
}

export function TH({ className, children }) {
  return (
    <th className={cn('px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-muted', className)}>
      {children}
    </th>
  );
}

export function TD({ className, children, ...props }) {
  return (
    <td className={cn('px-4 py-3.5 text-ink-soft', className)} {...props}>
      {children}
    </td>
  );
}
