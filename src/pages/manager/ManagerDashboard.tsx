import { useState } from "react";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import { FaSync } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

import KPICards from "./sections/KPICards";
import LeadFunnel from "./sections/LeadFunnel";
import TeamPerformance from "./sections/TeamPerformance";
import AnalyticsSection from "./sections/AnalyticsSection";
import RecentLeadsTable from "./sections/RecentLeadsTable";
import FollowUpTimeline from "./sections/FollowUpTimeline";
import ActivityTimeline from "./sections/ActivityTimeline";
import NotificationsPanel from "./sections/NotificationsPanel";
import TaskManagement from "./sections/TaskManagement";

const SyncIcon = FaSync as ElementType;
const DashboardIcon = MdDashboard as ElementType;

interface ManagerDashboardProps {
  data: any;
  user: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const SectionHeading = ({
  label,
  gradient,
}: {
  label: string;
  gradient: string;
}) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`w-1 h-5 bg-gradient-to-b ${gradient} rounded-full`} />
    <motion.h2
      animate={{
        textShadow: [
          "0 0 6px rgba(37,99,235,0.25)",
          "0 0 18px rgba(56,189,248,0.55)",
          "0 0 12px rgba(29,78,216,0.35)",
          "0 0 6px rgba(37,99,235,0.25)",
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="text-sm font-extrabold bg-gradient-to-r from-[#17145b] via-[#355f91] to-[#3db0a6] bg-clip-text text-transparent drop-shadow-sm"
    >
      {label}
    </motion.h2>
  </div>
);

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ data, user }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  /* ── Safe data extraction with fallbacks ── */
  const kpi = data?.kpi ?? {
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    lostLeads: 0,
    teamMembers: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
    thisMonth: 0,
  };

  const funnel: any[] = data?.funnel ?? [];
  const charts = data?.charts ?? {
    leadsByStatus: [],
    leadsBySource: [],
    agentPerformance: [],
    monthlyTrends: [],
  };
  const tables = data?.tables ?? { agents: [], recentLeads: [], followUps: [] };
  const activityTimeline: any[] = data?.activityTimeline ?? [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="manager-dashboard-theme space-y-5 pb-8"
    >
      {/* ── Dashboard Header ── */}
      <motion.div
        variants={sectionVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <motion.div
              whileHover={{ rotateY: 18, rotateX: -8, scale: 1.08 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#17145b] via-[#2b3578] to-[#3db0a6] flex items-center justify-center shadow-lg shadow-[#355f91]/30 transform-gpu"
            >
              <DashboardIcon className="text-white" size={18} />
            </motion.div>
            <motion.h1
              animate={{
                textShadow: [
                  "0 0 8px rgba(37,99,235,0.28)",
                  "0 0 22px rgba(56,189,248,0.58)",
                  "0 0 14px rgba(29,78,216,0.38)",
                  "0 0 8px rgba(37,99,235,0.28)",
                ],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-xl font-extrabold bg-gradient-to-r from-[#17145b] via-[#355f91] to-[#3db0a6] bg-clip-text text-transparent drop-shadow-sm"
            >
              Manager Dashboard
            </motion.h1>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 ml-0.5">
            Welcome back,{" "}
            <span className="text-[#3db0a6] font-semibold">
              {user?.name || "Manager"}
            </span>
            . Here's your team's performance overview.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm ${
              refreshing ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <SyncIcon size={12} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* ── 1. KPI Cards ── */}
      <motion.section variants={sectionVariants}>
        <KPICards kpi={kpi} />
      </motion.section>

      {/* ── 2. Lead Funnel + Revenue Reports ── */}
      <motion.section variants={sectionVariants}>
        <SectionHeading
          label="Lead Pipeline"
          gradient="from-[#17145b] to-[#3db0a6]"
        />
        <LeadFunnel funnel={funnel} totalLeads={kpi.totalLeads} />
      </motion.section>

      {/* ── 3. Team Performance ── */}
      <motion.section variants={sectionVariants}>
        <SectionHeading
          label="Team Performance"
          gradient="from-[#2b3578] to-[#355f91]"
        />
        <TeamPerformance agents={tables.agents} />
      </motion.section>

      {/* ── 4. Analytics Charts ── */}
      <motion.section variants={sectionVariants}>
        <SectionHeading
          label="Analytics & Insights"
          gradient="from-[#355f91] to-[#3db0a6]"
        />
        <AnalyticsSection
          leadsBySource={charts.leadsBySource}
          agentPerformance={charts.agentPerformance}
          monthlyTrends={charts.monthlyTrends}
        />
      </motion.section>

      {/* ── 5. Recent Leads Table ── */}
      <motion.section variants={sectionVariants}>
        <SectionHeading
          label="Recent Leads"
          gradient="from-[#3db0a6] to-[#355f91]"
        />
        <RecentLeadsTable leads={tables.recentLeads} />
      </motion.section>

      {/* ── 6. Follow-up Timeline + Activity Timeline ── */}
      <motion.section variants={sectionVariants}>
        <SectionHeading
          label="Operations & Activity"
          gradient="from-[#17145b] to-[#2b3578]"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FollowUpTimeline followUps={tables.followUps} />
          <ActivityTimeline activities={activityTimeline} />
        </div>
      </motion.section>

      {/* ── 7. Notifications + Task Management ── */}
      <motion.section variants={sectionVariants}>
        <SectionHeading
          label="Alerts & Tasks"
          gradient="from-[#2b3578] to-[#3db0a6]"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NotificationsPanel
            activityCount={activityTimeline.length}
            newLeadsCount={kpi.newLeads}
            convertedCount={kpi.convertedLeads}
            followUpsCount={
              tables.followUps.filter((f: any) => f.status === "pending").length
            }
          />
          <TaskManagement
            followUps={tables.followUps}
            convertedLeads={kpi.convertedLeads}
            totalLeads={kpi.totalLeads}
          />
        </div>
      </motion.section>
    </motion.div>
  );
};

export default ManagerDashboard;
