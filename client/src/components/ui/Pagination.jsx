import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from './Button';
import { Select } from './Select';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const kept = Array.from(new Set([1, total, current - 1, current, current + 1]))
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < kept.length; i++) {
    if (i > 0 && kept[i] - kept[i - 1] > 1) result.push('…');
    result.push(kept[i]);
  }
  return result;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemLabel = 'items',
  className,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3', className)}>
      <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
        <span>{totalItems === 0 ? `No ${itemLabel}` : `Showing ${start}–${end} of ${totalItems} ${itemLabel}`}</span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            <span className="whitespace-nowrap">Rows per page</span>
            <Select className="w-[68px]" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <IconButton aria-label="Previous page" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
        </IconButton>
        {pageNumbers(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[12px] text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-medium transition-colors',
                p === page ? 'bg-primary text-ink' : 'text-ink-soft hover:bg-muted-soft'
              )}
            >
              {p}
            </button>
          )
        )}
        <IconButton aria-label="Next page" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  );
}
