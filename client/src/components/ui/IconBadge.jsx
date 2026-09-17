import { cn } from '../../lib/cn';

const TONE_CLASSES = {
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  primary: 'bg-primary-soft text-primary-dark',
  violet: 'bg-violet-soft text-violet',
  danger: 'bg-danger-soft text-danger',
  muted: 'bg-muted-soft text-muted',
};

export function IconBadge({ icon: Icon, tone = 'primary', size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        size === 'md' ? 'h-10 w-10' : 'h-8 w-8',
        TONE_CLASSES[tone],
        className
      )}
    >
      <Icon className={size === 'md' ? 'h-[18px] w-[18px]' : 'h-4 w-4'} strokeWidth={2} />
    </span>
  );
}
