import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ClipboardList, Clock, CheckCircle2, Pencil, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import { createTask, deleteTask, getTasks, updateTask } from '../api';
import { Sidebar } from './layout/Sidebar';
import { PageShell } from './layout/PageShell';
import { PageHeader } from './layout/PageHeader';
import { Card, CardHeader } from './ui/Card';
import { Button, IconButton } from './ui/Button';
import { Badge } from './ui/Badge';
import { StatCard } from './ui/StatCard';
import { SearchInput } from './ui/SearchInput';
import { Table, THead, TBody, TR, TH, TD } from './ui/Table';
import { Pagination } from './ui/Pagination';
import { Drawer } from './ui/Drawer';
import { TaskFormDrawer } from './tasks/TaskFormDrawer';
import { TaskViewDrawer } from './tasks/TaskViewDrawer';
import Toast from './Toast';

const PAGE_SIZE = 10;
const PRIORITY_TONE = { Low: 'muted', Medium: 'primary', High: 'danger' };
const STATUS_TONE = { Pending: 'info', Completed: 'success' };

const QUICK_FILTERS = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
];

function formatDate(iso) {
  if (!iso) return 'Not available';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, showToast] = useToast();

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const result = await getTasks({ status: statusFilter || undefined, search: search || undefined, page, limit: pageSize });
      setTasks(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search, page, pageSize]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const pending = tasks.length - completed;
    const rate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
    return { completed, pending, rate };
  }, [tasks]);

  function openNewTask() {
    setEditingTask(null);
    setFormError(null);
    setFormDrawerOpen(true);
  }

  function openEditTask(task) {
    setEditingTask(task);
    setFormError(null);
    setFormDrawerOpen(true);
    setViewingTask(null);
  }

  async function handleFormSubmit(values) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
        showToast('Task updated');
      } else {
        await createTask(values);
        showToast('Task created');
      }
      setFormDrawerOpen(false);
      await loadTasks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
      setViewingTask(null);
      showToast('Task deleted');
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleStatus(task) {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await updateTask(task.id, { ...task, status: nextStatus });
    setViewingTask((v) => (v && v.id === task.id ? { ...v, status: nextStatus } : v));
    await loadTasks();
  }

  return (
    <div className="min-h-screen w-full">
      <Sidebar />
      <PageShell>
        <PageHeader
          title="Tasks"
          description={user ? `Welcome back, ${user.name.split(' ')[0]}. Here's what's on your list.` : undefined}
          actions={
            <Button variant="solid" onClick={openNewTask}>
              <Plus className="h-4 w-4" strokeWidth={2.5} /> New task
            </Button>
          }
        />

        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ClipboardList} tone="primary" value={meta.total} label="Total tasks (all pages)" />
          <StatCard icon={Clock} tone="info" value={stats.pending} label="Pending on this page" />
          <StatCard icon={CheckCircle2} tone="success" value={stats.completed} label="Completed on this page" />
          <StatCard icon={TrendingUp} tone="violet" value={`${stats.rate}%`} label="Completion rate (this page)" />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <SearchInput
            placeholder="Search tasks by title or description…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-72"
          />
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setPage(1);
                setStatusFilter(f.value);
              }}
              className={
                'rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ' +
                (statusFilter === f.value ? 'border-primary bg-primary-soft text-primary-dark' : 'border-border text-muted hover:text-ink-soft')
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader title="All tasks" action={<Badge tone="muted">{meta.total}</Badge>} />

          {loading && tasks.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted">Loading tasks…</p>
          ) : error ? (
            <div className="flex flex-col items-center gap-2.5 py-10 text-center">
              <p className="flex items-center gap-1.5 text-[13px] text-danger">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                {error}
              </p>
              <Button variant="outline" onClick={loadTasks}>
                Retry
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-[13px] text-muted">
                {statusFilter || search ? 'No tasks match your filters.' : 'No tasks yet — create the first one.'}
              </p>
              {!statusFilter && !search && (
                <Button variant="solid" onClick={openNewTask}>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> New task
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <THead>
                  <TR>
                    <TH>Task</TH>
                    <TH>Priority</TH>
                    <TH>Status</TH>
                    <TH>Created</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {tasks.map((task) => (
                    <TR key={task.id} className="cursor-pointer" onClick={() => setViewingTask(task)}>
                      <TD>
                        <span className="block max-w-[360px] truncate font-medium text-ink">{task.title}</span>
                        {task.description && (
                          <span className="mt-0.5 block max-w-[360px] truncate text-[12px] text-muted">{task.description}</span>
                        )}
                      </TD>
                      <TD>
                        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                      </TD>
                      <TD>
                        <Badge tone={STATUS_TONE[task.status]}>{task.status}</Badge>
                      </TD>
                      <TD className="text-ink-soft">{formatDate(task.created_at)}</TD>
                      <TD>
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <IconButton aria-label={`Edit ${task.title}`} onClick={() => openEditTask(task)}>
                            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                          </IconButton>
                          <IconButton
                            aria-label={`Delete ${task.title}`}
                            className="text-danger hover:bg-danger-soft"
                            onClick={() => setDeletingTask(task)}
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </IconButton>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              <Pagination
                page={meta.page}
                pageSize={meta.limit}
                totalItems={meta.total}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPage(1);
                  setPageSize(size);
                }}
                itemLabel="tasks"
              />
            </>
          )}
        </Card>

        <TaskFormDrawer
          open={formDrawerOpen}
          onClose={() => setFormDrawerOpen(false)}
          mode={editingTask ? 'edit' : 'create'}
          initial={editingTask ?? undefined}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          error={formError}
        />

        <TaskViewDrawer
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={openEditTask}
          onDelete={(task) => setDeletingTask(task)}
          onToggleStatus={handleToggleStatus}
        />

        <Drawer
          open={!!deletingTask}
          onClose={() => setDeletingTask(null)}
          title="Delete task"
          description={deletingTask ? `Delete "${deletingTask.title}"? This can't be undone.` : undefined}
          footer={
            <div className="flex items-center justify-end gap-2.5">
              <Button variant="outline" onClick={() => setDeletingTask(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete task'}
              </Button>
            </div>
          }
        />
      </PageShell>
      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}
