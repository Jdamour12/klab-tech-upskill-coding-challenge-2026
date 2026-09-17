import { ListChecks, LogOut } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const RAIL_WIDTH = 'w-24';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return initials.toUpperCase();
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const displayName = user?.name ?? 'Signed in';

  return (
    <aside className="group fixed inset-y-0 left-0 z-40 flex w-24 flex-col overflow-hidden border-r border-border bg-card transition-[width] duration-200 ease-out hover:w-72 hover:shadow-2xl hover:shadow-ink/10">
      <div className="flex h-20 shrink-0 items-center border-b border-border">
        <div className={cn('flex shrink-0 items-center justify-center', RAIL_WIDTH, 'group-hover:hidden')}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-serif text-lg font-bold text-ink">
            T
          </span>
        </div>
        <div className="hidden items-center gap-1.5 pl-6 group-hover:flex">
          <span className="font-serif text-2xl font-bold tracking-tight text-primary">Taskly</span>
          <span className="mb-3 h-1.5 w-1.5 rounded-full bg-success" />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden py-4">
        <div className="flex items-center">
          <span className={cn('flex shrink-0 items-center justify-center py-1', RAIL_WIDTH)}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-nav-active-bg text-nav-active-text transition-colors">
              <ListChecks className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>
          </span>
          <span className="hidden whitespace-nowrap pr-4 text-[14.5px] font-semibold text-nav-active-text group-hover:inline-block">
            Tasks
          </span>
        </div>
      </nav>

      <div className="shrink-0 border-t border-border py-4">
        <div className={cn('flex items-center justify-center', RAIL_WIDTH, 'group-hover:hidden')}>
          <Avatar initials={getInitials(displayName)} online />
        </div>
        <div className="hidden items-center gap-3 px-4 group-hover:flex">
          <Avatar initials={getInitials(displayName)} online />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold text-nav-active-text">{displayName}</span>
            <span className="block truncate text-[12px] text-nav-inactive-text">{user?.email ?? ''}</span>
          </span>
          <IconButton aria-label="Log out" onClick={logout} className="shrink-0 text-danger hover:bg-danger-soft">
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </IconButton>
        </div>
      </div>
    </aside>
  );
}
