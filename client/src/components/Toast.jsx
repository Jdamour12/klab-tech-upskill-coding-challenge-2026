import { CheckCircle2, XCircle } from 'lucide-react';

const STYLES = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
};

export default function Toast({ message, type = 'success' }) {
  if (!message) return null;
  const Icon = ICONS[type];

  return (
    <div
      className={`fixed top-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-card px-4 py-2.5 text-[13px] font-medium shadow-2xl shadow-ink/20 ${STYLES[type]}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      {message}
    </div>
  );
}
