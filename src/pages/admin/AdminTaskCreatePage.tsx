import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Save, Users } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { createAdminTask, getAdminTasks } from "../../services/adminTaskService";
import { isBeforeToday, todayDateTimeInputValue } from "../../utils/dateValidation";

const statuses = ["pending", "in_progress", "review", "completed", "on_hold", "cancelled"];
const priorities = ["low", "medium", "high", "urgent"];
const field = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const title = (value?: string) => String(value || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const FormField = ({ label, required, children, className = "" }: any) => (
  <label className={`block min-w-0 ${className}`}>
    <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}{required && <span className="text-red-500"> *</span>}
    </span>
    {children}
  </label>
);

const UserColumn = ({ titleText, users, selected, onToggle }: any) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-black text-slate-900 dark:text-white">{titleText}</p>
        <p className="text-xs font-semibold text-slate-400">{users.length} available</p>
      </div>
      <Users size={18} className="text-blue-600" />
    </div>
    <div className="grid gap-2">
      {users.length ? users.map((user: any) => (
        <label key={user._id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-950">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" checked={selected.includes(user._id)} onChange={() => onToggle(user._id)} />
          <span className="min-w-0">
            <b className="block truncate text-slate-800 dark:text-white">{user.name}</b>
            <small className="block truncate text-slate-400">{user.email || title(user.role)}</small>
          </span>
        </label>
      )) : <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-950">No {titleText.toLowerCase()} found.</p>}
    </div>
  </div>
);

const AdminTaskCreatePage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    assignedUsers: [],
    priority: "medium",
    status: "pending",
    dueDate: "",
    reminderDate: "",
    recurringType: "none",
    recurringInterval: 1,
  });

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await getAdminTasks({ status: "all", priority: "all" });
        setUsers(res.data.users || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Could not load managers and agents. Please restart backend and try again.");
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const managers = useMemo(() => users.filter((user) => user.role === "manager"), [users]);
  const agents = useMemo(() => users.filter((user) => user.role === "agent"), [users]);

  const toggleUser = (id: string) => {
    setForm((prev: any) => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(id)
        ? prev.assignedUsers.filter((value: string) => value !== id)
        : [...prev.assignedUsers, id],
    }));
  };

  const submit = async () => {
    setError("");
    if (!form.title.trim()) return setError("Task title is required.");
    if (!form.dueDate) return setError("Deadline date is required.");
    if (!form.assignedUsers.length) return setError("Select at least one manager or agent.");
    if (isBeforeToday(form.dueDate)) return setError("Deadline date cannot be in the past.");
    if (isBeforeToday(form.reminderDate)) return setError("Reminder date cannot be in the past.");
    setSaving(true);
    try {
      await createAdminTask({
        title: form.title.trim(),
        description: form.description,
        assignedUsers: form.assignedUsers,
        priority: form.priority,
        status: form.status,
        dueDate: new Date(form.dueDate).toISOString(),
        reminderDate: form.reminderDate ? new Date(form.reminderDate).toISOString() : null,
        recurringType: form.recurringType,
        recurringInterval: Number(form.recurringInterval) || 1,
      });
      navigate("/admin/tasks");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Task could not be saved. Please check required fields and backend connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 pb-8">
        <section className="rounded-xl bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">Admin Task</p>
              <h1 className="mt-1 text-2xl font-black">Create Task</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">Create a task and assign it to managers, agents, or both.</p>
            </div>
            <button onClick={() => navigate("/admin/tasks")} className="flex w-fit items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white">
              <ArrowLeft size={16} /> Back to Tasks
            </button>
          </div>
        </section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">Task Information</p>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Task Title" required className="md:col-span-2">
                  <input className={field} placeholder="Enter task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </FormField>
                <FormField label="Priority">
                  <select className={field} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorities.map((p) => <option key={p} value={p}>{title(p)}</option>)}</select>
                </FormField>
                <FormField label="Status">
                  <select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{title(s)}</option>)}</select>
                </FormField>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">Schedule & Recurring</p>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Deadline Date & Time" required>
                  <input type="datetime-local" min={todayDateTimeInputValue()} className={field} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </FormField>
                <FormField label="Reminder Date & Time">
                  <input type="datetime-local" min={todayDateTimeInputValue()} className={field} value={form.reminderDate} onChange={(e) => setForm({ ...form, reminderDate: e.target.value })} />
                </FormField>
                <FormField label="Recurring Type">
                  <select className={field} value={form.recurringType} onChange={(e) => setForm({ ...form, recurringType: e.target.value })}>{["none", "daily", "weekly", "monthly", "custom"].map((r) => <option key={r} value={r}>{title(r)}</option>)}</select>
                </FormField>
                <FormField label="Recurring Interval">
                  <input type="number" min="1" className={field} value={form.recurringInterval} onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })} />
                </FormField>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">Details</p>
              <FormField label="Description">
                <textarea className="min-h-[130px] w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Describe the task, expected outcome, and important context" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </FormField>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
              <div className="flex items-center gap-2 text-sm font-black"><CheckCircle2 size={17} /> Assignment</div>
              <p className="mt-1 text-sm font-semibold">{form.assignedUsers.length} manager/agent selected.</p>
            </div>
            {loadingUsers ? <div className="rounded-xl bg-white p-8 text-center text-sm font-bold text-slate-500 dark:bg-slate-900">Loading managers and agents...</div> : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
                <UserColumn titleText="Managers" users={managers} selected={form.assignedUsers} onToggle={toggleUser} />
                <UserColumn titleText="Agents" users={agents} selected={form.assignedUsers} onToggle={toggleUser} />
              </div>
            )}
          </div>
        </section>

        <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/95 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95 sm:flex-row sm:justify-end">
          <button onClick={() => navigate("/admin/tasks")} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Save size={16} /> {saving ? "Saving..." : "Save Task"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTaskCreatePage;
