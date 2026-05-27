import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import axiosInstance from "../../api/axiosInstance";
import { clearDashboardCache } from "../../utils/dashboardCache";
import {
  FaUsers,
  FaCheckCircle,
  FaSpinner,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaTrophy,
  FaChartLine,
  FaWifi,
  FaPlus,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";

// ── Types matching the backend's getManagerAgents response ──
interface AgentPerformance {
  assignedLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  activeFollowUps: number;
  conversionRate: number;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  onlineStatus: "online" | "offline";
  performance: AgentPerformance;
}

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "NA";

const AVATAR_GRADIENTS = [
  "from-blue-500 to-violet-600",
  "from-violet-500 to-pink-500",
  "from-pink-500 to-rose-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-cyan-500 to-blue-500",
];

const ManagerAgentDashboard = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError("");
      // ✅ Correct endpoint: /api/manager/agents (agentManagement.routes.js)
      const response = await axiosInstance.get("/manager/agents");
      setAgents(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      setError("Failed to load agents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setCreating(true);
      setCreateError("");
      await axiosInstance.post("/auth/register", {
        ...createForm,
        role: "agent",
      });
      clearDashboardCache("manager");
      setCreateForm({ name: "", email: "", phone: "", password: "" });
      setShowPassword(false);
      setCreateOpen(false);
      fetchAgents();
    } catch (err: any) {
      setCreateError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create agent. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard manager-dashboard-shell manager-agents-theme">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="dashboard-content manager-dashboard-theme">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* ── Page Header ── */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#17145b] via-[#355f91] to-[#3db0a6] flex items-center justify-center shadow-lg shadow-[#355f91]/30">
                  <FaUsers className="text-white" size={18} />
                </div>
                <div>
                  <h1 className="manager-leads-3d-title manager-agents-title text-2xl font-medium text-slate-800 dark:text-white tracking-tight">
                    My Agents
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="manager-leads-main-action inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              >
                <FaPlus size={12} /> Create Agent
              </button>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <FaSpinner
                  className="text-blue-500 animate-spin mb-3"
                  size={32}
                />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Loading agents...
                </p>
              </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800/30">
                <p className="text-red-500 font-semibold mb-3">{error}</p>
                <button
                  onClick={fetchAgents}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && !error && agents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <FaUserTie
                  className="text-slate-300 dark:text-slate-600 mb-3"
                  size={40}
                />
                <p className="text-slate-500 dark:text-slate-400 font-semibold">
                  No agents found
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                  Add agents to your team to get started
                </p>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="manager-leads-main-action mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <FaPlus size={12} /> Create Agent
                </button>
              </div>
            )}

            {/* ── Agents Grid ── */}
            {!loading && !error && agents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent, index) => {
                  const grad =
                    AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
                  const isActive = agent.status?.toLowerCase() === "active";
                  const isOnline = agent.onlineStatus === "online";
                  const perf = agent.performance || {
                    assignedLeads: 0,
                    convertedLeads: 0,
                    pendingLeads: 0,
                    activeFollowUps: 0,
                    conversionRate: 0,
                  };

                  return (
                    <motion.div
                      key={agent._id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07, duration: 0.4 }}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      onClick={() => navigate(`/manager/agents/${agent._id}`)}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      {/* ── Gradient top accent bar (hover shows full) ── */}
                      <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />

                      <div className="p-6">
                        {/* ── Agent Header ── */}
                        <div className="flex items-start gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-700/60">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}
                            >
                              {/* ✅ text-white ensures initials always visible on gradient bg */}
                              <span className="text-white text-lg font-extrabold select-none">
                                {getInitials(agent.name)}
                              </span>
                            </div>
                            {/* Online indicator */}
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                                isOnline ? "bg-green-500" : "bg-slate-400"
                              }`}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white truncate mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {agent.name}
                            </h3>
                            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs mb-1.5">
                              <FaEnvelope size={9} className="flex-shrink-0" />
                              <span className="truncate">{agent.email}</span>
                            </div>
                            {agent.phone && (
                              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                                <FaPhone size={9} className="flex-shrink-0" />
                                <span>{agent.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Status Badges column */}
                          <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                            {/* Active/Inactive */}
                            <div
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isActive
                                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50"
                                  : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </div>
                            {/* Online/Offline */}
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                isOnline
                                  ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"
                              }`}
                            >
                              <FaWifi size={8} />
                              {isOnline ? "Online" : "Offline"}
                            </div>
                          </div>
                        </div>

                        {/* ── Stats Row ──
                            Using explicit dark: text classes so text is ALWAYS
                            visible regardless of card bg on hover
                        ── */}
                        <div className="grid grid-cols-3 gap-2.5 mb-4">
                          {/* Total Assigned */}
                          <div className="flex flex-col items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-200">
                            <FaUsers
                              className="text-blue-500 dark:text-blue-400 mb-1"
                              size={13}
                            />
                            {/* ✅ explicit dark text class prevents invisible text on hover */}
                            <span className="text-xl font-extrabold text-blue-700 dark:text-blue-300 leading-none tabular-nums">
                              {perf.assignedLeads}
                            </span>
                            <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide mt-0.5">
                              Total
                            </span>
                          </div>

                          {/* Converted / Won */}
                          <div className="flex flex-col items-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors duration-200">
                            <FaCheckCircle
                              className="text-green-500 dark:text-green-400 mb-1"
                              size={13}
                            />
                            <span className="text-xl font-extrabold text-green-700 dark:text-green-300 leading-none tabular-nums">
                              {perf.convertedLeads}
                            </span>
                            <span className="text-[9px] font-bold text-green-500 dark:text-green-400 uppercase tracking-wide mt-0.5">
                              Won
                            </span>
                          </div>

                          {/* Pending */}
                          <div className="flex flex-col items-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors duration-200">
                            <FaChartLine
                              className="text-amber-500 dark:text-amber-400 mb-1"
                              size={13}
                            />
                            <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300 leading-none tabular-nums">
                              {perf.pendingLeads}
                            </span>
                            <span className="text-[9px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wide mt-0.5">
                              Pending
                            </span>
                          </div>
                        </div>

                        {/* ── Conversion progress bar ── */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              Conversion Rate
                            </span>
                            <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
                              {perf.conversionRate}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(perf.conversionRate, 100)}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: "easeOut" as const,
                              }}
                              className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                            />
                          </div>
                        </div>

                        {/* ── Total Leads Banner ──
                            Gradient bg ensures text is always white/visible
                        ── */}
                        <div
                          className={`flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r ${grad} shadow-sm`}
                        >
                          <div className="flex items-center gap-2">
                            <FaTrophy className="text-white/90" size={14} />
                            <span className="text-white text-xs font-extrabold uppercase tracking-wide">
                              Total Leads
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* ✅ text-white hardcoded — always visible on gradient bg */}
                            <span className="text-white text-2xl font-extrabold tabular-nums leading-none">
                              {perf.assignedLeads}
                            </span>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-0.5 text-white/80 text-[10px] font-bold">
                                <MdTrendingUp size={12} />
                                <span>{perf.conversionRate}%</span>
                              </div>
                              <span className="text-white/60 text-[9px]">
                                conv. rate
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <motion.form
            initial={{ opacity: 0, y: 18, rotateX: -8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 18 }}
            onSubmit={handleCreateAgent}
            className="manager-create-agent-modal w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#3db0a6]">
                  Manager Team
                </p>
                <h2 className="manager-leads-3d-title mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  Create Agent
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Agent Name
                </span>
                <input
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter agent name"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#3db0a6] focus:ring-2 focus:ring-[#3db0a6]/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Email Address
                </span>
                <input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#3db0a6] focus:ring-2 focus:ring-[#3db0a6]/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Phone Number
                </span>
                <input
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#3db0a6] focus:ring-2 focus:ring-[#3db0a6]/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Temporary Password
                </span>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter temporary password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-11 text-sm outline-none focus:border-[#3db0a6] focus:ring-2 focus:ring-[#3db0a6]/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </label>
            </div>

            {createError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {createError}
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="manager-leads-main-action mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? <FaSpinner className="animate-spin" size={13} /> : <FaPlus size={12} />}
              {creating ? "Creating..." : "Create Agent"}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
};

export default ManagerAgentDashboard;
