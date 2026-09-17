import { cn } from '../../lib/cn';

const VARIANT_CLASSES = {
  outline: 'border-2 border-border bg-card text-ink hover:bg-muted-soft',
  solid: 'bg-primary text-ink hover:bg-primary-dark',
  ghost: 'text-muted hover:bg-muted-soft hover:text-ink',
  danger: 'border-2 border-danger/30 bg-card text-danger hover:bg-danger-soft',
};

export function Button({ variant = 'outline', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-card px-4 py-2 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}

const ICON_BUTTON_VARIANT_CLASSES = {
  ghost: 'rounded-full text-muted hover:bg-muted-soft hover:text-ink',
  outline: 'rounded-card border-2 border-border text-muted hover:bg-muted-soft hover:text-ink',
};

export function IconButton({ variant = 'ghost', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-40',
        ICON_BUTTON_VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
