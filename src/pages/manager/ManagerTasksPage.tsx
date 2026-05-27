import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaDownload,
  FaEdit,
  FaExclamationTriangle,
  FaFilter,
  FaPlus,
  FaRegCommentDots,
  FaSearch,
  FaSpinner,
  FaTasks,
  FaTrash,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import { ManagerTaskProvider, useManagerTasks } from "../../contexts/tasks/ManagerTaskContext";
import { addManagerTaskComment, exportManagerTasks } from "../../services/managerTaskService";
import { isBeforeToday, todayDateTimeInputValue } from "../../utils/dateValidation";

const Icon = ({ as: Component, className, size }: { as: any; className?: string; size?: number }) => <Component className={className} size={size} />;
const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0f766e"];
const statusOptions = ["pending", "in_progress", "completed", "cancelled", "overdue", "draft"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const fieldClass = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const asTitle = (value?: string) => String(value || "-").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const fmtDate = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
const creatorName = (task: any) => task.assignedBy?.name || task.createdBy?.name || "Unknown";
const statusTone = (status: string) => status === "completed" ? "bg-green-100 text-green-700" : status === "in_progress" ? "bg-blue-100 text-blue-700" : status === "overdue" ? "bg-red-100 text-red-700" : status === "cancelled" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-700";
const priorityTone = (priority: string) => priority === "urgent" ? "bg-red-600 text-white" : priority === "high" ? "bg-orange-100 text-orange-700" : priority === "low" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700";

const LabeledField = ({ label, children, required = false, className = "" }: { label: string; children: any; required?: boolean; className?: string }) => (
  <label className={`text-xs font-bold uppercase tracking-wide text-slate-400 ${className}`}>
    {label}{required && <span className="text-red-500"> *</span>}
    <div className="mt-1">{children}</div>
  </label>
);

const StatCard = ({ label, value, percent, icon, color }: any) => (
  <motion.div whileHover={{ y: -2 }} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-1.5">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase leading-3 tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-lg font-extrabold leading-none text-slate-900 dark:text-white">{value || 0}</p>
        <p className="mt-1 truncate text-[10px] font-bold leading-3 text-green-600">{percent || 0}% workload</p>
      </div>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}><Icon as={icon} size={12} /></span>
    </div>
    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(percent || 0, 100)}%` }} /></div>
  </motion.div>
);

const TaskModal = ({ task, onClose }: { task?: any; onClose: () => void }) => {
  const { agents, leads, createTask, updateTask } = useManagerTasks();
  const [form, setForm] = useState<any>({
    title: task?.title || "",
    description: task?.description || "",
    assignedTo: task?.assignedTo?._id || task?.assignedTo || "",
    relatedLead: task?.relatedLead?._id || task?.relatedLead || "",
    priority: task?.priority || "medium",
    status: task?.status || "pending",
    dueDate: task?.dueDate ? String(task.dueDate).slice(0, 16) : "",
    reminderDate: task?.reminderDate ? String(task.reminderDate).slice(0, 16) : "",
    category: task?.category || "General",
    notes: task?.notes || "",
    recurringType: task?.recurringType || "none",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (saveAsDraft = false) => {
    setError("");
    if (!form.title.trim()) return setError("Task title is required.");
    if (!form.assignedTo) return setError("Please select an assigned agent.");
    if (!form.dueDate) return setError("Due date and time is required.");
    if (isBeforeToday(form.dueDate)) return setError("Due date cannot be in the past.");
    if (isBeforeToday(form.reminderDate)) return setError("Reminder date cannot be in the past.");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || "",
        assignedTo: form.assignedTo,
        relatedLead: form.relatedLead || null,
        priority: form.priority,
        status: form.status,
        dueDate: new Date(form.dueDate).toISOString(),
        reminderDate: form.reminderDate ? new Date(form.reminderDate).toISOString() : undefined,
        category: form.category || "General",
        notes: form.notes || "",
        recurringType: form.recurringType || "none",
        saveAsDraft,
      };
      if (task?._id) await updateTask(task._id, payload);
      else await createTask(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Task could not be saved. Please check all fields and try again.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/60 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{task ? "Edit Task" : "Create Task"}</h2>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500">Cancel</button>
        </div>
        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <LabeledField label="Task title" required><input className={fieldClass} placeholder="Enter task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></LabeledField>
          <LabeledField label="Assign task to agent" required><select className={fieldClass} value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Select agent</option>
            {agents.map((agent: any) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
          </select></LabeledField>
          <LabeledField label="Related lead / customer"><select className={fieldClass} value={form.relatedLead || ""} onChange={(e) => setForm({ ...form, relatedLead: e.target.value })}>
            <option value="">Select related lead</option>
            {leads.map((lead: any) => <option key={lead._id} value={lead._id}>{lead.name} {lead.company ? `- ${lead.company}` : ""}</option>)}
          </select></LabeledField>
          <LabeledField label="Task category"><input className={fieldClass} placeholder="General, Follow-up, Sales..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></LabeledField>
          <LabeledField label="Priority"><select className={fieldClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorityOptions.map((x) => <option key={x} value={x}>{asTitle(x)}</option>)}</select></LabeledField>
          <LabeledField label="Status"><select className={fieldClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statusOptions.map((x) => <option key={x} value={x}>{asTitle(x)}</option>)}</select></LabeledField>
          <LabeledField label="Due date & time" required><input type="datetime-local" min={todayDateTimeInputValue()} className={fieldClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></LabeledField>
          <LabeledField label="Reminder date & time"><input type="datetime-local" min={todayDateTimeInputValue()} className={fieldClass} value={form.reminderDate || ""} onChange={(e) => setForm({ ...form, reminderDate: e.target.value })} /></LabeledField>
          <LabeledField label="Recurring task option"><select className={fieldClass} value={form.recurringType} onChange={(e) => setForm({ ...form, recurringType: e.target.value })}>{["none", "daily", "weekly", "monthly", "custom"].map((x) => <option key={x} value={x}>{asTitle(x)}</option>)}</select></LabeledField>
          <LabeledField label="Attachments / documents"><input className={fieldClass} type="file" multiple /></LabeledField>
          <LabeledField label="Task description" className="md:col-span-2"><textarea className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Describe the task clearly" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></LabeledField>
          <LabeledField label="Notes" className="md:col-span-2"><textarea className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Internal notes for this task" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></LabeledField>
        </div>
        <div className="sticky bottom-0 mt-4 flex justify-end gap-2 bg-white py-3 dark:bg-slate-900">
          <button onClick={() => submit(true)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700">Save Draft</button>
          <button disabled={saving || !form.title || !form.assignedTo || !form.dueDate} onClick={() => submit(false)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving..." : task ? "Update Task" : "Create Task"}</button>
        </div>
      </motion.div>
    </div>
  );
};

const TaskDetails = ({ task, onClose }: { task: any; onClose: () => void }) => {
  const [comment, setComment] = useState("");
  const addComment = async () => {
    if (!comment.trim()) return;
    await addManagerTaskComment(task._id, comment);
    setComment("");
  };
  return (
    <div className="fixed inset-0 z-[1150] flex justify-end bg-slate-950/40">
      <motion.aside initial={{ x: 420 }} animate={{ x: 0 }} className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Task Details</h2><button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500">Close</button></div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"><p className="text-xs font-bold uppercase text-slate-400">Title</p><h3 className="mt-1 text-xl font-extrabold">{task.title}</h3><p className="mt-2 text-sm text-slate-500">{task.description || "No description"}</p></div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Agent", task.assignedTo?.name], ["Lead", task.relatedLead?.name], ["Priority", asTitle(task.priority)], ["Status", asTitle(task.computedStatus)], ["Due", fmtDate(task.dueDate)], ["Reminder", fmtDate(task.reminderDate)]].map(([k, v]) => <div key={k} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><b>{k}</b><p className="mt-1 text-slate-500">{v || "-"}</p></div>)}
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="font-extrabold">Comments & Notes</h3><textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-3 min-h-[80px] w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Add internal comment or mention team member" /><button onClick={addComment} className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Comment</button></div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="font-extrabold">Activity Timeline</h3>{(task.activity || []).length === 0 ? <p className="mt-3 text-sm text-slate-500">No task history yet.</p> : task.activity.map((item: any, i: number) => <div key={i} className="mt-3 border-l-2 border-blue-200 pl-3 text-sm"><b>{item.message}</b><p className="text-xs text-slate-400">{fmtDate(item.createdAt)}</p></div>)}</div>
        </div>
      </motion.aside>
    </div>
  );
};

const ManagerTasksContent = () => {
  const { tasks, agents, summary, percentages, charts, pagination, filters, setFilters, loading, loadTasks, deleteTask, bulkAction } = useManagerTasks();
  const [modalTask, setModalTask] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState("table");
  const [toast, setToast] = useState("");

  useEffect(() => { loadTasks(); }, []);
  const applyFilters = (patch: any) => { const next = { ...filters, ...patch, page: patch.page || 1 }; setFilters(next); loadTasks(next); };
  const rowsByStatus = useMemo(() => statusOptions.map((status) => ({ status, tasks: tasks.filter((task: any) => (task.computedStatus || task.status) === status) })), [tasks]);
  const toggleSelect = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const doBulk = async (action: any, payload?: any) => { await bulkAction({ taskIds: selected, action, payload }); setSelected([]); setToast("Bulk action completed"); };

  return (
    <div className="dashboard manager-dashboard-shell manager-tasks-theme overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <main className="dashboard-content manager-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          <div className="manager-tasks-page space-y-4 pb-8">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-slate-950 p-4 text-white sm:p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">Manager CRM</p><h1 className="mt-1 text-2xl font-extrabold">Task Management Center</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Create, assign, monitor, and analyze team tasks with enterprise CRM workflows.</p></div>
                <div className="grid content-center gap-2 p-4 sm:grid-cols-2"><button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white"><Icon as={FaPlus} /> Create Task</button><button onClick={() => exportManagerTasks(filters)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700"><Icon as={FaDownload} /> Export CSV</button></div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              <StatCard label="Total Tasks" value={summary.totalTasks} percent={percentages.totalTasks} icon={FaTasks} color="bg-blue-50 text-blue-600" />
              <StatCard label="Pending" value={summary.pendingTasks} percent={percentages.pendingTasks} icon={FaClock} color="bg-amber-50 text-amber-600" />
              <StatCard label="In Progress" value={summary.inProgressTasks} percent={percentages.inProgressTasks} icon={FaSpinner} color="bg-cyan-50 text-cyan-600" />
              <StatCard label="Completed" value={summary.completedTasks} percent={percentages.completedTasks} icon={FaCheckCircle} color="bg-green-50 text-green-600" />
              <StatCard label="Overdue" value={summary.overdueTasks} percent={percentages.overdueTasks} icon={FaExclamationTriangle} color="bg-red-50 text-red-600" />
              <StatCard label="Today" value={summary.todayTasks} percent={percentages.todayTasks} icon={FaCalendarAlt} color="bg-violet-50 text-violet-600" />
              <StatCard label="High Priority" value={summary.highPriorityTasks} percent={percentages.highPriorityTasks} icon={FaBell} color="bg-orange-50 text-orange-600" />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
                <div className="relative lg:col-span-2"><Icon as={FaSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${fieldClass} pl-9`} placeholder="Search tasks, notes, category" value={filters.search || ""} onChange={(e) => applyFilters({ search: e.target.value })} /></div>
                <select className={fieldClass} value={filters.status || "all"} onChange={(e) => applyFilters({ status: e.target.value })}><option value="all">All Status</option>{statusOptions.map((x) => <option key={x} value={x}>{asTitle(x)}</option>)}</select>
                <select className={fieldClass} value={filters.priority || "all"} onChange={(e) => applyFilters({ priority: e.target.value })}><option value="all">All Priority</option>{priorityOptions.map((x) => <option key={x} value={x}>{asTitle(x)}</option>)}</select>
                <select className={fieldClass} value={filters.agent || "all"} onChange={(e) => applyFilters({ agent: e.target.value })}><option value="all">All Agents</option>{agents.map((a: any) => <option key={a._id} value={a._id}>{a.name}</option>)}</select>
                <input type="date" className={fieldClass} value={filters.dueDate || ""} onChange={(e) => applyFilters({ dueDate: e.target.value })} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["table", "board", "calendar", "analytics"].map((x) => <button key={x} onClick={() => setTab(x)} className={`rounded-xl px-3 py-2 text-xs font-bold ${tab === x ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{asTitle(x)}</button>)}
                <button onClick={() => applyFilters({ search: "", status: "all", priority: "all", agent: "all", dueDate: "", page: 1 })} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700"><Icon as={FaFilter} /> Reset</button>
              </div>
            </section>

            {selected.length > 0 && <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950 p-4 text-white"><span className="text-sm font-bold">{selected.length} selected</span><div className="flex flex-wrap gap-2"><button onClick={() => doBulk("status", { status: "completed" })} className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold">Mark Completed</button><button onClick={() => doBulk("delete")} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold">Bulk Delete</button></div></section>}

            {loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500"><Icon as={FaSpinner} className="mx-auto mb-3 animate-spin text-blue-600" /> Loading tasks...</div> : tab === "table" ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="overflow-x-hidden">
                  <table className="w-full table-fixed text-left">
                    <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-950">
                      <tr>
                        <th className="w-9 p-2"><input type="checkbox" checked={selected.length === tasks.length && tasks.length > 0} onChange={() => setSelected(selected.length === tasks.length ? [] : tasks.map((t: any) => t._id))} /></th>
                        <th className="w-[17%] p-2">Task</th>
                        <th className="w-[14%] p-2">Agent</th>
                        <th className="w-[14%] p-2">Lead</th>
                        <th className="w-[10%] p-2">Priority</th>
                        <th className="w-[11%] p-2">Status</th>
                        <th className="w-[13%] p-2">Due Date</th>
                        <th className="w-[11%] p-2">Created</th>
                        <th className="w-28 p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {tasks.map((task: any) => (
                        <tr key={task._id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20">
                          <td className="p-2 align-top"><input type="checkbox" checked={selected.includes(task._id)} onChange={() => toggleSelect(task._id)} /></td>
                          <td className="p-2 align-top">
                            <p className="break-words text-sm font-extrabold leading-5 text-slate-800 dark:text-white">{task.title}</p>
                            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-500">Created by {creatorName(task)}</p>
                            <p className="mt-1 line-clamp-2 break-words text-xs leading-4 text-slate-500">{task.description || "-"}</p>
                          </td>
                          <td className="break-words p-2 align-top text-sm">{task.assignedTo?.name || "-"}</td>
                          <td className="break-words p-2 align-top text-sm">{task.relatedLead?.name || "-"}</td>
                          <td className="p-2 align-top"><span className={`inline-flex max-w-full break-words rounded-full px-2 py-1 text-[11px] font-bold ${priorityTone(task.priority)}`}>{asTitle(task.priority)}</span></td>
                          <td className="p-2 align-top"><span className={`inline-flex max-w-full break-words rounded-full px-2 py-1 text-[11px] font-bold ${statusTone(task.computedStatus)}`}>{asTitle(task.computedStatus)}</span></td>
                          <td className="break-words p-2 align-top text-xs leading-4">{fmtDate(task.dueDate)}</td>
                          <td className="break-words p-2 align-top text-xs leading-4">{fmtDate(task.createdAt)}</td>
                          <td className="w-28 p-2 align-top">
                            <div className="flex flex-nowrap items-center justify-center gap-1">
                              <button onClick={() => setDetails(task)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon as={FaRegCommentDots} size={12} /></button>
                              <button onClick={() => setModalTask(task)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100"><Icon as={FaEdit} size={12} /></button>
                              <button onClick={() => deleteTask(task._id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"><Icon as={FaTrash} size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tasks.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No tasks found. Create a task to start tracking agent work.</div>}
                <div className="flex items-center justify-between border-t border-slate-100 p-3 text-sm"><span>Showing {tasks.length} of {pagination.total}</span><div className="flex items-center gap-2"><button disabled={pagination.page <= 1} onClick={() => applyFilters({ page: pagination.page - 1 })} className="rounded-lg border p-2 disabled:opacity-40"><Icon as={FaChevronLeft} /></button><b>Page {pagination.page}/{pagination.totalPages}</b><button disabled={pagination.page >= pagination.totalPages} onClick={() => applyFilters({ page: pagination.page + 1 })} className="rounded-lg border p-2 disabled:opacity-40"><Icon as={FaChevronRight} /></button></div></div>
              </section>
            ) : tab === "board" ? (
              <section className="grid grid-flow-col auto-cols-[280px] gap-4 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-5">{rowsByStatus.slice(0, 5).map(({ status, tasks: columnTasks }) => <div key={status} className="min-h-[420px] rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-3 flex justify-between text-sm font-extrabold">{asTitle(status)}<span>{columnTasks.length}</span></h3>{columnTasks.map((task: any) => <div key={task._id} draggable onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)} onDoubleClick={() => setDetails(task)} className="mb-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800"><p className="font-bold">{task.title}</p><p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-500">Created by {creatorName(task)}</p><p className="mt-1 text-xs text-slate-500">{task.assignedTo?.name}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${priorityTone(task.priority)}`}>{asTitle(task.priority)}</span></div>)}</div>)}</section>
            ) : tab === "calendar" ? (
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{tasks.map((task: any) => <div key={task._id} onClick={() => setDetails(task)} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><p className="text-xs font-bold uppercase text-slate-400">{fmtDate(task.dueDate)}</p><h3 className="mt-2 font-extrabold">{task.title}</h3><p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-500">Created by {creatorName(task)}</p><p className="mt-1 text-sm text-slate-500">{task.assignedTo?.name || "Unassigned"}</p><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-xs font-bold ${priorityTone(task.priority)}`}>{asTitle(task.priority)}</span></div>)}</section>
            ) : (
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-4 font-extrabold">Agent Productivity</h3><ResponsiveContainer width="100%" height={280}><BarChart data={charts.byAgent || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="agent" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="assigned" fill="#2563eb" /><Bar dataKey="completed" fill="#16a34a" /><Bar dataKey="overdue" fill="#ef4444" /></BarChart></ResponsiveContainer></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-4 font-extrabold">Priority Distribution</h3><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={charts.byPriority || []} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88}>{(charts.byPriority || []).map((_: any, i: number) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3 dark:border-slate-700 dark:bg-slate-900"><h3 className="mb-4 font-extrabold">Completed vs Pending Tasks</h3><ResponsiveContainer width="100%" height={240}><AreaChart data={charts.byStatus || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area dataKey="value" fill="#2563eb" stroke="#2563eb" /></AreaChart></ResponsiveContainer></div></section>
            )}
          </div>
        </main>
      </div>
      <AnimatePresence>{(showCreate || modalTask) && <TaskModal task={modalTask} onClose={() => { setShowCreate(false); setModalTask(null); }} />}{details && <TaskDetails task={details} onClose={() => setDetails(null)} />}</AnimatePresence>
      {toast && <button onClick={() => setToast("")} className="fixed bottom-5 right-5 z-[1300] rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">{toast}</button>}
    </div>
  );
};

const ManagerTasksPage = () => <ManagerTaskProvider><ManagerTasksContent /></ManagerTaskProvider>;
export default ManagerTasksPage;
