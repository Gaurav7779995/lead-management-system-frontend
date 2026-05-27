import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileUp,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AdminLayout from "../../layouts/AdminLayout";
import { AdminTaskProvider, useAdminTasks } from "../../contexts/tasks/AdminTaskContext";
import { addAdminTaskComment, exportAdminTasks, uploadAdminTaskAttachment } from "../../services/adminTaskService";
import { isBeforeToday, todayDateTimeInputValue } from "../../utils/dateValidation";

const statuses = ["pending", "in_progress", "review", "completed", "on_hold", "cancelled"];
const boardStatuses = ["pending", "in_progress", "review", "completed"];
const priorities = ["low", "medium", "high", "urgent"];
const palette = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2"];
const field = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const title = (value?: string) => String(value || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const creatorName = (task: any) => task.assignedBy?.name || task.createdBy?.name || "Unknown";
const fmt = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const priorityTone = (value: string) => value === "urgent" ? "bg-red-600 text-white" : value === "high" ? "bg-orange-100 text-orange-700" : value === "medium" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600";
const statusTone = (value: string) => value === "completed" ? "bg-green-100 text-green-700" : value === "in_progress" ? "bg-blue-100 text-blue-700" : value === "review" ? "bg-violet-100 text-violet-700" : value === "on_hold" ? "bg-slate-200 text-slate-700" : value === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

const StatCard = ({ label, value, icon: Icon, tone, sub }: any) => (
  <motion.div whileHover={{ y: -3 }} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value || 0}</p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">{sub}</p>
      </div>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span>
    </div>
  </motion.div>
);

const FormField = ({ label, required, children, className = "" }: any) => (
  <label className={`block min-w-0 ${className}`}>
    <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}{required && <span className="text-red-500"> *</span>}
    </span>
    {children}
  </label>
);

const TaskModal = ({ task, onClose }: any) => {
  const { users, createTask, updateTask } = useAdminTasks();
  const [form, setForm] = useState<any>({
    title: task?.title || "",
    description: task?.description || "",
    assignedUsers: task?.assignedUsers?.map((u: any) => u._id || u) || (task?.assignedTo ? [task.assignedTo?._id || task.assignedTo] : []),
    priority: task?.priority || "medium",
    status: task?.status || "pending",
    dueDate: task?.dueDate ? String(task.dueDate).slice(0, 16) : "",
    reminderDate: task?.reminderDate ? String(task.reminderDate).slice(0, 16) : "",
    recurringType: task?.recurringType || "none",
    recurringInterval: task?.recurringInterval || 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toggleUser = (id: string) => setForm((prev: any) => ({ ...prev, assignedUsers: prev.assignedUsers.includes(id) ? prev.assignedUsers.filter((x: string) => x !== id) : [...prev.assignedUsers, id] }));
  const submit = async () => {
    setError("");
    if (!form.title.trim() || !form.assignedUsers.length || !form.dueDate) return;
    if (isBeforeToday(form.dueDate)) return setError("Deadline date cannot be in the past.");
    if (isBeforeToday(form.reminderDate)) return setError("Reminder date cannot be in the past.");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        assignedUsers: form.assignedUsers,
        priority: form.priority,
        status: form.status,
        dueDate: new Date(form.dueDate).toISOString(),
        reminderDate: form.reminderDate ? new Date(form.reminderDate).toISOString() : null,
        recurringType: form.recurringType,
        recurringInterval: Number(form.recurringInterval) || 1,
      };
      if (task?._id) await updateTask(task._id, payload);
      else await createTask(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[1300] flex items-start justify-center overflow-y-auto bg-slate-950/65 px-3 py-4 sm:px-5 sm:py-8">
      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">Admin Task</p>
            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{task ? "Edit Task" : "Create Task"}</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>

        <div className="max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:px-6">
          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
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

          <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">Schedule & Recurring</p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="mb-3 text-sm font-black text-slate-900 dark:text-white">Details</p>
              <FormField label="Description">
                <textarea className="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Describe the task, expected outcome, and important context" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </FormField>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-black text-slate-900 dark:text-white">Assign To Managers / Agents</p>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-600">{form.assignedUsers.length} selected</span>
              </div>
              <div className="grid max-h-[330px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
                {users.map((user: any) => (
                  <label key={user._id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-950">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" checked={form.assignedUsers.includes(user._id)} onChange={() => toggleUser(user._id)} />
                    <span className="min-w-0">
                      <b className="block truncate text-slate-800 dark:text-white">{user.name}</b>
                      <small className="text-slate-400">{title(user.role)}{user.email ? ` - ${user.email}` : ""}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 sm:flex-row sm:justify-end sm:px-6">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Cancel</button>
          <button disabled={saving || !form.title || !form.assignedUsers.length || !form.dueDate} onClick={submit} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Save Task"}</button>
        </div>
      </motion.div>
    </div>
  );
};

const TaskDetails = ({ task, onClose, onEdit }: any) => {
  const { updateTask, loadTasks } = useAdminTasks();
  const [comment, setComment] = useState("");
  const addComment = async () => {
    if (!comment.trim()) return;
    await addAdminTaskComment(task._id, comment.trim());
    setComment("");
    await loadTasks();
  };
  const toggleChecklist = async (index: number) => {
    const checklist = (task.checklist || []).map((item: any, i: number) => i === index ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : null } : item);
    await updateTask(task._id, { checklist });
  };
  const attach = async (file?: File | null) => {
    if (!file) return;
    await uploadAdminTaskAttachment(task._id, file, file.type.startsWith("audio/"));
    await loadTasks();
  };
  return (
    <div className="fixed inset-0 z-[1250] flex justify-end bg-slate-950/40">
      <motion.aside initial={{ x: 520 }} animate={{ x: 0 }} exit={{ x: 520 }} className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-blue-500">Task Details</p><h2 className="text-2xl font-black text-slate-900 dark:text-white">{task.title}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-slate-500"><X size={18} /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[["Assigned", (task.assignedUsers || []).map((u: any) => u.name).join(", ") || task.assignedTo?.name], ["Deadline", fmt(task.dueDate)], ["Department", task.department], ["Progress", `${task.progress || 0}%`]].map(([k, v]) => <div key={k} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs font-black uppercase text-slate-400">{k}</p><p className="mt-1 font-bold text-slate-800 dark:text-white">{v || "-"}</p></div>)}
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{task.description || "No description added."}</p>
        <div className="mt-4"><div className="mb-2 flex justify-between text-xs font-black text-slate-400"><span>Checklist Progress</span><span>{task.progress || 0}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${task.progress || 0}%` }} /></div>{(task.checklist || []).map((item: any, index: number) => <label key={item._id || index} className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700"><input type="checkbox" checked={!!item.completed} onChange={() => toggleChecklist(index)} /><span className={item.completed ? "line-through text-slate-400" : ""}>{item.title}</span></label>)}</div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-center justify-between"><h3 className="font-black">Attachments</h3><label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-600"><FileUp size={14} /> Upload<input type="file" className="hidden" onChange={(e) => attach(e.target.files?.[0])} /></label></div>{(task.attachments || []).map((file: any) => <a key={file._id || file.fileUrl} href={file.fileUrl} target="_blank" rel="noreferrer" className="mt-2 block rounded-lg bg-slate-50 p-2 text-sm font-semibold text-blue-600 dark:bg-slate-950">{file.fileName}</a>)}</div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="font-black">Comments</h3><textarea className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Comment or @mention user" value={comment} onChange={(e) => setComment(e.target.value)} /><button onClick={addComment} className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Comment</button>{(task.comments || []).map((item: any) => <div key={item._id} className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-950"><b>{item.addedBy?.name || "Team"}</b><p>{item.text}</p></div>)}</div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="font-black">Activity Timeline</h3>{(task.activity || []).map((item: any) => <div key={item._id} className="mt-3 border-l-2 border-blue-200 pl-3 text-sm"><b>{item.message}</b><p className="text-xs text-slate-400">{fmt(item.createdAt)}</p></div>)}</div>
        <button onClick={() => onEdit(task)} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Edit Task</button>
      </motion.aside>
    </div>
  );
};

const AdminTasksContent = () => {
  const { tasks, users, summary, charts, filters, loading, loadTasks, setFilters, updateTask, deleteTask } = useAdminTasks();
  const [view, setView] = useState("board");
  const [modalTask, setModalTask] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  useEffect(() => { loadTasks(); }, []);
  const apply = (patch: any) => { const next = { ...filters, ...patch }; setFilters(next); loadTasks(next); };
  const board = useMemo(() => boardStatuses.map((status) => ({ status, tasks: tasks.filter((task: any) => (task.computedStatus || task.status) === status) })), [tasks]);
  const moveTask = async (taskId: string, status: string) => updateTask(taskId, { status });
  const calendarDays = useMemo(() => Array.from({ length: 35 }).map((_, i) => { const d = new Date(); d.setDate(1); d.setDate(d.getDate() - d.getDay() + i); return d; }), []);
  return (
    <AdminLayout>
      <div className="space-y-4 pb-8">
        <section className="rounded-xl bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">Admin Task Operations</p><h1 className="mt-1 text-2xl font-black">Task Management Dashboard</h1><p className="mt-2 max-w-3xl text-sm text-slate-300">Assign work to managers and agents, track progress, deadlines, comments, attachments, recurring tasks, and team productivity.</p></div>
            <div className="flex flex-wrap gap-2"><Link to="/admin/tasks/create" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white"><Plus size={16} /> Create Task</Link><button onClick={() => exportAdminTasks(filters)} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white"><Download size={16} /> Export CSV</button></div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Tasks" value={summary.totalTasks} icon={ListChecks} tone="bg-blue-50 text-blue-600" sub="All assigned work" />
          <StatCard label="Pending Tasks" value={summary.pendingTasks} icon={Clock3} tone="bg-amber-50 text-amber-600" sub="Needs action" />
          <StatCard label="Completed" value={summary.completedTasks} icon={CheckCircle2} tone="bg-green-50 text-green-600" sub="Closed tasks" />
          <StatCard label="Overdue" value={summary.overdueTasks} icon={AlertTriangle} tone="bg-red-50 text-red-600" sub="Past deadline" />
          <StatCard label="High Priority" value={summary.highPriorityTasks} icon={BarChart3} tone="bg-orange-50 text-orange-600" sub="High and urgent" />
          <StatCard label="Productivity" value={`${summary.teamProductivity || 0}%`} icon={Users} tone="bg-cyan-50 text-cyan-600" sub="Completion rate" />
        </section>

        <section className="sticky top-2 z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <div className="grid gap-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} /><input className={`${field} pl-9`} placeholder="Search title, employee, tags" value={filters.search || ""} onChange={(e) => apply({ search: e.target.value })} /></div>
            <select className={field} value={filters.status || "all"} onChange={(e) => apply({ status: e.target.value })}><option value="all">All Status</option>{statuses.map((s) => <option key={s} value={s}>{title(s)}</option>)}</select>
            <select className={field} value={filters.priority || "all"} onChange={(e) => apply({ priority: e.target.value })}><option value="all">All Priority</option>{priorities.map((p) => <option key={p} value={p}>{title(p)}</option>)}</select>
            <select className={field} value={filters.assignedUser || "all"} onChange={(e) => apply({ assignedUser: e.target.value })}><option value="all">All Users</option>{users.map((u: any) => <option key={u._id} value={u._id}>{u.name} - {title(u.role)}</option>)}</select>
            <input className={field} type="date" value={filters.dueDate || ""} onChange={(e) => apply({ dueDate: e.target.value })} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{["board", "table", "calendar", "analytics"].map((tab) => <button key={tab} onClick={() => setView(tab)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${view === tab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{tab === "board" ? <LayoutDashboard size={14} /> : tab === "calendar" ? <CalendarDays size={14} /> : <BarChart3 size={14} />}{title(tab)}</button>)}</div>
        </section>

        {loading ? <div className="rounded-xl bg-white p-10 text-center text-slate-500 dark:bg-slate-900">Loading admin tasks...</div> : view === "board" ? (
          <section className="grid grid-flow-col auto-cols-[290px] gap-4 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-4">{board.map((col) => <div key={col.status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => moveTask(e.dataTransfer.getData("taskId"), col.status)} className="min-h-[520px] rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-3 flex justify-between text-sm font-black text-slate-800 dark:text-white">{title(col.status)}<span>{col.tasks.length}</span></h3>{col.tasks.map((task: any) => <motion.div layout draggable onDragStart={(e: any) => e.dataTransfer.setData("taskId", task._id)} onClick={() => setDetails(task)} key={task._id} className="mb-3 cursor-pointer rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-slate-800"><div className="flex justify-between gap-2"><div className="min-w-0"><p className="break-words font-black text-slate-900 dark:text-white">{task.title}</p><p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-500">Created by {creatorName(task)}</p></div><span className={`h-fit rounded-full px-2 py-1 text-[10px] font-black ${priorityTone(task.priority)}`}>{title(task.priority)}</span></div><p className="mt-2 text-xs text-slate-500">{(task.assignedUsers || []).map((u: any) => u.name).join(", ") || task.assignedTo?.name}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${task.progress || 0}%` }} /></div></motion.div>)}</div>)}</section>
        ) : view === "table" ? (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500 dark:bg-slate-950"><tr><th className="p-3">Task</th><th className="p-3">Assigned</th><th className="p-3">Priority</th><th className="p-3">Status</th><th className="p-3">Department</th><th className="p-3">Due</th><th className="p-3">Progress</th><th className="p-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{tasks.map((task: any) => <tr key={task._id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20"><td onClick={() => setDetails(task)} className="cursor-pointer p-3"><p className="font-black">{task.title}</p><p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-500">Created by {creatorName(task)}</p></td><td className="p-3">{(task.assignedUsers || []).map((u: any) => u.name).join(", ")}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-black ${priorityTone(task.priority)}`}>{title(task.priority)}</span></td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-black ${statusTone(task.computedStatus)}`}>{title(task.computedStatus)}</span></td><td className="p-3">{task.department}</td><td className="p-3">{fmt(task.dueDate)}</td><td className="p-3">{task.progress || 0}%</td><td className="p-3"><div className="flex gap-2"><button onClick={() => setDetails(task)} className="rounded-lg bg-blue-50 p-2 text-blue-600"><MessageSquare size={15} /></button><button onClick={() => deleteTask(task._id)} className="rounded-lg bg-red-50 p-2 text-red-600"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>
        ) : view === "calendar" ? (
          <section className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"><div className="grid grid-cols-7 gap-2">{calendarDays.map((day) => { const dayTasks = tasks.filter((task: any) => new Date(task.dueDate).toDateString() === day.toDateString()); return <div key={day.toISOString()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => moveTask(e.dataTransfer.getData("taskId"), "pending")} className="min-h-[110px] rounded-lg bg-slate-50 p-2 dark:bg-slate-950"><p className="text-xs font-black text-slate-400">{day.getDate()}</p>{dayTasks.map((task: any) => <div draggable onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)} onClick={() => setDetails(task)} key={task._id} className={`mt-1 cursor-pointer rounded-md px-2 py-1 text-[11px] font-bold ${priorityTone(task.priority)}`}>{task.reminderDate ? "* " : ""}{task.title}<p className="mt-0.5 text-[9px] uppercase tracking-wide opacity-80">By {creatorName(task)}</p></div>)}</div>; })}</div></section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-3 font-black">Weekly Task Completion</h3><ResponsiveContainer width="100%" height={260}><LineChart data={charts.weekly || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="created" stroke="#2563eb" strokeWidth={2} /><Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={2} /></LineChart></ResponsiveContainer></div><div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-3 font-black">Priority Analytics</h3><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={charts.byPriority || []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>{(charts.byPriority || []).map((_: any, i: number) => <Cell key={i} fill={palette[i % palette.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-3 font-black">Team Performance</h3><ResponsiveContainer width="100%" height={280}><BarChart data={charts.team || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="assigned" fill="#2563eb" /><Bar dataKey="completed" fill="#16a34a" /><Bar dataKey="overdue" fill="#ef4444" /></BarChart></ResponsiveContainer></div><div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-3 font-black">Status Distribution</h3><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={charts.byStatus || []} dataKey="value" nameKey="name" outerRadius={95}>{(charts.byStatus || []).map((_: any, i: number) => <Cell key={i} fill={palette[i % palette.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></section>
        )}
      </div>
      <AnimatePresence>{modalTask && <TaskModal task={modalTask._id ? modalTask : null} onClose={() => setModalTask(null)} />}{details && <TaskDetails task={details} onClose={() => setDetails(null)} onEdit={(task: any) => { setDetails(null); setModalTask(task); }} />}</AnimatePresence>
    </AdminLayout>
  );
};

const AdminTasksPage = () => <AdminTaskProvider><AdminTasksContent /></AdminTaskProvider>;
export default AdminTasksPage;
