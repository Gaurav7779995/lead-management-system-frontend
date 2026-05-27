import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, FileUp, ListChecks, MessageSquare, Search, Target, TimerReset, XCircle } from "lucide-react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import "../../assets/styles/Dashboard.css";
import { addAgentTaskFile, addAgentTaskNote, getAgentTasks, updateAgentTaskStatus } from "../../services/agentService";

const title = (v?: string) => String(v || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const fmt = (v?: string) => v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
const statusTone = (s: string) => s === "completed" ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : s === "in_progress" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : s === "overdue" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
const statusSurface = (s: string) => s === "completed" ? "agent-task-card agent-task-card-completed" : s === "in_progress" ? "agent-task-card agent-task-card-progress" : s === "overdue" ? "agent-task-card agent-task-card-overdue" : "agent-task-card agent-task-card-pending";
const priorityTone = (p: string) => p === "urgent" ? "agent-task-priority agent-task-priority-urgent" : p === "high" ? "agent-task-priority agent-task-priority-high" : p === "low" ? "agent-task-priority agent-task-priority-low" : "agent-task-priority agent-task-priority-medium";
const progress = (task: any) => task.computedStatus === "completed" ? 100 : task.computedStatus === "in_progress" ? 55 : task.computedStatus === "overdue" ? 20 : 30;
const creatorName = (task: any) => task.assignedBy?.name || task.createdBy?.name || "Unknown";

const ActionModal = ({ type, task, onClose, onDone }: any) => {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      if (type === "note") await addAgentTaskNote(task._id, form.text || "");
      else await addAgentTaskFile(task._id, form);
      onDone();
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex justify-between"><h2 className="text-lg font-black dark:text-white">{type === "note" ? "Add Task Note" : "Upload Task File"}</h2><button onClick={onClose}><XCircle size={18} /></button></div>
        {type === "note" ? <textarea className="min-h-[130px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Write task note..." onChange={(e) => setForm({ text: e.target.value })} /> : <div className="grid gap-3"><input className="h-11 rounded-xl border bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="File name" onChange={(e) => setForm({ ...form, fileName: e.target.value })} /><input className="h-11 rounded-xl border bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="File URL" onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /><input className="h-11 rounded-xl border bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="File type" onChange={(e) => setForm({ ...form, fileType: e.target.value })} /></div>}
        <div className="mt-4 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-bold">Cancel</button><button disabled={saving} onClick={submit} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button></div>
      </motion.div>
    </div>
  );
};

const AgentTasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setTasks((await getAgentTasks()).data || []); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const stats = useMemo(() => ({
    daily: tasks.filter((t) => new Date(t.dueDate) <= todayEnd && t.computedStatus !== "completed").length,
    pending: tasks.filter((t) => t.computedStatus === "pending").length,
    completed: tasks.filter((t) => t.computedStatus === "completed").length,
    priority: tasks.filter((t) => ["high", "urgent"].includes(t.priority)).length,
  }), [tasks]);
  const rows = tasks.filter((t) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [t.title, t.description, t.category, t.relatedLead?.name, t.relatedLead?.company].some((value) => String(value || "").toLowerCase().includes(query));
    const matchesFilter = filter === "all" || t.computedStatus === filter || (filter === "priority" && ["high", "urgent"].includes(t.priority));
    return matchesSearch && matchesFilter;
  });
  const setStatus = async (id: string, status: string) => { await updateAgentTaskStatus(id, status); load(); };

  return (
    <div className="dashboard agent-dashboard-shell overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar /><div className="main-content min-w-0 overflow-x-hidden"><Navbar />
        <main className="dashboard-content agent-dashboard-theme agent-tasks-theme min-w-0 max-w-full overflow-x-hidden">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-blue-500/20 dark:bg-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.12),transparent_30%)]" />
            <div className="relative flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg"><ListChecks size={18} /></span><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500">Agent Task Center</p><h1 className="text-xl font-black text-slate-900 dark:text-white">Task Management</h1></div></div>
          </motion.section>
          <section className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{[["Daily Tasks", stats.daily, Clock, "bg-blue-50 text-blue-700"], ["Pending Tasks", stats.pending, TimerReset, "bg-amber-50 text-amber-700"], ["Completed Tasks", stats.completed, CheckCircle2, "bg-green-50 text-green-700"], ["Priority Tasks", stats.priority, AlertTriangle, "bg-red-50 text-red-700"]].map(([label, value, Icon, cls]: any, i) => <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }} key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex justify-between"><div><p className="text-[11px] font-black uppercase text-slate-400">{label}</p><b className="text-2xl text-slate-900 dark:text-white">{value}</b></div><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${cls}`}><Icon size={16} /></span></div></motion.div>)}</section>
          <section className="mb-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[1fr_auto]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks, lead, description..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div><div className="flex flex-wrap gap-2">{["all", "pending", "in_progress", "completed", "overdue", "priority"].map((x) => <button key={x} onClick={() => setFilter(x)} className={`rounded-xl px-3 py-2 text-xs font-black ${filter === x ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{title(x)}</button>)}</div></section>
          {loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500">Loading tasks...</div> : <section className="grid gap-3 xl:grid-cols-2">{rows.length ? rows.map((task, i) => <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} key={task._id} className={`rounded-xl border border-slate-200 p-3 shadow-sm transition hover:shadow-lg dark:border-slate-700 ${statusSurface(task.computedStatus)}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900 dark:text-white">{task.title}</h3><p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-500">Created by {creatorName(task)}</p><p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description || "No description"}</p><p className="mt-1 text-xs text-slate-400">Deadline: {fmt(task.dueDate)}</p></div><span className={`rounded-full px-2 py-1 text-xs font-black ${priorityTone(task.priority)}`}>{title(task.priority)}</span></div><div className="mt-3"><div className="mb-1 flex justify-between text-xs font-black text-slate-400"><span>Progress</span><span>{progress(task)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/70 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${progress(task)}%` }} /></div></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><select value={task.computedStatus === "overdue" ? task.status : task.computedStatus} onChange={(e) => setStatus(task._id, e.target.value)} className={`rounded-full px-2 py-1 text-xs font-black outline-none ${statusTone(task.computedStatus)}`}>{["pending", "in_progress", "completed"].map((s) => <option key={s} value={s}>{title(s)}</option>)}</select><div className="flex gap-2"><button title="Add task notes" onClick={() => setModal({ type: "note", task })} className="rounded-lg bg-blue-50 p-2 text-blue-600"><MessageSquare size={15} /></button><button title="Upload task files" onClick={() => setModal({ type: "file", task })} className="rounded-lg bg-violet-50 p-2 text-violet-600"><FileUp size={15} /></button><button title="Mark completed" onClick={() => setStatus(task._id, "completed")} className="rounded-lg bg-green-50 p-2 text-green-600"><CheckCircle2 size={15} /></button></div></div></motion.div>) : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">No tasks match your search.</div>}</section>}
        </main>
      </div>
      <AnimatePresence>{modal && <ActionModal type={modal.type} task={modal.task} onClose={() => setModal(null)} onDone={load} />}</AnimatePresence>
    </div>
  );
};

export default AgentTasksPage;
