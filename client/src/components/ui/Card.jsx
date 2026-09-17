import { cn } from '../../lib/cn';

export function Card({ className, children }) {
  return <div className={cn('rounded-card border border-border bg-card p-6', className)}>{children}</div>;
}

export function CardHeader({ title, action, className }) {
  return (
    <div className={cn('mb-5 flex items-center justify-between', className)}>
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {action}
    </div>
  );
}
