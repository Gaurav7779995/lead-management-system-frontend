import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
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
import { getAgentDashboard } from "../../services/agentService";

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2", "#db2777"];
const title = (value?: string) => String(value || "-").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const date = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

const emptyData = {
  stats: {},
  charts: { leadStatus: [], monthlyConversion: [] },
  recentLeads: [],
  upcomingFollowups: [],
  dailyTasks: [],
  notifications: [],
  activityTimeline: [],
  performance: {},
};

const StatCard = ({ label, value, icon: Icon, tone, suffix = "" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 260, damping: 22 }}
    className="group relative min-h-[118px] overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/50 dark:hover:shadow-blue-500/20"
  >
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:group-hover:opacity-100" />
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/5 transition-transform duration-500 group-hover:scale-125 dark:bg-cyan-400/10" />
    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-gradient-to-br dark:from-blue-500/10 dark:via-transparent dark:to-cyan-400/5" />
    <div className="flex h-full items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase leading-4 tracking-[0.08em] text-slate-400 dark:text-slate-500">{label}</p>
        <p className="mt-3 bg-gradient-to-br from-slate-950 to-slate-600 bg-clip-text text-3xl font-black leading-none text-transparent dark:from-white dark:to-slate-300">{value ?? 0}{suffix}</p>
      </div>
      <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 ${tone}`}>
        <Icon size={17} />
      </span>
    </div>
  </motion.div>
);

const Panel = ({ title: heading, children, className = "" }: any) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 240, damping: 26 }}
    className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-300/40 dark:border-slate-700 dark:bg-slate-900/95 dark:hover:border-blue-500/40 dark:hover:shadow-blue-500/10 ${className}`}
  >
    <div className="pointer-events-none absolute right-0 top-0 h-20 w-28 rounded-bl-full bg-gradient-to-br from-blue-50 to-cyan-50 opacity-80 dark:from-blue-500/15 dark:to-cyan-400/10" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/0 to-transparent transition-all duration-300 group-hover:via-blue-400/60" />
    <div className="relative mb-4 flex items-center gap-2">
      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-cyan-400" />
      <h2 className="bg-gradient-to-r from-slate-950 to-slate-600 bg-clip-text text-sm font-black tracking-tight text-transparent dark:from-white dark:to-slate-300">{heading}</h2>
    </div>
    {children}
  </motion.section>
);

const Skeleton = () => (
  <div className="space-y-4">
    <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);

const Empty = ({ label }: { label: string }) => (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950/70">
      {label}
    </div>
  );

const AgentDashboard = ({ user }: any) => {
  const [data, setData] = useState<any>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const load = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const response = await getAgentDashboard();
      setData(response.data || emptyData);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Agent dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(true);
  }, []);

  const filteredLeads = useMemo(() => {
    const q = query.toLowerCase();
    return (data.recentLeads || []).filter((lead: any) => {
      const matchesQuery = [lead.name, lead.email, lead.phone, lead.company].some((value) => String(value || "").toLowerCase().includes(q));
      const matchesStatus = status === "all" || lead.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [data.recentLeads, query, status]);

  if (loading) return <Skeleton />;
  if (error) return <Empty label={error} />;

  const stats = data.stats || {};
  const perf = data.performance || {};

  return (
    <div className="relative space-y-4 pb-8 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_28%)] dark:before:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.12),transparent_26%)]">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-lg shadow-slate-300/50 dark:border-blue-500/20 dark:shadow-blue-500/10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.10),transparent_35%,rgba(59,130,246,0.14))] dark:bg-[linear-gradient(120deg,rgba(34,211,238,0.16),transparent_35%,rgba(96,165,250,0.20))]" />
        <motion.div
          animate={{ x: [0, 12, 0], y: [0, -8, 0], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-2xl dark:bg-cyan-300/20"
        />
        <motion.div
          animate={{ x: [0, -10, 0], y: [0, 10, 0], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-blue-500/10 blur-2xl dark:bg-blue-400/20"
        />
        <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-5 text-white sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">Agent Workspace</p>
            <h1 className="mt-2 max-w-3xl bg-gradient-to-r from-white via-cyan-50 to-blue-100 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent sm:text-4xl">
              Welcome back, {user?.name || "Agent"}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] font-medium leading-7 text-slate-300">Your assigned leads, followups, tasks, and performance are synced from the CRM in near real time.</p>
          </div>
          <div className="relative grid content-center gap-3 bg-white/95 p-4 backdrop-blur dark:bg-slate-900/90 sm:grid-cols-2">
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl bg-blue-50 p-4 shadow-sm dark:bg-blue-950/30">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-blue-500">Conversion Rate</p>
              <p className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">{perf.conversionRate || 0}%</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl bg-emerald-50 p-4 shadow-sm dark:bg-emerald-950/30">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-emerald-600">Active Leads</p>
              <p className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">{perf.activeLeads || 0}</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
        <StatCard label="Total Assigned Leads" value={stats.totalAssignedLeads} icon={Users} tone="bg-blue-50 text-blue-600" />
        <StatCard label="New Leads" value={stats.newLeads} icon={UserCheck} tone="bg-cyan-50 text-cyan-600" />
        <StatCard label="Interested Leads" value={stats.interestedLeads} icon={Target} tone="bg-violet-50 text-violet-600" />
        <StatCard label="Followup Pending" value={stats.followupPending} icon={Clock} tone="bg-amber-50 text-amber-600" />
        <StatCard label="Converted Leads" value={stats.convertedLeads} icon={CheckCircle2} tone="bg-green-50 text-green-600" />
        <StatCard label="Lost Leads" value={stats.lostLeads} icon={XCircle} tone="bg-red-50 text-red-600" />
        <StatCard label="Today Followups" value={stats.todayFollowups} icon={CalendarClock} tone="bg-orange-50 text-orange-600" />
        <StatCard label="Monthly Performance" value={stats.monthlyPerformance} suffix="%" icon={TrendingUp} tone="bg-slate-100 text-slate-700" />
      </section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_110px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assigned leads..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="all">All Status</option>
            {["new", "contacted", "interested", "qualified", "follow_up", "converted", "lost"].map((item) => <option key={item} value={item}>{title(item)}</option>)}
          </select>
          <button onClick={() => { setQuery(""); setStatus("all"); }} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"><Filter size={15} /> Reset</button>
        </div>
      </motion.section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="Recent Assigned Leads" className="xl:col-span-2">
          {filteredLeads.length ? <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800"><table className="w-full table-fixed text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500 dark:bg-slate-950"><tr><th className="p-3 font-black">Lead</th><th className="p-3 font-black">Contact</th><th className="p-3 font-black">Status</th><th className="p-3 font-black">Priority</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredLeads.map((lead: any) => <tr key={lead._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20"><td className="p-3"><b className="break-words text-[15px] font-black tracking-tight text-slate-900 dark:text-white">{lead.name}</b><p className="break-words text-xs font-medium text-slate-500">{lead.company || "-"}</p></td><td className="break-words p-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{lead.phone || lead.email || "-"}</td><td className="p-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{title(lead.status)}</span></td><td className="p-3 text-xs font-black text-slate-700 dark:text-slate-300">{title(lead.priority)}</td></tr>)}</tbody></table></div> : <Empty label="No matching leads found." />}
        </Panel>
        <Panel title="Daily Tasks">
          {(data.dailyTasks || []).length ? <div className="space-y-3">{data.dailyTasks.map((task: any) => <div key={task._id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="flex items-start justify-between gap-3"><b className="break-words text-sm font-black tracking-tight text-slate-900 dark:text-white">{task.title}</b><span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700">{title(task.computedStatus)}</span></div><p className="mt-1 text-xs font-medium text-slate-500">{date(task.dueDate)}</p></div>)}</div> : <Empty label="No tasks due right now." />}
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="Upcoming Followups">
          {(data.upcomingFollowups || []).length ? <div className="space-y-3">{data.upcomingFollowups.map((item: any) => <div key={item._id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><b className="text-sm text-slate-900 dark:text-white">{item.lead?.name || "Lead"}</b><p className="mt-1 text-xs text-slate-500">{title(item.followUpType)} at {date(item.scheduledDate)}</p></div>)}</div> : <Empty label="No upcoming followups." />}
        </Panel>
        <Panel title="Activity Timeline">
          {(data.activityTimeline || []).length ? <div className="space-y-3">{data.activityTimeline.map((item: any) => <div key={item.id} className="border-l-2 border-blue-200 pl-3"><b className="text-sm text-slate-900 dark:text-white">{item.title}</b><p className="text-xs text-slate-500">{item.description}</p><p className="text-[11px] text-slate-400">{date(item.createdAt)}</p></div>)}</div> : <Empty label="No recent activity." />}
        </Panel>
        <Panel title="Recent Notifications">
          {(data.notifications || []).length ? <div className="space-y-3">{data.notifications.map((item: any) => <div key={item._id} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><Bell className="mt-0.5 shrink-0 text-blue-500" size={16} /><div><b className="text-sm text-slate-900 dark:text-white">{item.title}</b><p className="text-xs text-slate-500">{item.message}</p></div></div>)}</div> : <Empty label="No notifications yet." />}
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title="Lead Status Pie Chart">
          {(data.charts.leadStatus || []).length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={data.charts.leadStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95}>{data.charts.leadStatus.map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          ) : <Empty label="No lead status data yet." />}
        </Panel>
        <Panel title="Monthly Conversion Bar Chart" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.charts.monthlyConversion || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="assigned" fill="#2563eb" radius={[6, 6, 0, 0]} /><Bar dataKey="converted" fill="#16a34a" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Panel>
      </section>

      <Panel title="Performance Analytics">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { icon: Activity, label: "Conversion", value: `${perf.conversionRate || 0}%`, tone: "from-blue-50 to-cyan-50 text-blue-600 dark:from-blue-950/30 dark:to-cyan-950/20" },
            { icon: CheckCircle2, label: "Completed Tasks", value: perf.completedTasks || 0, tone: "from-green-50 to-emerald-50 text-green-600 dark:from-green-950/30 dark:to-emerald-950/20" },
            { icon: XCircle, label: "Overdue Tasks", value: perf.overdueTasks || 0, tone: "from-red-50 to-rose-50 text-red-600 dark:from-red-950/30 dark:to-rose-950/20" },
            { icon: Target, label: "Active Pipeline", value: perf.activeLeads || 0, tone: "from-violet-50 to-fuchsia-50 text-violet-600 dark:from-violet-950/30 dark:to-fuchsia-950/20" },
          ].map((item: any) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-slate-300/40 dark:hover:shadow-blue-500/10 ${item.tone}`}
            >
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/40 dark:bg-white/5" />
              <item.icon className="relative" size={20} />
              <p className="relative mt-3 text-xs font-black uppercase tracking-[0.08em]">{item.label}</p>
              <b className="relative text-3xl font-black tracking-tight text-slate-900 dark:text-white">{item.value}</b>
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/70 dark:bg-slate-800">
                <div className="h-full w-2/3 rounded-full bg-current opacity-70" />
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default AgentDashboard;
