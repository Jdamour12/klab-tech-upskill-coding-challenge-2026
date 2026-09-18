import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Drawer } from "../ui/Drawer";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";

const EMPTY_VALUES = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
};

export function TaskFormDrawer({
  open,
  onClose,
  mode,
  initial,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initial });
  const [fieldError, setFieldError] = useState("");
  const isCompleted = mode === "edit" && initial?.status === "Completed";

  useEffect(() => {
    if (open) {
      setValues({ ...EMPTY_VALUES, ...initial });
      setFieldError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.title.trim()) {
      setFieldError("Title is required.");
      return;
    }
    setFieldError("");
    await onSubmit(values);
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={mode === "create" ? "New task" : "Edit task"}
      description={
        mode === "create"
          ? "Add a task to your list."
          : "Update the details of this task."
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-card border border-danger/30 bg-danger-soft px-3 py-2.5 text-[12.5px] text-danger">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            strokeWidth={2}
          />
          <span>{error}</span>
        </div>
      )}

      <div className="py-4">
        <Label>Title</Label>
        <Input
          placeholder="e.g. Write project README"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={200}
          disabled={isCompleted}
        />
        {fieldError && (
          <p className="mt-1.5 text-[12px] text-danger">{fieldError}</p>
        )}
      </div>

      <div className="py-4">
        <Label>Description</Label>
        <Textarea
          placeholder="Optional details"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          disabled={isCompleted}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 py-4">
        <div>
          <Label>Status</Label>
          <Select
            value={values.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select
            value={values.priority}
            onChange={(e) => set("priority", e.target.value)}
            disabled={isCompleted}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </div>
      </div>
    </Drawer>
  );
}
