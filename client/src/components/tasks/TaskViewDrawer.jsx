import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerSection } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const PRIORITY_TONE = { Low: 'muted', Medium: 'primary', High: 'danger' };
const STATUS_TONE = { Pending: 'info', Completed: 'success' };

function formatDate(iso) {
  if (!iso) return 'Not available';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TaskViewDrawer({ task, onClose, onEdit, onDelete, onToggleStatus }) {
  return (
    <Drawer
      open={!!task}
      onClose={onClose}
      title="Task details"
      footer={
        task && (
          <div className="flex items-center justify-between gap-2.5">
            <Button variant="danger" onClick={() => onDelete(task)}>
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} /> Delete
            </Button>
            <Button variant="solid" onClick={() => onEdit(task)}>
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} /> Edit
            </Button>
          </div>
        )
      }
    >
      {task && (
        <>
          <DrawerSection>
            <div className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold text-ink">{task.title}</h3>
                {task.description && <p className="mt-1 text-[13px] text-muted">{task.description}</p>}
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Status">
            <div className="flex items-center justify-between py-3">
              <Badge tone={STATUS_TONE[task.status]}>{task.status}</Badge>
              <button
                type="button"
                onClick={() => onToggleStatus(task)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-primary-dark hover:underline"
              >
                {task.status === 'Completed' ? (
                  <>
                    <Circle className="h-3.5 w-3.5" strokeWidth={2} /> Mark pending
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> Mark complete
                  </>
                )}
              </button>
            </div>
          </DrawerSection>

          <DrawerSection title="Priority">
            <div className="py-3">
              <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
            </div>
          </DrawerSection>

          <DrawerSection title="Created">
            <p className="py-3 text-[13px] text-ink-soft">{formatDate(task.created_at)}</p>
          </DrawerSection>
        </>
      )}
    </Drawer>
  );
}
