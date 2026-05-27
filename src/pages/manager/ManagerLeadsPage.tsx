import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ElementType, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaColumns,
  FaDownload,
  FaEdit,
  FaEllipsisV,
  FaExclamationTriangle,
  FaFileImport,
  FaFilter,
  FaFire,
  FaLayerGroup,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTable,
  FaTasks,
  FaTrash,
  FaUserCheck,
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
  ManagerLeadProvider,
  useManagerLeads,
} from "../../contexts/leads/ManagerLeadContext";
import { ManagerLead, ManagerLeadFilters } from "../../services/managerLeadService";
import { getDashboardData } from "../../services/dashboardService";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { DASHBOARD_CACHE_TTL, getDashboardCacheKey } from "../../utils/dashboardCache";
import { todayDateTimeInputValue } from "../../utils/dateValidation";

const statusOptions = [
  { value: "new", label: "New", tone: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", tone: "bg-amber-100 text-amber-700" },
  { value: "qualified", label: "Qualified", tone: "bg-cyan-100 text-cyan-700" },
  { value: "proposal_sent", label: "Proposal Sent", tone: "bg-indigo-100 text-indigo-700" },
  { value: "negotiation", label: "Negotiation", tone: "bg-pink-100 text-pink-700" },
  { value: "converted", label: "Converted", tone: "bg-green-100 text-green-700" },
  { value: "won", label: "Won", tone: "bg-green-100 text-green-700" },
  { value: "lost", label: "Lost", tone: "bg-red-100 text-red-700" },
  { value: "follow_up", label: "Follow-up", tone: "bg-orange-100 text-orange-700" },
];

const kanbanColumns = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "converted",
  "lost",
];

const sourceOptions = ["website", "facebook", "instagram", "google", "referral", "manual"];
const priorityOptions = ["high", "medium", "low"];
const followUpTypeOptions = [
  { value: "call", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "video_call", label: "Video Call" },
  { value: "demo", label: "Demo" },
  { value: "site_visit", label: "Site Visit" },
  { value: "consultation", label: "Consultation" },
];
const chartColors = ["#17145b", "#2b3578", "#355f91", "#3db0a6", "#22306f", "#2f7f9a", "#49b9b0"];
const fmtDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";

const statusLabel = (status?: string) =>
  statusOptions.find((item) => item.value === status)?.label || status || "New";

const statusTone = (status?: string) =>
  statusOptions.find((item) => item.value === status)?.tone ||
  "bg-slate-100 text-slate-700";

const priorityTone = (priority?: string) => {
  if (priority === "high") return "bg-red-50 text-red-700 border-red-200";
  if (priority === "low") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const scoreTone = (score?: string) => {
  if (score === "hot") return "bg-red-500 text-white";
  if (score === "warm") return "bg-amber-500 text-white";
  return "bg-sky-500 text-white";
};

const SkeletonCard = () => (
  <div className="h-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
    <div className="mt-5 h-7 w-16 animate-pulse rounded bg-slate-200" />
    <div className="mt-4 h-3 w-28 animate-pulse rounded bg-slate-100" />
  </div>
);

const getSummaryValue = (summary: any[], key: string) =>
  summary.find((item) => item.key === key)?.value || 0;

const LeadWorkspaceHeader = ({ onExport }: { onExport: () => void }) => {
  const navigate = useNavigate();
  const { summary, leads, analytics } = useManagerLeads();
  const totalLeads = getSummaryValue(summary, "total");
  const converted = getSummaryValue(summary, "converted");
  const followups = getSummaryValue(summary, "followups");
  const hotLeads = leads.filter((lead) => lead.leadScore === "hot").length;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr]">
        <div className="bg-slate-950 p-6 text-white sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Manager CRM Workspace
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Lead Management Center
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Prioritize high-intent leads, assign agents, schedule follow-ups, and keep the sales pipeline moving from one focused workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/manager/leads/create")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-slate-950 shadow-sm hover:bg-cyan-50"
            >
              <FaPlus size={12} /> Create Lead
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              <FaDownload size={12} /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-5 dark:bg-slate-800 sm:p-6">
          {[
            ["Total Leads", totalLeads, FaLayerGroup, "text-blue-600 bg-blue-50"],
            ["Converted", converted, FaCheckCircle, "text-green-600 bg-green-50"],
            ["Follow-ups", followups, FaCalendarAlt, "text-amber-600 bg-amber-50"],
            ["Hot Leads", hotLeads, FaFire, "text-red-600 bg-red-50"],
          ].map(([label, value, Icon, tone]) => {
            const IconComp = Icon as ElementType;
            return (
              <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
                  <IconComp size={14} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{String(label)}</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{String(value)}</p>
              </div>
            );
          })}
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Pipeline Conversion
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {analytics?.conversionRate || 0}% of visible pipeline
                </p>
              </div>
              <FaChartLine className="text-blue-600" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${Math.min(Number(analytics?.conversionRate || 0), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PipelineSnapshot = () => {
  const { leads } = useManagerLeads();
  const visibleLeads = leads.slice(0, 5);
  const hotQueue = leads.filter((lead) => lead.priority === "high" || lead.leadScore === "hot").slice(0, 4);
  const nextFollowUps = [...leads]
    .filter((lead) => lead.nextFollowUpDate || lead.followUps?.[0]?.date)
    .sort((a, b) => new Date(a.nextFollowUpDate || a.followUps?.[0]?.date || 0).getTime() - new Date(b.nextFollowUpDate || b.followUps?.[0]?.date || 0).getTime())
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 xl:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Pipeline Snapshot</h2>
            <p className="mt-1 text-xs text-slate-500">A quick scan of recently loaded leads.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {leads.length} visible
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {visibleLeads.length === 0 && <p className="text-sm text-slate-500">No leads available in this view.</p>}
          {visibleLeads.map((lead) => (
            <div key={lead._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{lead.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{lead.company || lead.email || lead.phone || "No contact info"}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${scoreTone(lead.leadScore)}`}>
                  {lead.leadScore || "cold"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusTone(lead.status)}`}>{statusLabel(lead.status)}</span>
                <span className={`rounded-full border px-2 py-1 text-[11px] font-bold capitalize ${priorityTone(lead.priority)}`}>{lead.priority || "medium"}</span>
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800">{lead.assignedAgent?.name || "Unassigned"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Priority Queue</h2>
          <div className="mt-4 space-y-3">
            {hotQueue.length === 0 && <p className="text-sm text-slate-500">No high-priority leads in this view.</p>}
            {hotQueue.map((lead) => (
              <div key={lead._id} className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-red-950">{lead.name}</p>
                  <p className="text-xs text-red-700">{lead.assignedAgent?.name || "Unassigned"}</p>
                </div>
                <FaFire className="shrink-0 text-red-600" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Next Follow-ups</h2>
          <div className="mt-4 space-y-3">
            {nextFollowUps.length === 0 && <p className="text-sm text-slate-500">No upcoming lead follow-ups.</p>}
            {nextFollowUps.map((lead) => (
              <div key={lead._id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{lead.name}</p>
                <p className="mt-1 text-xs text-slate-500">{fmtDate(lead.nextFollowUpDate || lead.followUps?.[0]?.date)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCards = () => {
  const { summary, loading } = useManagerLeads();
  const icons: Record<string, ElementType> = {
    total: FaTasks,
    new: FaPlus,
    contacted: FaPhoneAlt,
    qualified: FaUserCheck,
    converted: FaCheckCircle,
    lost: FaTrash,
    followups: FaCalendarAlt,
    today: FaClock,
    inactive: FaExclamationTriangle,
  };

  if (loading && summary.length === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      {summary.map((card: any) => {
        const Icon = icons[card.key] || FaTasks;
        const positive = Number(card.growth || 0) >= 0;
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <Icon size={16} />
              </div>
            </div>
            <p
              className={`mt-3 text-xs font-semibold ${
                positive ? "text-green-600" : "text-red-600"
              } break-words`}
            >
              {positive ? "+" : ""}
              {card.growth || 0}% from comparison period
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

const LeadFilters = () => {
  const { filters, agents, setFilters, loadLeads } = useManagerLeads();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(filters.search || params.get("search") || "");
  const debouncedSearch = useDebouncedValue(search);

  const applyFilters = useCallback(
    (patch: ManagerLeadFilters) => {
      const next = { ...filters, ...patch, page: patch.page || 1 };
      setFilters(next);
      const nextParams = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value && value !== "all") nextParams.set(key, String(value));
      });
      setParams(nextParams);
      loadLeads(next);
    },
    [filters, loadLeads, setFilters, setParams]
  );

  useEffect(() => {
    applyFilters({ search: debouncedSearch });
  }, [debouncedSearch]);

  const reset = () => {
    setSearch("");
    applyFilters({
      search: "",
      status: "all",
      source: "all",
      priority: "all",
      agent: "all",
      dateFilter: "all",
      startDate: "",
      endDate: "",
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, phone, company, or lead ID"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white lg:col-span-2" value={filters.status || "all"} onChange={(e) => applyFilters({ status: e.target.value })}>
          <option value="all">All Status</option>
          {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white lg:col-span-2" value={filters.source || "all"} onChange={(e) => applyFilters({ source: e.target.value })}>
          <option value="all">All Sources</option>
          {sourceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white lg:col-span-2" value={filters.priority || "all"} onChange={(e) => applyFilters({ priority: e.target.value })}>
          <option value="all">All Priority</option>
          {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="h-11 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white lg:col-span-2" value={filters.agent || "all"} onChange={(e) => applyFilters({ agent: e.target.value })}>
          <option value="all">All Agents</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
          {agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
        </select>
      </div>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["last7", "Last 7 Days"],
            ["last30", "Last 30 Days"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => applyFilters({ dateFilter: value })}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                filters.dateFilter === value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <button onClick={reset} className="manager-filter-action flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <FaFilter size={11} /> Reset Filters
          </button>
          <button className="manager-filter-action flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
            <FaFileImport size={11} /> Import CSV
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkToolbar = () => {
  const { selectedIds, agents, bulkAction, clearSelected } = useManagerLeads();
  const [agentId, setAgentId] = useState("");
  const [status, setStatus] = useState("contacted");

  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky top-2 z-20 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-blue-800">{selectedIds.length} leads selected</p>
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
        <button onClick={() => bulkAction("delete")} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">Delete</button>
        <button onClick={clearSelected} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600">Clear</button>
      </div>
    </div>
  );
};

const LeadActions = ({ lead }: { lead: ManagerLead }) => {
  const navigate = useNavigate();
  const { agents, assignLead, updateStatus, addNote, addFollowUp, deleteLead } = useManagerLeads();
  const leadId = lead._id || lead.id || "";
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, placement: "bottom" as "top" | "bottom" });
  const [drawer, setDrawer] = useState<"assign" | "status" | "note" | "followup" | null>(null);
  const [agentId, setAgentId] = useState(lead.assignedAgent?._id || "");
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState({ date: "", note: "", followUpType: "call" });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeMenu = () => setOpen(false);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [open]);

  const toggleMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (open) {
      setOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      setOpen(true);
      return;
    }

    const menuWidth = 224;
    const estimatedHeight = Math.min(384, window.innerHeight - 24);
    const margin = 12;
    const left = Math.max(
      margin,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - margin)
    );
    const hasRoomBelow = window.innerHeight - rect.bottom > estimatedHeight + margin;
    const top = hasRoomBelow
      ? rect.bottom + 8
      : Math.max(margin, rect.top - estimatedHeight - 8);

    setMenuPosition({ top, left, placement: hasRoomBelow ? "bottom" : "top" });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setDrawer(null);
  };

  const runMenuAction = (action: () => void | Promise<void>) => {
    setOpen(false);
    if (!leadId) return;
    action();
  };

  const openExternalAction = (url: string) => {
    window.open(url);
  };

  const menuItems = [
    { label: "View Lead", icon: FaSearch, action: () => navigate(`/manager/leads/${leadId}`, { state: { from: "/manager/leads" } }) },
    { label: "Edit Lead", icon: FaEdit, action: () => navigate(`/manager/leads/edit/${leadId}`, { state: { from: "/manager/leads" } }) },
    { label: "Assign Agent", icon: FaUserCheck, action: () => setDrawer("assign") },
    { label: "Change Status", icon: FaCheckCircle, action: () => setDrawer("status") },
    { label: "Add Follow-up", icon: FaCalendarAlt, action: () => setDrawer("followup") },
    { label: "Add Notes", icon: FaPlus, action: () => setDrawer("note") },
    { label: "Timeline", icon: FaClock, action: () => navigate(`/manager/leads/${leadId}`, { state: { from: "/manager/leads" } }) },
    { label: "Call", icon: FaPhoneAlt, action: () => openExternalAction(`tel:${lead.phone || ""}`) },
    { label: "WhatsApp", icon: FaWhatsapp, action: () => openExternalAction(`https://wa.me/${lead.phone || ""}`) },
    { label: "Delete Lead", icon: FaTrash, danger: true, action: () => deleteLead(leadId) },
  ];

  const actionMenu = typeof document !== "undefined"
    ? createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1090] bg-transparent"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: menuPosition.placement === "bottom" ? -6 : 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuPosition.placement === "bottom" ? -6 : 6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              style={{ top: menuPosition.top, left: menuPosition.left }}
              className="manager-lead-action-menu fixed z-[1100] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-cyan-400/20 dark:bg-slate-950"
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Lead Actions</p>
                <p className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">{lead.name || "Lead"}</p>
              </div>
              <div className="py-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon as ElementType;
                  return (
                    <button
                      key={item.label}
                      onClick={() => runMenuAction(item.action)}
                      className={[
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-bold transition-colors",
                        item.danger
                          ? "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                          : "text-slate-700 hover:bg-cyan-50 hover:text-blue-800 dark:text-slate-100 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-200",
                      ].join(" ")}
                    >
                      <span className={[
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        item.danger ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300" : "bg-blue-50 text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-200",
                      ].join(" ")}>
                        <Icon size={12} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )
    : null;

  const actionDrawer = typeof document !== "undefined"
    ? createPortal(
      <AnimatePresence>
        {drawer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1200] bg-slate-950/50 p-3 sm:p-4" onClick={close}>
            <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} onClick={(event) => event.stopPropagation()} className="ml-auto h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-950">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{drawer === "assign" ? "Assign Agent" : drawer === "status" ? "Change Status" : drawer === "note" ? "Add Note" : "Add Follow-up"}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{lead.name}</p>
              {drawer === "assign" && (
                <div className="mt-5 space-y-3">
                  <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                    <option value="">Unassigned</option>
                    {agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
                  </select>
                  <button onClick={() => assignLead(leadId, agentId).then(close)} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white">Save Assignment</button>
                </div>
              )}
              {drawer === "status" && (
                <div className="mt-5 space-y-3">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                    {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                  <button onClick={() => updateStatus(leadId, status).then(close)} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white">Update Status</button>
                </div>
              )}
              {drawer === "note" && (
                <div className="mt-5 space-y-3">
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={7} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Write internal note or agent comment" />
                  <button disabled={!note.trim()} onClick={() => addNote(leadId, note).then(close)} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-50">Add Note</button>
                </div>
              )}
              {drawer === "followup" && (
                <div className="mt-5 space-y-3">
                  <input type="datetime-local" min={todayDateTimeInputValue()} value={followUp.date} onChange={(e) => setFollowUp((prev) => ({ ...prev, date: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                  <select value={followUp.followUpType} onChange={(e) => setFollowUp((prev) => ({ ...prev, followUpType: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                    {followUpTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                  <textarea value={followUp.note} onChange={(e) => setFollowUp((prev) => ({ ...prev, note: e.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Follow-up notes" />
                  <button disabled={!followUp.date} onClick={() => addFollowUp(leadId, followUp).then(close)} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-50">Schedule Follow-up</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )
    : null;

  return (
    <div className="relative flex justify-center">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
        aria-label={`Open actions for ${lead.name || "lead"}`}
        aria-expanded={open}
      >
        <FaEllipsisV size={12} />
      </button>
      {actionMenu}
      {actionDrawer}
    </div>
  );
};

const LeadsTable = () => {
  const {
    leads,
    loading,
    selectedIds,
    pagination,
    filters,
    setFilters,
    loadLeads,
    toggleSelected,
    selectAllVisible,
  } = useManagerLeads();

  const changePage = (page: number) => {
    const next = { ...filters, page };
    setFilters(next);
    loadLeads(next);
  };

  if (loading && leads.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"><FaSpinner className="mx-auto mb-3 animate-spin text-blue-600" /> Loading leads...</div>;
  }

  return (
    <div className="manager-leads-records max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="manager-leads-table-scroll max-w-full overflow-auto">
        <table className="manager-leads-table w-full min-w-[1180px] table-fixed">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="w-10 px-3 py-3"><input type="checkbox" checked={selectedIds.length === leads.length && leads.length > 0} onChange={selectAllVisible} /></th>
              {["Lead Name", "Phone", "Email", "Company", "Source", "Assigned Agent", "Priority", "Status", "Follow-up Date", "Created Date", "Actions"].map((head) => (
                <th key={head} className={`px-4 py-3 font-bold ${head === "Actions" ? "w-20 text-center" : ""}`}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {leads.map((lead) => (
              <tr key={lead._id} className="transition hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(lead._id)} onChange={() => toggleSelected(lead._id)} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${scoreTone(lead.leadScore)}`}>{lead.leadScore || "cold"}</span>
                    <span className="font-bold text-slate-800 dark:text-white">{lead.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{lead.phone || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{lead.email || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{lead.company || "-"}</td>
                <td className="px-4 py-3 text-sm capitalize text-slate-600">{lead.source}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{lead.assignedAgent?.name || "Unassigned"}</td>
                <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[11px] font-bold capitalize ${priorityTone(lead.priority)}`}>{lead.priority || "medium"}</span></td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusTone(lead.status)}`}>{statusLabel(lead.status)}</span></td>
                <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(lead.nextFollowUpDate || lead.followUps?.[0]?.date)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(lead.createdAt)}</td>
                <td className="px-3 py-3 text-center"><LeadActions lead={lead} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No leads found. Adjust filters or import leads.</div>}
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Showing {leads.length} of {pagination.total} leads
        </span>
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
  const { leads, updateStatus } = useManagerLeads();
  const grouped = useMemo(
    () => kanbanColumns.map((column) => ({ column, leads: leads.filter((lead) => lead.status === column || (column === "converted" && lead.status === "won")) })),
    [leads]
  );

  return (
    <div className="grid max-w-full grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-7">
      {grouped.map(({ column, leads: columnLeads }) => (
        <div key={column} onDragOver={(e) => e.preventDefault()} onDrop={(e) => updateStatus(e.dataTransfer.getData("leadId"), column)} className="min-h-[420px] rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{statusLabel(column)}</h3>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{columnLeads.length}</span>
          </div>
          <div className="space-y-3">
            {columnLeads.map((lead) => (
              <motion.div layout draggable onDragStart={(e) => e.dataTransfer.setData("leadId", lead._id)} key={lead._id} className="cursor-grab rounded-2xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{lead.name}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${scoreTone(lead.leadScore)}`}>{lead.leadScore || "cold"}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{lead.company || lead.email || lead.phone || "No contact info"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-bold capitalize ${priorityTone(lead.priority)}`}>{lead.priority || "medium"}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{lead.assignedAgent?.name || "Unassigned"}</span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-400"><FaClock size={10} /> {fmtDate(lead.nextFollowUpDate)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AnalyticsSection = () => {
  const { analytics } = useManagerLeads();
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Leads by Status</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={analytics.leadsByStatus} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82}>
              {analytics.leadsByStatus.map((_: any, index: number) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-extrabold text-slate-800 dark:text-white">Monthly Lead Growth</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={analytics.monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={3} />
            <Line type="monotone" dataKey="converted" stroke="#16a34a" strokeWidth={3} />
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
            <Bar dataKey="converted" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-green-50 p-4"><p className="text-xs font-bold text-green-700">Conversion Rate</p><p className="mt-2 text-3xl font-extrabold text-green-800">{analytics.conversionRate}%</p></div>
          <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-700">Follow-up Completion</p><p className="mt-2 text-3xl font-extrabold text-blue-800">{analytics.followUpCompletionRate}%</p></div>
          <div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">AI Lead Score</p><p className="mt-2 flex items-center gap-2 text-3xl font-extrabold text-amber-800"><FaFire size={20} /> Hot/Warm/Cold</p></div>
        </div>
      </div>
    </div>
  );
};

const ActivityAndNotifications = () => {
  const { notifications, timeline } = useManagerLeads();
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-white"><FaBell className="text-blue-600" /> Notifications</h3>
        <div className="space-y-3">
          {notifications.length === 0 && <p className="text-sm text-slate-500">No CRM notifications yet.</p>}
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
          {timeline.length === 0 && <p className="text-sm text-slate-500">No activity found.</p>}
        </div>
      </div>
    </div>
  );
};

const ManagerLeadsContent = () => {
  const navigate = useNavigate();
  const { loadLeads, filters, leads, summary, pagination } = useManagerLeads();
  const totalLeads = getSummaryValue(summary, "total");
  const newLeads = getSummaryValue(summary, "new");
  const convertedLeads = getSummaryValue(summary, "converted");
  const followUps = getSummaryValue(summary, "followups");

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    const warmDashboardCache = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const cacheKey = getDashboardCacheKey("manager", user?.id || user?._id);
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < DASHBOARD_CACHE_TTL) return;
        }

        const response = await getDashboardData();
        if (response.success) {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        }
      } catch {
        // Prefetch is optional; the dashboard still loads normally if it fails.
      }
    };

    warmDashboardCache();
  }, []);

  const exportCsv = () => {
    const headers = ["Lead ID", "Name", "Phone", "Email", "Company", "Source", "Agent", "Priority", "Status", "Follow-up", "Created"];
    const rows = leads.map((lead) => [
      lead._id,
      lead.name,
      lead.phone || "",
      lead.email || "",
      lead.company || "",
      lead.source,
      lead.assignedAgent?.name || "",
      lead.priority || "",
      lead.status,
      lead.nextFollowUpDate || "",
      lead.createdAt,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "manager-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard manager-dashboard-shell manager-leads-theme overflow-x-hidden">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <div className="dashboard-content manager-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          <div className="manager-leads-page max-w-full space-y-4 pb-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Manager CRM</p>
                  <h1 className="manager-leads-3d-title break-words text-2xl font-extrabold text-slate-900 dark:text-white">Leads Table</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage all assigned leads in a clean table view with filters, bulk actions, and quick row actions.
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto xl:justify-end">
                  <button
                    onClick={exportCsv}
                    className="manager-leads-main-action flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 sm:flex-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <FaDownload size={12} /> Export CSV
                  </button>
                  <button
                    onClick={() => navigate("/manager/leads/create")}
                    className="manager-leads-main-action flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 sm:flex-none"
                  >
                    <FaPlus size={12} /> Create Lead
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ["Total", totalLeads],
                  ["New", newLeads],
                  ["Converted", convertedLeads],
                  ["Follow-ups", followUps],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{String(label)}</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <LeadFilters />
            <BulkToolbar />

            <LeadsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerLeadsPage = () => (
  <ManagerLeadProvider>
    <ManagerLeadsContent />
  </ManagerLeadProvider>
);

export default ManagerLeadsPage;
