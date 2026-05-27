import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Clock, Edit, GripHorizontal, Plus, RefreshCcw, Trash2, XCircle } from "lucide-react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import "../../assets/styles/Dashboard.css";
import { createAgentFollowup, deleteAgentFollowup, getAgentFollowups, getAgentLeads, updateAgentFollowup } from "../../services/agentService";
import { isBeforeToday, todayDateTimeInputValue } from "../../utils/dateValidation";

const title = (v?: string) => String(v || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const fmt = (v?: string) => v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
const fieldClass = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-blue-700 outline-none transition-all focus:border-blue-500 focus:bg-blue-50/40 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-cyan-200 dark:focus:bg-blue-950/20";
const followupStatuses = ["all", "pending", "in_progress", "completed", "missed", "rescheduled", "cancelled"];
const editableFollowupStatuses = followupStatuses.filter((x) => x !== "all");
const followupTypes = ["call", "whatsapp", "email", "meeting", "video_call", "demo", "site_visit", "consultation", "task", "other"];
const tone = (s: string) => s === "completed" ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : s === "missed" || s === "cancelled" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : s === "rescheduled" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" : s === "in_progress" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
const statusSurface = (s: string) => s === "completed" ? "bg-green-50/80 hover:bg-green-100/80 dark:bg-green-950/20 dark:hover:bg-green-950/35" : s === "missed" || s === "cancelled" ? "bg-red-50/80 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-950/35" : s === "rescheduled" ? "bg-violet-50/80 hover:bg-violet-100/80 dark:bg-violet-950/20 dark:hover:bg-violet-950/35" : s === "in_progress" ? "bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/35" : "bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/15 dark:hover:bg-blue-950/30";
const labelClass = "bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-[11px] font-black uppercase tracking-wide text-transparent dark:from-cyan-300 dark:via-blue-300 dark:to-emerald-300";

const Field = ({ label, children }: any) => (
  <label className={labelClass}>
    {label}
    <div className="mt-1">{children}</div>
  </label>
);

const DateTimeField = ({ label, value, onChange }: any) => (
  <Field label={label}>
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-cyan-300" size={16} />
      <input type="datetime-local" min={todayDateTimeInputValue()} className={`${fieldClass} pr-10`} value={value} onChange={onChange} />
    </div>
  </Field>
);

const ActionButton = ({ label, icon: Icon, className, onClick }: any) => (
  <button type="button" aria-label={label} onClick={onClick} className={`rounded-lg p-2 ${className}`}>
    <Icon size={14} />
  </button>
);

const FollowupForm = ({ item, leads, onClose, onSaved }: any) => {
  const notesRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<any>({
    lead: item?.lead?._id || item?.lead || "",
    scheduledDate: item?.scheduledDate ? String(item.scheduledDate).slice(0, 16) : "",
    scheduledTime: "",
    followUpType: item?.followUpType || "call",
    notes: item?.notes || "",
    reminderTime: item?.reminderTime ? String(item.reminderTime).slice(0, 16) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useLayoutEffect(() => {
    if (notesRef.current) notesRef.current.innerHTML = form.notes || "";
  }, []);
  const formatNote = (command: string) => {
    notesRef.current?.focus();
    document.execCommand(command, false);
    setForm({ ...form, notes: notesRef.current?.innerHTML || "" });
  };
  const submit = async () => {
    setSaving(true);
    setError("");
    if (isBeforeToday(form.scheduledDate)) {
      setSaving(false);
      setError("Followup date cannot be in the past.");
      return;
    }
    if (isBeforeToday(form.reminderTime)) {
      setSaving(false);
      setError("Reminder date cannot be in the past.");
      return;
    }
    try {
      const payload = {
        ...form,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : "",
        reminderTime: form.reminderTime ? new Date(form.reminderTime).toISOString() : null,
      };
      if (item?._id) await updateAgentFollowup(item._id, payload);
      else await createAgentFollowup(payload);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Followup save failed.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center overflow-hidden bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4">
      <motion.div drag dragMomentum={false} dragElastic={0.08} initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="cursor-move border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25"><CalendarDays size={19} /></span>
              <div className="min-w-0"><p className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-[10px] font-black uppercase tracking-[0.18em] text-transparent dark:from-cyan-300 dark:via-blue-300 dark:to-emerald-300">Followup Details</p><motion.h2 animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="bg-[linear-gradient(90deg,#0f172a,#2563eb,#0891b2,#0f172a)] bg-[length:220%_100%] bg-clip-text text-lg font-black text-transparent dark:bg-[linear-gradient(90deg,#ffffff,#67e8f9,#60a5fa,#ffffff)]">{item ? "Edit Followup" : "Add Followup"}</motion.h2><p className="mt-0.5 bg-gradient-to-r from-slate-500 to-blue-500 bg-clip-text text-xs font-semibold text-transparent dark:from-slate-300 dark:to-cyan-300">Schedule the next touchpoint and keep context in one place.</p></div>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"><XCircle size={18} /></button>
          </div>
        </div>
        <div className="bg-slate-50 p-3 dark:bg-slate-950/60">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Lead"><select className={fieldClass} value={form.lead} disabled={!!item} onChange={(e) => setForm({ ...form, lead: e.target.value })}><option value="">Select Lead</option>{leads.map((lead: any) => <option key={lead._id} value={lead._id}>{lead.name} {lead.company ? `- ${lead.company}` : ""}</option>)}</select></Field>
          <DateTimeField label="Date & Time" value={form.scheduledDate} onChange={(e: any) => setForm({ ...form, scheduledDate: e.target.value })} />
          <Field label="Type"><select className={fieldClass} value={form.followUpType} onChange={(e) => setForm({ ...form, followUpType: e.target.value })}>{followupTypes.map((x) => <option key={x} value={x}>{title(x)}</option>)}</select></Field>
          <DateTimeField label="Reminder" value={form.reminderTime} onChange={(e: any) => setForm({ ...form, reminderTime: e.target.value })} />
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <p className={labelClass}>Notes</p>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">MS Word</span>
            </div>
            <motion.div whileFocus={{ scale: 1.01 }} className="group mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-500/40">
              <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1.5 dark:bg-slate-900">
                <span className="mr-2 hidden bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-[10px] font-black uppercase tracking-widest text-transparent sm:inline">Font</span>
                {[
                  ["bold", "B"],
                  ["italic", "I"],
                  ["underline", "U"],
                  ["insertUnorderedList", "• List"],
                  ["insertOrderedList", "1. List"],
                ].map(([command, label]) => (
                  <button
                    key={command}
                    type="button"
                    onClick={() => formatNote(command)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/30"
                  >
                    {label}
                  </button>
                ))}
                </div>
              </div>
              <div className="relative bg-slate-200/70 p-2 dark:bg-slate-950">
                <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
                <div
                  className="mx-auto min-h-[86px] max-w-2xl bg-white px-4 py-3 text-left text-sm leading-6 text-slate-900 shadow-md outline-none ring-1 ring-slate-200 empty:before:text-slate-400 empty:before:content-['Write_followup_notes...'] dark:bg-slate-900 dark:text-white dark:ring-slate-700 sm:min-h-[105px]"
                  ref={notesRef}
                  contentEditable
                  suppressContentEditableWarning
                  dir="ltr"
                  onInput={(e) => setForm({ ...form, notes: (e.currentTarget as HTMLDivElement).innerHTML })}
                />
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Supports formatted notes for calls, meetings, and next actions.</span>
                  <span>{String(form.notes || "").replace(/<[^>]+>/g, "").length} chars</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        </div>
        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={onClose} className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button><button disabled={saving || !form.lead || !form.scheduledDate} onClick={submit} className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save Followup"}</button></div>
        {error && <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
        </div>
      </motion.div>
    </div>
  );
};

const AgentFollowupsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [followRes, leadRes] = await Promise.all([getAgentFollowups(filter === "all" ? {} : { status: filter }), getAgentLeads({ limit: 200 })]);
      setItems(followRes.data || []);
      setLeads(leadRes.data?.leads || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [filter]);
  const now = new Date();
  const enriched = useMemo(() => items.map((i) => ({ ...i, computedStatus: i.status === "pending" && new Date(i.scheduledDate) < now ? "missed" : i.status })), [items]);
  const computedStats = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return {
      today: enriched.filter((f) => new Date(f.scheduledDate) >= start && new Date(f.scheduledDate) <= end && f.status !== "completed").length,
      upcoming: enriched.filter((f) => new Date(f.scheduledDate) > end && f.status !== "completed").length,
      missed: enriched.filter((f) => f.computedStatus === "missed").length,
      completed: enriched.filter((f) => f.status === "completed").length,
    };
  }, [enriched]);
  const complete = async (id: string) => { await updateAgentFollowup(id, { status: "completed" }); load(); };
  const changeStatus = async (id: string, status: string) => { await updateAgentFollowup(id, { status }); load(); };
  const remove = async (id: string) => { if (window.confirm("Delete this followup?")) { await deleteAgentFollowup(id); load(); } };

  return (
    <div className="dashboard agent-dashboard-shell overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar /><div className="main-content min-w-0 overflow-x-hidden"><Navbar />
        <main className="dashboard-content agent-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 dark:border-blue-500/20 dark:bg-slate-900 dark:shadow-blue-500/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(34,197,94,0.12),transparent_28%)]" />
            <motion.div animate={{ x: [0, 12, 0], opacity: [0.25, 0.45, 0.25] }} transition={{ duration: 6, repeat: Infinity }} className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <motion.span animate={{ rotate: [0, 8, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <CalendarDays size={20} />
                </motion.span>
                <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500 dark:text-cyan-300">Agent Followup Center</p><h1 className="bg-gradient-to-r from-slate-950 to-slate-600 bg-clip-text text-2xl font-black tracking-tight text-transparent dark:from-white dark:to-slate-300">Followup Management</h1><p className="text-sm font-medium text-slate-500 dark:text-slate-300">Track today, upcoming, missed and completed followups with reminders.</p></div>
              </div>
              <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setModal({})} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-500/25"><Plus size={16} /> Add Followup</motion.button>
            </div>
          </motion.section>
          <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[["Today Followups", computedStats.today, Clock, "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"], ["Upcoming Followups", computedStats.upcoming, CalendarDays, "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"], ["Missed Followups", computedStats.missed, XCircle, "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"], ["Completed Followups", computedStats.completed, CheckCircle2, "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"]].map(([label, value, Icon, cls]: any, i) => <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -5, scale: 1.01 }} key={label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/40"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 opacity-0 transition-opacity group-hover:opacity-100" /><div className="flex justify-between"><div><p className="text-xs font-black uppercase text-slate-400">{label}</p><b className="text-3xl text-slate-900 dark:text-white">{value || 0}</b></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:rotate-3 group-hover:scale-110 ${cls}`}><Icon size={18} /></span></div></motion.div>)}
          </section>
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
            <div className="flex flex-wrap gap-2">{["table", "calendar", "timeline"].map((x) => <button key={x} onClick={() => setView(x)} className={`rounded-xl px-3 py-2 text-xs font-black ${view === x ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{title(x)} View</button>)}</div>
            <div className="flex gap-2"><select className={fieldClass} value={filter} onChange={(e) => setFilter(e.target.value)}>{followupStatuses.map((x) => <option key={x} value={x}>{title(x)}</option>)}</select><button onClick={load} className="rounded-xl border px-3"><RefreshCcw size={15} /></button></div>
          </motion.section>
          {loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500">Loading followups...</div> : view === "table" ? (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><table className="w-full table-fixed text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-950"><tr>{["Lead","Date/Time","Type","Notes","Reminder","Status","Actions"].map((h) => <th key={h} className="p-3 font-black">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{enriched.length ? enriched.map((f, i) => <motion.tr initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }} key={f._id} className={`align-top transition-colors ${statusSurface(f.computedStatus)}`}><td className="break-words p-3 font-black text-slate-900 dark:text-white">{f.lead?.name || "-"}</td><td className="p-3 text-xs font-semibold">{fmt(f.scheduledDate)}<p className="text-slate-400">{f.scheduledTime}</p></td><td className="p-3 font-bold">{title(f.followUpType)}</td><td className="break-words p-3 text-xs text-slate-500">{f.notes ? String(f.notes).replace(/<[^>]+>/g, "") : "-"}</td><td className="p-3 text-xs">{fmt(f.reminderTime)}</td><td className="p-3"><select value={f.status} onChange={(e) => changeStatus(f._id, e.target.value)} className={`max-w-full rounded-full px-2 py-1 text-xs font-black outline-none ${tone(f.computedStatus)}`}>{editableFollowupStatuses.map((x) => <option key={x} value={x}>{title(x)}</option>)}</select></td><td className="p-3"><div className="flex flex-nowrap gap-1"><ActionButton label="Edit Followup" icon={Edit} onClick={() => setModal(f)} className="bg-blue-50 text-blue-600" /><ActionButton label="Reschedule" icon={RefreshCcw} onClick={() => changeStatus(f._id, "rescheduled")} className="bg-violet-50 text-violet-600" /><ActionButton label="Delete Followup" icon={Trash2} onClick={() => remove(f._id)} className="bg-red-50 text-red-600" /></div></td></motion.tr>) : <tr><td colSpan={7} className="p-10 text-center text-slate-500">No followups found.</td></tr>}</tbody></table></motion.section>
          ) : view === "calendar" ? (
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{enriched.map((f, i) => <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }} key={f._id} className={`relative overflow-hidden rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-lg dark:border-slate-700 ${statusSurface(f.computedStatus)}`}><div className="absolute right-0 top-0 h-16 w-20 rounded-bl-full bg-white/50 dark:bg-slate-900/40" /><p className="relative text-xs font-black uppercase text-blue-500">{fmt(f.scheduledDate)}</p><h3 className="relative mt-2 font-black text-slate-900 dark:text-white">{f.lead?.name || "Lead"}</h3><p className="relative text-sm text-slate-500">{title(f.followUpType)} - {f.notes ? String(f.notes).replace(/<[^>]+>/g, "") : "No notes"}</p><select value={f.status} onChange={(e) => changeStatus(f._id, e.target.value)} className={`relative mt-3 rounded-full px-2 py-1 text-xs font-black outline-none ${tone(f.computedStatus)}`}>{editableFollowupStatuses.map((x) => <option key={x} value={x}>{title(x)}</option>)}</select></motion.div>)}</section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">{enriched.map((f, i) => <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} key={f._id} className="relative border-l-2 border-blue-200 pb-5 pl-4"><span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/30" /><p className="text-xs font-black text-blue-500">{fmt(f.scheduledDate)}</p><h3 className="font-black text-slate-900 dark:text-white">{f.lead?.name || "Lead"} - {title(f.followUpType)}</h3><p className="text-sm text-slate-500">{f.notes ? String(f.notes).replace(/<[^>]+>/g, "") : "No notes"}</p></motion.div>)}</section>
          )}
        </main>
      </div>
      <AnimatePresence>{modal && <FollowupForm item={modal._id ? modal : null} leads={leads} onClose={() => setModal(null)} onSaved={load} />}</AnimatePresence>
    </div>
  );
};

export default AgentFollowupsPage;
