import { motion } from "framer-motion";
import { FaTrophy, FaUsers } from "react-icons/fa";

interface Agent {
  agent: { _id: string; name: string; email: string };
  totalLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  lostLeads: number;
  performanceRate: number;
  isTopPerformer: boolean;
}

interface TeamPerformanceProps {
  agents: Agent[];
}

const AVATAR_GRADIENTS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-pink-400 to-pink-600",
  "from-green-400 to-green-600",
  "from-orange-400 to-orange-600",
  "from-cyan-400 to-cyan-600",
];

const getPerformanceConfig = (rate: number) => {
  if (rate >= 60)
    return {
      barColor: "bg-green-500",
      badge:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      label: "Excellent",
    };
  if (rate >= 40)
    return {
      barColor: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      label: "Good",
    };
  if (rate >= 20)
    return {
      barColor: "bg-amber-500",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      label: "Average",
    };
  return {
    barColor: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    label: "Needs Help",
  };
};

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AG";

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ agents }) => {
  const sorted = [...agents].sort(
    (a, b) => b.performanceRate - a.performanceRate,
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FaUsers className="text-blue-500" size={14} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              Team Performance
            </h2>
            <p className="text-xs text-slate-400">
              {agents.length} agents in your team
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/30">
          <FaTrophy size={10} />
          <span className="font-semibold">Top Performer Highlighted</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60">
              {[
                "#",
                "Agent",
                "Assigned",
                "Converted",
                "Pending",
                "Lost",
                "Performance",
                "Status",
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
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <FaUsers
                    className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
                    size={32}
                  />
                  <p className="text-sm text-slate-400">
                    No agents assigned yet
                  </p>
                </td>
              </tr>
            ) : (
              sorted.map((agentData, index) => {
                const perf = getPerformanceConfig(agentData.performanceRate);
                const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
                return (
                  <motion.tr
                    key={agentData.agent._id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150 ${
                      agentData.isTopPerformer
                        ? "bg-amber-50/40 dark:bg-amber-900/5"
                        : ""
                    }`}
                  >
                    {/* # */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-400">
                        #{index + 1}
                      </span>
                    </td>

                    {/* Agent */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[160px]">
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm`}
                          >
                            <span className="text-white text-xs font-bold">
                              {getInitials(agentData.agent.name)}
                            </span>
                          </div>
                          {agentData.isTopPerformer && (
                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                              <FaTrophy size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[110px]">
                              {agentData.agent.name}
                            </p>
                            {agentData.isTopPerformer && (
                              <span className="flex-shrink-0 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/50">
                                TOP ⭐
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {agentData.agent.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Assigned */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {agentData.totalLeads}
                      </span>
                    </td>

                    {/* Converted */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {agentData.convertedLeads}
                      </span>
                    </td>

                    {/* Pending */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {agentData.pendingLeads}
                      </span>
                    </td>

                    {/* Lost */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-red-500 dark:text-red-400">
                        {agentData.lostLeads}
                      </span>
                    </td>

                    {/* Performance */}
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${perf.badge}`}
                          >
                            {perf.label}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {agentData.performanceRate}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${agentData.performanceRate}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`h-full rounded-full ${perf.barColor}`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Online
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamPerformance;
