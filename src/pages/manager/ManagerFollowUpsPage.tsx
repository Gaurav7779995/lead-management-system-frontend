import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaColumns,
  FaDownload,
  FaEdit,
  FaEllipsisV,
  FaEnvelope,
  FaExclamationTriangle,
  FaFilter,
  FaPhoneAlt,
  FaPlus,
  FaRegCalendarAlt,
  FaSearch,
  FaSpinner,
  FaTable,
  FaTasks,
  FaTrash,
  FaUserCheck,
  FaVideo,
  FaWhatsapp,
} from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import {
  ManagerFollowUpProvider,
  useManagerFollowUps,
} from "../../contexts/followups/ManagerFollowUpContext";
import {
  FollowUpFilters,
  ManagerFollowUp,
} from "../../services/managerFollowUpService";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { isBeforeToday, todayDateInputValue, todayDateTimeInputValue } from "../../utils/dateValidation";

const statusOptions = [
  { value: "pending", label: "Pending", tone: "followup-status-pill followup-status-pending bg-amber-100 text-amber-700" },
  { value: "in_progress", label: "In Progress", tone: "followup-status-pill followup-status-in-progress bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", tone: "followup-status-pill followup-status-completed bg-green-100 text-green-700" },
  { value: "missed", label: "Missed", tone: "followup-status-pill followup-status-missed bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", tone: "followup-status-pill followup-status-cancelled bg-slate-100 text-slate-700" },
  { value: "rescheduled", label: "Rescheduled", tone: "followup-status-pill followup-status-rescheduled bg-violet-100 text-violet-700" },
];

const typeOptions = [
  { value: "call", label: "Phone Call", icon: FaPhoneAlt },
  { value: "whatsapp", label: "WhatsApp", icon: FaWhatsapp },
  { value: "email", label: "Email", icon: FaEnvelope },
  { value: "meeting", label: "Meeting", icon: FaCalendarAlt },
  { value: "video_call", label: "Video Call", icon: FaVideo },
  { value: "demo", label: "Demo", icon: FaTasks },
  { value: "site_visit", label: "Site Visit", icon: FaUserCheck },
  { value: "consultation", label: "Consultation", icon: FaClock },
];

const kanbanColumns = ["pending", "in_progress", "completed", "missed", "cancelled"];
const chartColors = ["#17145b", "#355f91", "#3db0a6", "#2b3578", "#49b9b0", "#2f7f9a"];

const fmtDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

const fmtTime = (date?: string, time?: string) =>
  time ||
  (date
    ? new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--");

const statusLabel = (status?: string) =>
  statusOptions.find((item) => item.value === status)?.label || status || "Pending";

const statusTone = (status?: string) =>
  statusOptions.find((item) => item.value === status)?.tone ||
  "followup-status-pill followup-status-cancelled bg-slate-100 text-slate-700";

const statusStyle = (status?: string): React.CSSProperties => {
  const styles: Record<string, React.CSSProperties> = {
    pending: { backgroundColor: "#fef3c7", color: "#78350f" },
    in_progress: { backgroundColor: "#bfdbfe", color: "#1e3a8a" },
    completed: { backgroundColor: "#bbf7d0", color: "#14532d" },
    missed: { backgroundColor: "#fecaca", color: "#7f1d1d" },
    cancelled: { backgroundColor: "#475569", color: "#f8fafc" },
    rescheduled: { backgroundColor: "#ddd6fe", color: "#4c1d95" },
  };

  return styles[status || ""] || styles.cancelled;
};

const typeLabel = (type?: string) =>
  typeOptions.find((item) => item.value === type)?.label || type || "Phone Call";

const typeIcon = (type?: string) =>
  typeOptions.find((item) => item.value === type)?.icon || FaPhoneAlt;

const priorityTone = (priority?: string) => {
  if (priority === "high") return "bg-red-50 text-red-700 border-red-200";
  if (priority === "low") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getFollowUpDateKey = (date?: string) => (date ? getDateKey(new Date(date)) : "");

const getDateTimeInputKey = (date?: string) => {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date.slice(0, 16);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const SkeletonCard = () => (
  <div className="h-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
    <div className="mt-5 h-7 w-16 animate-pulse rounded bg-slate-200" />
    <div className="mt-4 h-3 w-28 animate-pulse rounded bg-slate-100" />
  </div>
);

const SummaryCards = () => {
  const { summary, loading } = useManagerFollowUps();
  const icons: Record<string, ElementType> = {
    total: FaTasks,
    today: FaClock,
    pending: FaRegCalendarAlt,
    completed: FaCheckCircle,
    missed: FaExclamationTriangle,
    upcoming: FaCalendarAlt,
    overdue: FaBell,
    success: FaUserCheck,
  };

  if (loading && summary.length === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
      {summary.map((card: any) => {
        const Icon = icons[card.key] || FaTasks;
        return (
          <motion.div
            key={card.key}
            whileHover={{ y: -3 }}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <Icon size={16} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const FollowUpModal = ({
  open,
  onClose,
  followUp,
}: {
  open: boolean;
  onClose: () => void;
  followUp?: ManagerFollowUp | null;
}) => {
  const { leads, agents, createFollowUp, updateFollowUp } = useManagerFollowUps();
  const [form, setForm] = useState({
    lead: "",
    assignedTo: "",
    followUpType: "call",
    scheduledDate: "",
    scheduledTime: "",
    priority: "medium",
    reminderTime: "",
    status: "pending",
    notes: "",
    nextAction: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setError("");
    if (followUp) {
      setForm({
        lead: followUp.lead?._id || "",
        assignedTo: followUp.assignedTo?._id || "",
        followUpType: followUp.followUpType || "call",
        scheduledDate: getFollowUpDateKey(followUp.scheduledDate),
        scheduledTime: followUp.scheduledTime || "",
        priority: followUp.priority || "medium",
        reminderTime: getDateTimeInputKey(followUp.reminderTime),
        status: followUp.status || "pending",
        notes: followUp.notes || "",
        nextAction: followUp.nextAction || "",
      });
      return;
    }

    setForm({
      lead: "",
      assignedTo: "",
      followUpType: "call",
      scheduledDate: "",
      scheduledTime: "",
      priority: "medium",
      reminderTime: "",
      status: "pending",
      notes: "",
      nextAction: "",
    });
  }, [followUp, open]);

  if (!open) return null;

  const submit = async () => {
    if (saving) return;
    setError("");
    if (!form.lead || !form.scheduledDate) {
      setError("Lead and follow-up date are required.");
      return;
    }
    const scheduledDateChanged =
      !followUp || form.scheduledDate !== getFollowUpDateKey(followUp.scheduledDate);
    const reminderTimeChanged =
      !followUp || form.reminderTime !== getDateTimeInputKey(followUp.reminderTime);
    if (scheduledDateChanged && isBeforeToday(form.scheduledDate)) {
      setError("Follow-up date cannot be in the past.");
      return;
    }
    if (reminderTimeChanged && isBeforeToday(form.reminderTime)) {
      setError("Reminder date cannot be in the past.");
      return;
    }
    try {
      setSaving(true);
      const payload: Record<string, any> = {
        lead: form.lead,
        assignedTo: form.assignedTo || undefined,
        followUpType: form.followUpType,
        scheduledTime: form.scheduledTime,
        priority: form.priority,
        status: form.status,
        notes: form.notes,
        nextAction: form.nextAction,
        reminderType: ["in_app", "browser"],
      };
      if (!followUp || scheduledDateChanged) {
        payload.scheduledDate = form.scheduledDate;
      }
      if (!followUp || reminderTimeChanged) {
        payload.reminderTime = form.reminderTime || undefined;
      }
      if (followUp?._id) {
        await updateFollowUp(followUp._id, payload);
      } else {
        await createFollowUp(payload);
      }
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to ${followUp ? "update" : "create"} follow-up.`
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="manager-followup-modal mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {followUp ? "Edit Follow-Up" : "Schedule New Follow-Up"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create reminders, assign agents, and define the next action.
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Lead
            <select className={inputClass} value={form.lead} onChange={(e) => setForm((prev) => ({ ...prev, lead: e.target.value }))}>
              <option value="">Select Lead</option>
              {leads.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name} {lead.phone ? `(${lead.phone})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Assigned Agent
            <select className={inputClass} value={form.assignedTo} onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}>
              <option value="">Assign to self / unassigned</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Follow-Up Type
            <select className={inputClass} value={form.followUpType} onChange={(e) => setForm((prev) => ({ ...prev, followUpType: e.target.value }))}>
              {typeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Priority
            <select className={inputClass} value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Follow-Up Date
            <input className={inputClass} type="date" min={todayDateInputValue()} value={form.scheduledDate} onChange={(e) => setForm((prev) => ({ ...prev, scheduledDate: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Follow-Up Time
            <input className={inputClass} type="time" value={form.scheduledTime} onChange={(e) => setForm((prev) => ({ ...prev, scheduledTime: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Reminder Date & Time
            <input className={inputClass} type="datetime-local" min={todayDateTimeInputValue()} value={form.reminderTime} onChange={(e) => setForm((prev) => ({ ...prev, reminderTime: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600">
            Status
            <select className={inputClass} value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600 md:col-span-2">
            Notes
            <textarea className="min-h-[82px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none" placeholder="Notes, internal comments, or communication history" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600 md:col-span-2">
            Next Action
            <input className={inputClass} placeholder="Next action" value={form.nextAction} onChange={(e) => setForm((prev) => ({ ...prev, nextAction: e.target.value }))} />
          </label>
        </div>

        </div>

        <div className="border-t border-slate-100 bg-white p-5 pt-4">
          <button
            onClick={submit}
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : followUp ? "Update Follow-Up" : "Create Follow-Up"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CalendarAndUpcoming = ({ onAdd }: { onAdd: () => void }) => {
  const { followUps, upcoming, calendarView, setCalendarView, updateFollowUp } = useManagerFollowUps();
  const calendarItems = useMemo(() => {
    const now = new Date();
    let start = new Date(now);
    let length = 7;

    if (calendarView === "daily") {
      start = new Date(now);
      length = 1;
    }

    if (calendarView === "weekly") {
      start = getStartOfWeek(now);
      length = 7;
    }

    if (calendarView === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      length = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }

    if (calendarView === "agenda") {
      return [...followUps]
        .sort((a, b) => new Date(a.scheduledDate || 0).getTime() - new Date(b.scheduledDate || 0).getTime())
        .map((item) => {
          const date = new Date(item.scheduledDate);
          return {
            date,
            key: item._id,
            items: [item],
          };
        });
    }

    return Array.from({ length }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = getDateKey(date);
      return {
        date,
        key,
        items: followUps.filter((item) => getFollowUpDateKey(item.scheduledDate) === key),
      };
    });
  }, [calendarView, followUps]);

  const calendarGridClass =
    calendarView === "daily"
      ? "mt-4 grid grid-cols-1 gap-3"
      : calendarView === "monthly"
        ? "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
        : calendarView === "agenda"
          ? "mt-4 space-y-3"
          : "mt-4 grid auto-cols-[minmax(160px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-7";

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Follow-Up Calendar</h2>
            <p className="text-xs text-slate-500">Daily, weekly, monthly, and agenda planning.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["daily", "weekly", "monthly", "agenda"].map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view as any)}
                className={`rounded-xl px-3 py-2 text-xs font-bold capitalize ${
                  calendarView === view
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {view}
              </button>
            ))}
            <button onClick={onAdd} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">
              + Add
            </button>
          </div>
        </div>

        <div className={calendarGridClass}>
          {calendarItems.map((day) => {
            const isToday = getDateKey(day.date) === getDateKey(new Date());
            if (calendarView === "agenda") {
              const item = day.items[0];
              const Icon = typeIcon(item.followUpType);
              return (
                <div
                  key={day.key}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("followUpId", item._id)}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                      <Icon size={12} /> {item.lead?.name || "Lead"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {fmtDate(item.scheduledDate)} at {fmtTime(item.scheduledDate, item.scheduledTime)} - {item.assignedTo?.name || "Unassigned"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-bold capitalize ${priorityTone(item.priority)}`}>{item.priority}</span>
                    <span style={statusStyle(item.status)} className={`manager-followup-status-badge rounded-full px-2 py-1 text-[11px] font-bold ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={day.key}
                className={`min-h-[170px] rounded-2xl border p-3 ${
                  isToday ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const followUpId = e.dataTransfer.getData("followUpId");
                  updateFollowUp(followUpId, { scheduledDate: day.key, status: "rescheduled" });
                }}
              >
                <p className="text-xs font-bold uppercase text-slate-400">
                  {calendarView === "daily"
                    ? day.date.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
                    : day.date.toLocaleDateString("en-IN", { weekday: "short" })}
                </p>
                {calendarView !== "daily" && <p className="mt-1 text-lg font-extrabold text-slate-800">{day.date.getDate()}</p>}
                <div className="mt-3 space-y-2">
                  {day.items.length === 0 && (
                    <p className="text-xs font-semibold text-slate-400">
                      No follow-ups scheduled
                    </p>
                  )}
                  {day.items.slice(0, calendarView === "daily" ? 12 : 3).map((item) => {
                    const Icon = typeIcon(item.followUpType);
                    return (
                      <div key={item._id} draggable onDragStart={(e) => e.dataTransfer.setData("followUpId", item._id)} className="rounded-xl bg-white p-2 text-xs shadow-sm">
                        <p className="flex items-center gap-1 font-bold text-slate-700">
                          <Icon size={10} /> {item.lead?.name || "Lead"}
                        </p>
                        <p className="mt-1 text-slate-400">
                          {fmtTime(item.scheduledDate, item.scheduledTime)} - {statusLabel(item.status)}
                        </p>
                      </div>
                    );
                  })}
                  {day.items.length > 3 && calendarView !== "daily" && (
                    <p className="text-xs font-bold text-blue-600">
                      +{day.items.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Upcoming Follow-Ups</h2>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 && <p className="text-sm text-slate-500">No upcoming follow-ups.</p>}
          {upcoming.map((item) => {
            const Icon = typeIcon(item.followUpType);
            return (
              <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-800">{item.lead?.name || "Lead"}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.assignedTo?.name || "Unassigned"}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-bold capitalize ${priorityTone(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Icon size={10} /> {typeLabel(item.followUpType)}</span>
                  <span>{fmtDate(item.scheduledDate)}</span>
                  <span>{fmtTime(item.scheduledDate, item.scheduledTime)}</span>
                  <span style={statusStyle(item.status)} className={`manager-followup-status-badge rounded-full px-2 py-1 text-center font-bold ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FollowUpFiltersBar = () => {
  const { filters, agents, setFilters, loadFollowUps } = useManagerFollowUps();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(filters.search || params.get("search") || "");
  const debouncedSearch = useDebouncedValue(search);

  const applyFilters = useCallback(
    (patch: FollowUpFilters) => {
      const next = { ...filters, ...patch, page: patch.page || 1 };
      setFilters(next);
      const nextParams = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value && value !== "all") nextParams.set(key, String(value));
      });
      setParams(nextParams);
      loadFollowUps(next);
    },
    [filters, loadFollowUps, setFilters, setParams]
  );

  useEffect(() => {
    applyFilters({ search: debouncedSearch });
  }, [debouncedSearch]);

  const reset = () => {
    setSearch("");
    applyFilters({
      search: "",
      status: "all",
      type: "all",
      priority: "all",
      agent: "all",
      dateFilter: "all",
      page: 1,
    });
  };

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="relative min-w-0 lg:col-span-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lead, follow-up ID, phone, or agent"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={filters.status || "all"} onChange={(e) => applyFilters({ status: e.target.value })}>
          <option value="all">All Status</option>
          {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={filters.type || "all"} onChange={(e) => applyFilters({ type: e.target.value })}>
          <option value="all">All Types</option>
          {typeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={filters.priority || "all"} onChange={(e) => applyFilters({ priority: e.target.value })}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white" value={filters.agent || "all"} onChange={(e) => applyFilters({ agent: e.target.value })}>
          <option value="all">All Agents</option>
          {agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
        </select>
      </div>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["tomorrow", "Tomorrow"],
            ["week", "This Week"],
            ["month", "This Month"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => applyFilters({ dateFilter: value })}
              className={`rounded-xl px-3 py-2 text-xs font-bold ${
                filters.dateFilter === value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button onClick={reset} className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
          <FaFilter size={11} /> Reset Filters
        </button>
      </div>
    </div>
  );
};

const BulkToolbar = () => {
  const { selectedIds, agents, bulkAction, clearSelected } = useManagerFollowUps();
  const [agentId, setAgentId] = useState("");
  const [status, setStatus] = useState("completed");

  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky top-2 z-20 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-blue-800">{selectedIds.length} follow-ups selected</p>
      <div className="flex flex-wrap gap-2">
        <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs">
          <option value="">Assign agent</option>
          {agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
        </select>
        <button disabled={!agentId} onClick={() => bulkAction("assign", { agentId })} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Assign</button>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs">
          {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <button onClick={() => bulkAction("status", { status })} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">Change Status</button>
        <button onClick={() => bulkAction("reminder")} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white">Send Reminder</button>
        <button onClick={() => bulkAction("delete")} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">Delete</button>
        <button onClick={clearSelected} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600">Clear</button>
      </div>
    </div>
  );
};

const FollowUpActions = ({
  followUp,
  onEdit,
}: {
  followUp: ManagerFollowUp;
  onEdit: (followUp: ManagerFollowUp) => void;
}) => {
  const navigate = useNavigate();
  const { updateFollowUp, addNote, deleteFollowUp } = useManagerFollowUps();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: rect.bottom + 8,
        left: Math.max(12, rect.right - 192),
      });
    }
    setOpen((value) => !value);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const runAction = async (action: () => void | Promise<void>) => {
    setOpen(false);
    await action();
  };

  const actionMenu =
    open && typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            <>
              <button
                aria-label="Close follow-up actions"
                style={{ position: "fixed", inset: 0, zIndex: 70, background: "transparent", border: 0, padding: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  position: "fixed",
                  top: menuPos.top,
                  left: menuPos.left,
                  zIndex: 80,
                  width: 192,
                }}
                className="manager-followup-action-menu overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              >
                {[
                  ["View Details", () => navigate(`/manager/followups/${followUp._id}`)],
                  ["Edit Follow-Up", () => onEdit(followUp)],
                  ["Mark Completed", () => updateFollowUp(followUp._id, { status: "completed" })],
                  ["Reschedule", () => onEdit(followUp)],
                  ["Add Notes", () => setNoteOpen(true)],
                  ["Delete Follow-Up", () => deleteFollowUp(followUp._id)],
                ].map(([label, action]) => (
                  <button
                    key={String(label)}
                    onClick={() => runAction(action as () => void | Promise<void>)}
                    className={`block w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      String(label).includes("Delete")
                        ? "text-red-600 dark:text-red-300"
                        : "text-slate-600 dark:text-slate-200"
                    }`}
                  >
                    {String(label)}
                  </button>
                ))}
              </motion.div>
            </>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      <button ref={buttonRef} onClick={toggleMenu} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
        <FaEllipsisV size={12} />
      </button>
      {actionMenu}
      {noteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4" onClick={() => setNoteOpen(false)}>
          <div onClick={(event) => event.stopPropagation()} className="ml-auto h-full w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Add Follow-Up Note</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={8} className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Internal comment, rich text placeholder, or communication note" />
            <button disabled={!note.trim()} onClick={() => addNote(followUp._id, note).then(() => setNoteOpen(false))} className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-50">
              Add Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FollowUpTable = ({ onEdit }: { onEdit: (followUp: ManagerFollowUp) => void }) => {
  const {
    followUps,
    loading,
    selectedIds,
    pagination,
    filters,
    setFilters,
    loadFollowUps,
    toggleSelected,
    selectAllVisible,
  } = useManagerFollowUps();

  const changePage = (page: number) => {
    const next = { ...filters, page };
    setFilters(next);
    loadFollowUps(next);
  };

  if (loading && followUps.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"><FaSpinner className="mx-auto mb-3 animate-spin text-blue-600" /> Loading follow-ups...</div>;
  }

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[1180px]">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === followUps.length && followUps.length > 0} onChange={selectAllVisible} /></th>
              {["Follow-Up ID", "Lead Name", "Phone Number", "Assigned Agent", "Type", "Date", "Time", "Priority", "Status", "Reminder", "Notes", "Actions"].map((head) => (
                <th key={head} className="px-4 py-3 font-bold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {followUps.map((followUp) => {
              const Icon = typeIcon(followUp.followUpType);
              return (
                <tr key={followUp._id} className="transition hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(followUp._id)} onChange={() => toggleSelected(followUp._id)} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{followUp._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{followUp.lead?.name || "Lead"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{followUp.lead?.phone || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{followUp.assignedTo?.name || "Unassigned"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600"><span className="flex items-center gap-2"><Icon size={12} /> {typeLabel(followUp.followUpType)}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(followUp.scheduledDate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{fmtTime(followUp.scheduledDate, followUp.scheduledTime)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[11px] font-bold capitalize ${priorityTone(followUp.priority)}`}>{followUp.priority}</span></td>
                  <td className="px-4 py-3"><span style={statusStyle(followUp.status)} className={`manager-followup-status-badge rounded-full px-2 py-1 text-[11px] font-bold ${statusTone(followUp.status)}`}>{statusLabel(followUp.status)}</span></td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500">{followUp.reminderSent ? "Sent" : followUp.reminderTime ? "Scheduled" : "Not set"}</td>
                  <td className="max-w-[190px] truncate px-4 py-3 text-sm text-slate-600">{followUp.notes || "-"}</td>
                  <td className="px-4 py-3"><FollowUpActions followUp={followUp} onEdit={onEdit} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {followUps.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No follow-ups found. Try resetting filters or schedule a new one.</div>}
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold text-slate-500">Showing {followUps.length} of {pagination.total} follow-ups</span>
        <div className="flex items-center gap-2">
          <button disabled={pagination.page <= 1} onClick={() => changePage(pagination.page - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><FaChevronLeft size={11} /></button>
          <span className="text-xs font-bold text-slate-600">Page {pagination.page} / {pagination.totalPages || 1}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => changePage(pagination.page + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><FaChevronRight size={11} /></button>
        </div>
      </div>
    </div>
  );
};

const KanbanView = () => {
  const { followUps, updateFollowUp } = useManagerFollowUps();
  const grouped = useMemo(
    () => kanbanColumns.map((column) => ({ column, items: followUps.filter((item) => item.status === column) })),
    [followUps]
  );

  return (
    <div className="grid max-w-full grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-5">
      {grouped.map(({ column, items }) => (
        <div key={column} onDragOver={(e) => e.preventDefault()} onDrop={(e) => updateFollowUp(e.dataTransfer.getData("followUpId"), { status: column })} className="min-h-[420px] rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{statusLabel(column)}</h3>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{items.length}</span>
          </div>
          <div className="space-y-3">
            {items.map((item) => {
              const Icon = typeIcon(item.followUpType);
              return (
                <motion.div layout draggable onDragStart={(e) => e.dataTransfer.setData("followUpId", item._id)} key={item._id} className="cursor-grab rounded-2xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white">{item.lead?.name || "Lead"}</p>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold capitalize ${priorityTone(item.priority)}`}>{item.priority}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Icon size={11} /> {typeLabel(item.followUpType)}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.assignedTo?.name || "Unassigned"}</p>
                  <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400"><FaClock size={10} /> {fmtDate(item.scheduledDate)} · {fmtTime(item.scheduledDate, item.scheduledTime)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const AnalyticsSection = () => {
  const { analytics } = useManagerFollowUps();
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Pending vs Completed vs Missed</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82}>
              {analytics.statusBreakdown.map((_: any, index: number) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Daily Follow-Up Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={analytics.dailyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} />
            <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Agent Performance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={analytics.agentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            <Bar dataKey="completed" fill="#16a34a" radius={[6, 6, 0, 0]} />
            <Bar dataKey="missed" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-green-50 p-4"><p className="text-xs font-bold text-green-700">Success Rate</p><p className="mt-2 text-3xl font-extrabold text-green-800">{analytics.successRate}%</p></div>
          <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-700">Conversion Ratio</p><p className="mt-2 text-3xl font-extrabold text-blue-800">{analytics.conversionRatio}%</p></div>
          <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">Avg Response Time</p><p className="mt-2 text-3xl font-extrabold text-amber-800">{analytics.averageResponseTime}</p></div>
          <div className="rounded-2xl bg-violet-50 p-4"><p className="text-xs font-bold text-violet-700">AI Suggestions</p><p className="mt-2 text-sm font-bold text-violet-800">Priority detection and smart reminders ready</p></div>
        </div>
      </div>
    </div>
  );
};

const MissedFollowUps = () => {
  const { missed } = useManagerFollowUps();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-white"><FaExclamationTriangle className="text-red-500" /> Missed Follow-Ups Tracking</h3>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {missed.length === 0 && <p className="text-sm text-slate-500">No missed follow-ups. The team is caught up.</p>}
        {missed.map((item) => (
          <div key={item._id} className="rounded-2xl bg-red-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-red-900">{item.lead?.name || "Lead"}</p>
                <p className="mt-1 text-xs text-red-700">Missed by {item.assignedTo?.name || "Unassigned"}</p>
              </div>
              <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white">Overdue</span>
            </div>
            <p className="mt-3 text-xs text-red-700">Due {fmtDate(item.scheduledDate)} at {fmtTime(item.scheduledDate, item.scheduledTime)}</p>
            <p className="mt-1 text-xs text-red-700">Reason: {item.missedReason || "Not provided"} · Reschedule status: {item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationsAndTimeline = () => {
  const { notifications, timeline } = useManagerFollowUps();
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-white"><FaBell className="text-blue-600" /> Notifications Panel</h3>
        <div className="space-y-3">
          {notifications.length === 0 && <p className="text-sm text-slate-500">No reminder alerts right now.</p>}
          {notifications.map((item) => (
            <div key={item._id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.message} · {fmtDate(item.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Activity Timeline</h3>
        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item._id} className="relative pl-7">
              <span className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 ring-4 ring-blue-100" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">{item.leadName} · {item.user?.name || "System"} · {fmtDate(item.createdAt)}</p>
            </div>
          ))}
          {timeline.length === 0 && <p className="text-sm text-slate-500">No follow-up activity found.</p>}
        </div>
      </div>
    </div>
  );
};

const ManagerFollowUpsContent = () => {
  const { loadFollowUps, filters, viewMode, setViewMode, followUps } = useManagerFollowUps();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<ManagerFollowUp | null>(null);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const openEdit = (followUp: ManagerFollowUp) => {
    setEditingFollowUp(followUp);
    setModalOpen(true);
  };

  const exportCsv = () => {
    const headers = ["Follow-Up ID", "Lead", "Phone", "Agent", "Type", "Date", "Time", "Priority", "Status", "Notes"];
    const rows = followUps.map((item) => [
      item._id,
      item.lead?.name || "",
      item.lead?.phone || "",
      item.assignedTo?.name || "",
      item.followUpType,
      item.scheduledDate,
      item.scheduledTime || "",
      item.priority,
      item.status,
      item.notes || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "manager-followups.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard manager-dashboard-shell manager-followups-theme overflow-x-hidden">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <div className="dashboard-content manager-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          <div className="manager-followups-page max-w-full space-y-5 pb-10">
            <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Manager CRM</p>
                <h1 className="break-words text-2xl font-extrabold text-slate-900 dark:text-white">Follow-Up Management Center</h1>
                <p className="mt-1 text-sm text-slate-500">Monitor pending work, missed follow-ups, reminders, calendars, and agent performance.</p>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto xl:justify-end">
                <button onClick={exportCsv} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 sm:flex-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <FaDownload size={12} /> Export CSV
                </button>
                <button onClick={() => { setEditingFollowUp(null); setModalOpen(true); }} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 sm:flex-none">
                  <FaPlus size={12} /> Add Follow-Up
                </button>
              </div>
            </div>

            <SummaryCards />
            <CalendarAndUpcoming onAdd={() => { setEditingFollowUp(null); setModalOpen(true); }} />
            <FollowUpFiltersBar />
            <BulkToolbar />

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto dark:border-slate-700 dark:bg-slate-800">
                {[
                  ["table", FaTable, "Table"],
                  ["kanban", FaColumns, "Kanban"],
                  ["calendar", FaCalendarAlt, "Calendar"],
                ].map(([mode, Icon, label]) => {
                  const IconComp = Icon as ElementType;
                  return (
                    <button key={String(mode)} onClick={() => setViewMode(mode as any)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold sm:flex-none ${viewMode === mode ? "bg-blue-600 text-white" : "text-slate-500"}`}>
                      <IconComp size={12} /> {String(label)}
                    </button>
                  );
                })}
              </div>
              <p className="break-words text-xs font-semibold text-slate-400">Filters sync with URL query params. Page {filters.page || 1}</p>
            </div>

            {viewMode === "table" && <FollowUpTable onEdit={openEdit} />}
            {viewMode === "kanban" && <KanbanView />}
            {viewMode === "calendar" && <CalendarAndUpcoming onAdd={() => { setEditingFollowUp(null); setModalOpen(true); }} />}

            <MissedFollowUps />
            <AnalyticsSection />
            <NotificationsAndTimeline />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {modalOpen && (
          <FollowUpModal
            open={modalOpen}
            followUp={editingFollowUp}
            onClose={() => {
              setModalOpen(false);
              setEditingFollowUp(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ManagerFollowUpsPage = () => (
  <ManagerFollowUpProvider>
    <ManagerFollowUpsContent />
  </ManagerFollowUpProvider>
);

export default ManagerFollowUpsPage;
