import { useEffect, useState } from "react";
import { Bell, CalendarDays, CheckCheck, ChevronLeft, ChevronRight, Clock, Megaphone, RefreshCcw, Trash2 } from "lucide-react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import "../../assets/styles/Dashboard.css";
import { deleteAgentNotification, getAgentFollowups, getAgentLeads, getAgentNotifications, getAgentTasks, markAgentNotificationRead, markAllAgentNotificationsRead } from "../../services/agentService";

const title = (value?: string) => String(value || "-").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const date = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
const monthLabel = (value: Date) => value.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const statusTone = (status?: string) => status === "completed" ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : status === "missed" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : status === "rescheduled" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
const notificationTypeLabel = (type?: string) => ({
  new_lead: "New lead assigned",
  lead_assigned: "New lead assigned",
  follow_up_due: "Followup reminder",
  task_assigned: "Task assigned",
  lead_updated: "Lead status updated",
  lead_status_updated: "Lead status updated",
  meeting_scheduled: "Meeting reminder",
  meeting_reminder: "Meeting reminder",
}[String(type || "")] || title(type));
const notificationTone = (type?: string) => ["follow_up_due", "meeting_scheduled", "meeting_reminder"].includes(String(type)) ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : String(type) === "task_assigned" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" : ["lead_updated", "lead_status_updated"].includes(String(type)) ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

const buildMonthDays = (cursor: Date) => {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }).map((_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
};

const CalendarView = ({ rows }: { rows: any[] }) => {
  const [cursor, setCursor] = useState(new Date());
  const today = new Date();
  const days = buildMonthDays(cursor);
  const events = rows
    .filter((row) => row.scheduledDate)
    .map((row) => ({ ...row, eventDate: new Date(row.scheduledDate) }))
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  const monthEvents = events.filter((event) => event.eventDate.getMonth() === cursor.getMonth() && event.eventDate.getFullYear() === cursor.getFullYear());
  const upcoming = events.filter((event) => event.eventDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())).slice(0, 6);
  const moveMonth = (step: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + step, 1));

  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_280px]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><CalendarDays size={17} /></span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500 dark:text-cyan-300">Followup Calendar</p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{monthLabel(cursor)}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => moveMonth(-1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ChevronLeft size={16} /></button>
            <button onClick={() => setCursor(new Date())} className="h-9 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Today</button>
            <button onClick={() => moveMonth(1)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-[10px] font-black uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="p-1.5">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = monthEvents.filter((event) => sameDay(event.eventDate, day));
            const muted = day.getMonth() !== cursor.getMonth();
            const active = sameDay(day, today);
            return (
              <div key={day.toISOString()} className={`min-h-[58px] border-b border-r border-slate-100 p-1 dark:border-slate-800 ${muted ? "bg-slate-50/70 text-slate-400 dark:bg-slate-950/40" : "bg-white dark:bg-slate-900"}`}>
                <div className={`mb-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${active ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-200"}`}>{day.getDate()}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div key={event._id} className={`truncate rounded px-1 py-0.5 text-[9px] font-bold ${statusTone(event.status)}`} title={`${event.lead?.name || "Lead"} - ${title(event.followUpType)}`}>
                      {event.lead?.name || "Lead"}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <p className="text-[10px] font-bold text-slate-400">+{dayEvents.length - 2}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Upcoming</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">{monthEvents.length} followups in {monthLabel(cursor)}</p>
        <div className="mt-2 space-y-2">
          {upcoming.length ? upcoming.slice(0, 4).map((event) => (
            <div key={event._id} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-black text-slate-900 dark:text-white">{event.lead?.name || "Lead"}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{title(event.followUpType)}{event.lead?.company ? ` - ${event.lead.company}` : ""}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${statusTone(event.status)}`}>{title(event.status)}</span>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500"><Clock size={13} />{date(event.scheduledDate)}</p>
            </div>
          )) : <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">No upcoming followups.</div>}
        </div>
      </aside>
    </div>
  );
};

const NotificationsView = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await getAgentNotifications(filter === "unread" ? { unreadOnly: true } : {});
      const next = response.data?.notifications || [];
      if (quiet && notifications.length && next[0]?._id && next[0]._id !== notifications[0]?._id) {
        setToast(next[0].title || "New notification");
        window.setTimeout(() => setToast(""), 3500);
      }
      setNotifications(next);
      setUnreadCount(response.data?.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => {
    const timer = window.setInterval(() => load(true), 15000);
    return () => window.clearInterval(timer);
  }, [filter, notifications]);

  const markRead = async (id: string) => { await markAgentNotificationRead(id); load(true); };
  const markAll = async () => { await markAllAgentNotificationsRead(); load(true); };
  const remove = async (id: string) => { await deleteAgentNotification(id); load(true); };

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_300px]">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><Bell size={18} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black">{unreadCount}</span>}</span>
            <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500 dark:text-cyan-300">Real-time Notification System</p><h1 className="text-xl font-black text-slate-900 dark:text-white">Notifications</h1></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter(filter === "all" ? "unread" : "all")} className="h-9 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">{filter === "all" ? "Unread" : "All"}</button>
            <button onClick={markAll} disabled={!unreadCount} className="flex h-9 items-center gap-2 rounded-xl bg-green-50 px-3 text-xs font-black text-green-700 disabled:opacity-50 dark:bg-green-950/40 dark:text-green-300"><CheckCheck size={14} />Read All</button>
            <button onClick={() => load()} className="h-9 rounded-xl border border-slate-200 px-3 text-slate-600 dark:border-slate-700 dark:text-slate-200"><RefreshCcw size={14} /></button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? <div className="p-10 text-center text-sm text-slate-500">Loading notifications...</div> : notifications.length ? notifications.map((item) => (
            <div key={item._id} className={`flex gap-3 p-4 transition hover:bg-blue-50/40 dark:hover:bg-blue-950/20 ${!item.isRead ? "bg-blue-50/50 dark:bg-blue-950/10" : ""}`}>
              <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notificationTone(item.type)}`}><Megaphone size={16} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-300">{item.message}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${notificationTone(item.type)}`}>{notificationTypeLabel(item.type)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-400">{date(item.createdAt)}</p>
                  <div className="flex gap-2">
                    {!item.isRead && <button onClick={() => markRead(item._id)} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-black text-green-700 dark:bg-green-950/40 dark:text-green-300">Mark read</button>}
                    <button onClick={() => remove(item._id)} className="rounded-lg bg-red-50 px-2 py-1.5 text-red-600 dark:bg-red-950/40 dark:text-red-300"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          )) : <div className="p-10 text-center text-sm text-slate-500">No notifications found.</div>}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="font-black text-slate-900 dark:text-white">Notification Types</h3>
        {["New lead assigned", "Followup reminder", "Task assigned", "Lead status updated", "Meeting reminder"].map((item) => <div key={item} className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-600 dark:bg-slate-950 dark:text-slate-300">{item}</div>)}
      </aside>
      {toast && <div className="fixed bottom-5 right-5 z-[1400] rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl">{toast}</div>}
    </section>
  );
};

const AgentModulePage = ({ module }: { module: "leads" | "followups" | "tasks" | "calendar" | "notifications" | "reports" | "settings" }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (module === "leads") setRows((await getAgentLeads()).data?.leads || []);
        else if (module === "followups" || module === "calendar") setRows((await getAgentFollowups()).data || []);
        else if (module === "tasks") setRows((await getAgentTasks()).data || []);
        else setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [module]);

  const heading = module === "settings" ? "Profile & Settings" : title(module);

  return (
    <div className="dashboard agent-dashboard-shell overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <main className="dashboard-content agent-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          {!["calendar", "notifications"].includes(module) && (
            <section className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Agent Panel</p>
              <h1 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-white">{heading}</h1>
            </section>
          )}

          {module === "calendar" ? (
            loading ? (
              <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ) : (
              <CalendarView rows={rows} />
            )
          ) : module === "notifications" ? (
            <NotificationsView />
          ) : <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {loading ? (
              <div className="h-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ) : module === "settings" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><b>Profile</b><p className="mt-1 text-sm text-slate-500">Use the top-right profile menu to open profile settings.</p></div>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><b>Preferences</b><p className="mt-1 text-sm text-slate-500">Dark mode and account controls are available in the header.</p></div>
              </div>
            ) : module === "reports" ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
                {heading} will show live CRM data as records are created for this agent.
              </div>
            ) : rows.length ? (
              <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 dark:bg-slate-950">
                    <tr><th className="p-3">Name</th><th className="p-3">Details</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.map((row: any) => (
                      <tr key={row._id}>
                        <td className="break-words p-3 font-bold text-slate-900 dark:text-white">{row.name || row.title || row.lead?.name || row.relatedLead?.name || "Record"}</td>
                        <td className="break-words p-3 text-xs text-slate-500">{row.company || row.description || row.notes || row.lead?.company || "-"}</td>
                        <td className="p-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{title(row.computedStatus || row.status || row.priority)}</span></td>
                        <td className="break-words p-3 text-xs">{date(row.dueDate || row.scheduledDate || row.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-slate-700">No records found.</div>
            )}
          </section>}
        </main>
      </div>
    </div>
  );
};

export default AgentModulePage;
