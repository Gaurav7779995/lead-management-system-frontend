import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import axiosInstance from "../../api/axiosInstance";
import {
  FaArrowLeft,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaEnvelope,
  FaEllipsisV,
  FaEye,
  FaEdit,
  FaTrophy,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaUserTie,
  FaDollarSign,
  FaChartLine,
} from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ─────────────────── Types ─────────────────── */
interface AgentInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

interface Analytics {
  totalLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  lostLeads: number;
  revenueGenerated: number;
  conversionRate: string | number;
  leadsBySource: Record<string, number>;
  todayFollowUps: number;
  missedFollowUps: number;
}

interface Lead {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  status: string;
  assignedAgent?: { name: string; email: string };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ─────────────────── Constants ─────────────────── */
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  new: {
    label: "New",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  contacted: {
    label: "Contacted",
    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  interested: {
    label: "Interested",
    cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  follow_up: {
    label: "Follow Up",
    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  won: {
    label: "Won ✓",
    cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  qualified: {
    label: "Qualified",
    cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  lost: {
    label: "Lost",
    cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  not_interested: {
    label: "Not Interested",
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  },
  proposal_sent: {
    label: "Proposal Sent",
    cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  negotiation: {
    label: "Negotiation",
    cls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
  no_response: {
    label: "No Response",
    cls: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  },
  meeting_schedule: {
    label: "Meeting Scheduled",
    cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  },
  demo_request: {
    label: "Demo Request",
    cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  low_priority: {
    label: "Low Priority",
    cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

const SOURCE_ICONS: Record<string, string> = {
  facebook: "🔵",
  instagram: "📸",
  website: "🌐",
  whatsapp: "💬",
  referral: "👥",
  google: "🔍",
  linkedin: "💼",
  manual: "✍️",
  call: "📞",
  other: "📋",
};

const SOURCE_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  website: "#10B981",
  whatsapp: "#25D366",
  referral: "#F59E0B",
  google: "#EA4335",
  linkedin: "#0A66C2",
  manual: "#6366F1",
  call: "#8B5CF6",
  other: "#6B7280",
};

const PIE_COLORS = [
  "#17145b",
  "#2b3578",
  "#355f91",
  "#3db0a6",
  "#22306f",
  "#2f7f9a",
  "#49b9b0",
  "#64748b",
];

const getStatusCfg = (s: string) =>
  STATUS_CONFIG[s] || { label: s, cls: "bg-slate-100 text-slate-600" };

const fmtDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AG";

/* ─────────────────── Component ─────────────────── */
const AgentLeadsPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  /* agent profile state */
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  /* leads table state */
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /* ── Fetch agent profile ── */
  useEffect(() => {
    if (!agentId) return;
    (async () => {
      try {
        setProfileLoading(true);
        const res = await axiosInstance.get(`/manager/agents/${agentId}`);
        if (res.data.success) {
          setAgent(res.data.data.agent);
          setAnalytics(res.data.data.analytics);
        }
      } catch (err) {
        console.error("Failed to load agent details:", err);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [agentId]);

  /* ── Fetch leads ── */
  const fetchLeads = useCallback(async () => {
    if (!agentId) return;
    try {
      setLeadsLoading(true);
      const params = new URLSearchParams({
        agentId,
        page: String(page),
        limit: "15",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(sourceFilter !== "all" && { source: sourceFilter }),
      });
      const res = await axiosInstance.get(`/manager/leads/recent?${params}`);
      if (res.data.success) {
        setLeads(res.data.data.leads || []);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLeadsLoading(false);
    }
  }, [agentId, page, search, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /* reset page when filters change */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sourceFilter]);

  /* ── Derived ── */
  const sourceChartData = useMemo(() => {
    if (!analytics?.leadsBySource) return [];
    return Object.entries(analytics.leadsBySource).map(([name, value]) => ({
      name,
      value,
    }));
  }, [analytics]);

  const kpiCards = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        label: "Total Leads",
        value: analytics.totalLeads,
        icon: FaUsers,
        color: "blue",
        trend: null,
      },
      {
        label: "Converted",
        value: analytics.convertedLeads,
        icon: FaCheckCircle,
        color: "green",
        trend: null,
      },
      {
        label: "Pending",
        value: analytics.pendingLeads,
        icon: FaClock,
        color: "amber",
        trend: null,
      },
      {
        label: "Lost",
        value: analytics.lostLeads,
        icon: FaTimesCircle,
        color: "red",
        trend: null,
      },
      {
        label: "Conv. Rate",
        value: `${analytics.conversionRate}%`,
        icon: FaChartLine,
        color: "violet",
        trend: Number(analytics.conversionRate) >= 30 ? "up" : "down",
      },
      {
        label: "Revenue",
        value: `$${analytics.revenueGenerated.toLocaleString()}`,
        icon: FaDollarSign,
        color: "green",
        trend: "up",
      },
      {
        label: "Today FU",
        value: analytics.todayFollowUps,
        icon: FaCalendarAlt,
        color: "orange",
        trend: null,
      },
      {
        label: "Missed FU",
        value: analytics.missedFollowUps,
        icon: FaExclamationTriangle,
        color: "red",
        trend: analytics.missedFollowUps > 0 ? "down" : null,
      },
    ];
  }, [analytics]);

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/30",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/30",
    violet:
      "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800/30",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/30",
  };

  /* ─────────────────── Render ─────────────────── */
  return (
    <div className="dashboard manager-dashboard-shell manager-agent-leads-theme">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="dashboard-content manager-dashboard-theme">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="manager-agent-leads-page space-y-6 pb-8"
          >
            {/* ══ Back Button ══ */}
            <button
              onClick={() => navigate("/manager/agents")}
              className="manager-leads-main-action manager-back-to-agents flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaArrowLeft size={11} />
              Back to Agents
            </button>

            {/* ══ Agent Profile Header ══ */}
            {profileLoading ? (
              <div className="flex items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <FaSpinner
                  className="text-blue-500 animate-spin mr-3"
                  size={22}
                />
                <span className="text-slate-400 dark:text-slate-500 font-medium">
                  Loading agent profile…
                </span>
              </div>
            ) : agent && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden"
              >
                {/* colour band */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#17145b] via-[#355f91] to-[#3db0a6]" />

                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#17145b] via-[#355f91] to-[#3db0a6] flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <span className="text-white text-2xl font-extrabold select-none">
                        {getInitials(agent.name)}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${agent.status === "active" ? "bg-green-500" : "bg-slate-400"}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        {agent.name}
                      </h1>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${agent.status === "active" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"}`}
                      >
                        {agent.status === "active" ? "● Active" : "○ Inactive"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50">
                        Agent
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm">
                        <FaEnvelope size={12} />
                        <span>{agent.email}</span>
                      </div>
                      {agent.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm">
                          <FaPhone size={11} />
                          <span>{agent.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm">
                        <FaCalendarAlt size={11} />
                        <span>Joined {fmtDate(agent.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate Gauge */}
                  {analytics && (
                    <div className="flex-shrink-0 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#17145b] via-[#355f91] to-[#3db0a6] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <div>
                          <div className="text-white text-xl font-extrabold leading-none">
                            {analytics.conversionRate}%
                          </div>
                          <div className="text-white/70 text-[10px] font-semibold">
                            CONV.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ KPI Cards ══ */}
            {analytics && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3"
              >
                {kpiCards.map((card, i) => {
                  const Icon = card.icon;
                  const cls = colorMap[card.color] || colorMap.blue;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex flex-col items-center p-3 rounded-xl border ${cls} transition-all duration-200 hover:scale-105`}
                    >
                      <Icon size={14} className="mb-1.5 opacity-80" />
                      <div className="text-lg font-extrabold leading-none tabular-nums">
                        {card.value}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wide mt-1 opacity-70 text-center">
                        {card.label}
                      </div>
                      {card.trend && (
                        <div className="mt-1">
                          {card.trend === "up" ? (
                            <MdTrendingUp
                              size={12}
                              className="text-green-500 dark:text-green-400"
                            />
                          ) : (
                            <MdTrendingDown
                              size={12}
                              className="text-red-500 dark:text-red-400"
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ══ Source Chart ══ */}
            {sourceChartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Pie */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                    Lead Sources
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {sourceChartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              SOURCE_COLORS[entry.name] ||
                              PIE_COLORS[i % PIE_COLORS.length]
                            }
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {v}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                    Source Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={sourceChartData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-25}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="value" name="Leads" radius={[4, 4, 0, 0]}>
                        {sourceChartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              SOURCE_COLORS[entry.name] ||
                              PIE_COLORS[i % PIE_COLORS.length]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* ══ Leads Table ══ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden"
            >
              {/* Table header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <FaUsers className="text-blue-500" size={14} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                      All Leads
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {pagination.total} total leads assigned to this agent
                    </p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-none">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search name, phone…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl w-full sm:w-48 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  {/* Status */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                  {/* Source */}
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                  >
                    <option value="all">All Sources</option>
                    {Object.keys(SOURCE_ICONS).map((s) => (
                      <option key={s} value={s}>
                        {SOURCE_ICONS[s]} {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {leadsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <FaSpinner
                      className="text-blue-500 animate-spin mr-3"
                      size={20}
                    />
                    <span className="text-slate-400 dark:text-slate-500 text-sm">
                      Loading leads…
                    </span>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FaUsers
                      className="text-slate-300 dark:text-slate-600 mb-3"
                      size={36}
                    />
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">
                      No leads found
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                      Try adjusting your filters
                    </p>
                  </div>
                ) : (
                  <table className="manager-agent-leads-table w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60">
                        {[
                          "#",
                          "Lead Name",
                          "Phone",
                          "Email",
                          "Source",
                          "Status",
                          "Date",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                      <AnimatePresence>
                        {leads.map((lead, i) => {
                          const sc = getStatusCfg(lead.status);
                          const rowNum = (page - 1) * 15 + i + 1;
                          return (
                            <motion.tr
                              key={lead._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: i * 0.02 }}
                              onClick={() =>
                                navigate(`/manager/leads/${lead._id}`, {
                                  state: { from: `/manager/agents/${agentId}` },
                                })
                              }
                              className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-150 group/row cursor-pointer"
                            >
                              {/* # */}
                              <td className="px-4 py-3">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                  {rowNum}
                                </span>
                              </td>
                              {/* Name */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#17145b] via-[#355f91] to-[#3db0a6] flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-white text-[10px] font-extrabold">
                                      {lead.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[130px] group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">
                                      {lead.name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              {/* Phone */}
                              <td className="px-4 py-3">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {lead.phone || "—"}
                                </span>
                              </td>
                              {/* Email */}
                              <td className="px-4 py-3">
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate block max-w-[140px]">
                                  {lead.email || "—"}
                                </span>
                              </td>
                              {/* Source */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">
                                    {SOURCE_ICONS[lead.source] || "📋"}
                                  </span>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                                    {lead.source}
                                  </span>
                                </div>
                              </td>
                              {/* Status */}
                              <td className="px-4 py-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${sc.cls}`}
                                >
                                  {sc.label}
                                </span>
                              </td>
                              {/* Date */}
                              <td className="px-4 py-3">
                                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                  {fmtDate(lead.createdAt)}
                                </span>
                              </td>
                              {/* Actions */}
                              <td className="px-4 py-3">
                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setOpenMenu(
                                        openMenu === lead._id ? null : lead._id,
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                                  >
                                    <FaEllipsisV size={11} />
                                  </button>
                                  <AnimatePresence>
                                    {openMenu === lead._id && (
                                      <motion.div
                                        initial={{
                                          opacity: 0,
                                          scale: 0.95,
                                          y: -5,
                                        }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{
                                          opacity: 0,
                                          scale: 0.95,
                                          y: -5,
                                        }}
                                        transition={{ duration: 0.1 }}
                                        className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden z-20"
                                      >
                                        {[
                                          { icon: FaEye, label: "View Lead" },
                                          { icon: FaEdit, label: "Edit Lead" },
                                          { icon: FaPhone, label: "Call Lead" },
                                        ].map((a, ai) => (
                                          <button
                                            key={ai}
                                            onClick={() => setOpenMenu(null)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                          >
                                            <a.icon
                                              size={11}
                                              className="text-slate-400 dark:text-slate-500"
                                            />
                                            {a.label}
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Showing {(page - 1) * 15 + 1}–
                    {Math.min(page * 15, pagination.total)} of{" "}
                    {pagination.total} leads
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 7) },
                      (_, i) => {
                        let p: number;
                        if (pagination.totalPages <= 7) {
                          p = i + 1;
                        } else if (page <= 4) {
                          p = i + 1;
                        } else if (page >= pagination.totalPages - 3) {
                          p = pagination.totalPages - 6 + i;
                        } else {
                          p = page - 3 + i;
                        }
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${p === page ? "bg-blue-500 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                          >
                            {p}
                          </button>
                        );
                      },
                    )}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.totalPages, p + 1))
                      }
                      disabled={page === pagination.totalPages}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AgentLeadsPage;
