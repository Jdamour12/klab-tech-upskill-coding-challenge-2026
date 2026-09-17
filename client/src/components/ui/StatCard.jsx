import { Card } from './Card';
import { IconBadge } from './IconBadge';

export function StatCard({ icon, tone, value, label, footer }) {
  return (
    <Card className="p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <IconBadge icon={icon} tone={tone} size="sm" />
      </div>
      <p className="text-[22px] font-semibold leading-none text-ink">{value}</p>
      <p className="mt-1 text-[12px] text-muted">{label}</p>
      {footer}
    </Card>
  );
}
