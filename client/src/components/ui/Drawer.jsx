import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'default',
  preventClose = false,
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape' && !preventClose) onClose();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, preventClose, onClose]);

  return (
    <div className={cn('fixed inset-0 z-[60]', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div
        className={cn('absolute inset-0 bg-ink/40 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
        onClick={preventClose ? undefined : onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute inset-y-0 right-0 flex w-full flex-col bg-card shadow-2xl shadow-ink/20 transition-transform duration-300 ease-out',
          size === 'wide' ? 'max-w-[900px]' : 'max-w-[440px]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-1 shrink-0 bg-primary" />

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-[19px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
          </div>
          {!preventClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted-soft hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">{children}</div>

        {footer && <div className="shrink-0 border-t border-border px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}

export function DrawerSection({ title, children }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      {title && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</p>}
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
