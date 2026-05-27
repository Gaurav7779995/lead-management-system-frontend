import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import {
  FaChartPie,
  FaChartBar,
  FaChartLine,
  FaDollarSign,
} from "react-icons/fa";

interface AnalyticsSectionProps {
  leadsBySource: Array<{ name: string; value: number }>;
  agentPerformance: Array<{
    name: string;
    total: number;
    converted: number;
    pending: number;
  }>;
  monthlyTrends: Array<{ month: string; leads: number; converted: number }>;
}

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

const PIE_FALLBACK_COLORS = [
  "#17145b",
  "#2b3578",
  "#355f91",
  "#3db0a6",
  "#22306f",
  "#2f7f9a",
  "#49b9b0",
  "#64748b",
];

const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  website: "Website",
  whatsapp: "WhatsApp",
  referral: "Referral",
  google: "Google Ads",
  linkedin: "LinkedIn",
  manual: "Manual",
  call: "Call",
  other: "Other",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs">
        {label && (
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
            {label}
          </p>
        )}
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
    {message}
  </div>
);

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  leadsBySource,
  agentPerformance,
  monthlyTrends,
}) => {
  const sourceData = leadsBySource.map((s) => ({
    name: SOURCE_LABELS[s.name] || s.name,
    value: s.value,
    originalName: s.name,
  }));

  const revenueData = monthlyTrends.map((m) => ({
    month: m.month,
    revenue: m.converted * 500,
  }));

  const chartCardClass =
    "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Pie — Lead Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={chartCardClass}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FaChartPie className="text-blue-500" size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Lead Sources
            </h3>
            <p className="text-xs text-slate-400">Where leads come from</p>
          </div>
        </div>
        {sourceData.length === 0 ? (
          <EmptyState message="No source data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      SOURCE_COLORS[entry.originalName] ||
                      PIE_FALLBACK_COLORS[index % PIE_FALLBACK_COLORS.length]
                    }
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [value, name]}
                contentStyle={{
                  borderRadius: "12px",
                  fontSize: "12px",
                  border: "1px solid #e2e8f0",
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
        )}
      </motion.div>

      {/* 2. Bar — Agent Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={chartCardClass}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
            <FaChartBar className="text-violet-500" size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Agent Performance
            </h3>
            <p className="text-xs text-slate-400">
              Total vs Converted vs Pending
            </p>
          </div>
        </div>
        {agentPerformance.length === 0 ? (
          <EmptyState message="No agent data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={agentPerformance}
              margin={{ top: 5, right: 10, left: -20, bottom: 45 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={55}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />
              <Bar
                dataKey="total"
                fill="#17145b"
                name="Total"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="converted"
                fill="#3db0a6"
                name="Converted"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                fill="#355f91"
                name="Pending"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* 3. Line — Monthly Conversion Growth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={chartCardClass}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <FaChartLine className="text-green-500" size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Monthly Conversion Growth
            </h3>
            <p className="text-xs text-slate-400">Last 6 months trend</p>
          </div>
        </div>
        {monthlyTrends.length === 0 ? (
          <EmptyState message="No trend data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart
              data={monthlyTrends}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#17145b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#17145b" }}
                name="Total Leads"
              />
              <Line
                type="monotone"
                dataKey="converted"
                stroke="#3db0a6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3db0a6" }}
                name="Converted"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* 4. Area — Revenue Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={chartCardClass}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <FaDollarSign className="text-orange-500" size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Revenue Analytics
            </h3>
            <p className="text-xs text-slate-400">
              Estimated monthly revenue (avg $500/deal)
            </p>
          </div>
        </div>
        {revenueData.length === 0 ? (
          <EmptyState message="No revenue data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart
              data={revenueData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3db0a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3db0a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: any) => [
                  `$${Number(v).toLocaleString()}`,
                  "Revenue",
                ]}
                contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3db0a6"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsSection;
