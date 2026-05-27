import { motion } from 'framer-motion';
import { FaDollarSign, FaTrophy, FaChartLine, FaBullseye } from 'react-icons/fa';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

interface RevenueReportsProps {
  convertedLeads: number;
  totalLeads: number;
  conversionRate: number;
  monthlyGrowth: number;
  monthlyTrends: Array<{ month: string; leads: number; converted: number }>;
}

const AVG_DEAL = 850; // average deal size in USD
const TARGET_CONVERSION = 30; // 30% target conversion rate

const RevenueReports: React.FC<RevenueReportsProps> = ({
  convertedLeads,
  totalLeads,
  conversionRate,
  monthlyGrowth,
  monthlyTrends,
}) => {
  const totalRevenue = convertedLeads * AVG_DEAL;
  const monthlyRevenue =
    monthlyTrends.length > 0
      ? (monthlyTrends[monthlyTrends.length - 1]?.converted || 0) * AVG_DEAL
      : 0;
  const targetRevenue = Math.round(totalLeads * (TARGET_CONVERSION / 100)) * AVG_DEAL;
  const revenueProgress =
    targetRevenue > 0 ? Math.min(Math.round((totalRevenue / targetRevenue) * 100), 100) : 0;

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: FaDollarSign,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-100 dark:border-green-800/30',
      trend: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth}%`,
      positive: monthlyGrowth >= 0,
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: FaChartLine,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800/30',
      trend: 'This month',
      positive: true,
    },
    {
      title: 'Deals Closed',
      value: convertedLeads.toString(),
      icon: FaTrophy,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-800/30',
      trend: `${conversionRate}% rate`,
      positive: conversionRate >= TARGET_CONVERSION,
    },
    {
      title: 'Avg Deal Size',
      value: `$${AVG_DEAL.toLocaleString()}`,
      icon: FaBullseye,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-100 dark:border-violet-800/30',
      trend: 'Per lead',
      positive: true,
    },
  ];

  const progressBarColor =
    revenueProgress >= 80
      ? 'bg-green-500'
      : revenueProgress >= 50
      ? 'bg-blue-500'
      : revenueProgress >= 25
      ? 'bg-amber-500'
      : 'bg-red-500';

  const maxRevenue = Math.max(...monthlyTrends.map((m) => m.converted * AVG_DEAL), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
          <FaDollarSign className="text-green-500" size={13} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Revenue & Reports</h2>
          <p className="text-xs text-slate-400">Estimated revenue analytics</p>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className={`p-3 rounded-xl border ${m.border} ${m.bg}`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={m.color} size={12} />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {m.title}
                </span>
              </div>
              <div className="text-base font-bold text-slate-800 dark:text-white leading-none">
                {m.value}
              </div>
              <div
                className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${
                  m.positive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                }`}
              >
                {m.positive ? <MdTrendingUp size={10} /> : <MdTrendingDown size={10} />}
                {m.trend}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sales Target */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Sales Target Progress
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {revenueProgress}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${revenueProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${progressBarColor}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Current: ${totalRevenue.toLocaleString()}</span>
          <span>Target: ${targetRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Monthly breakdown */}
      {monthlyTrends.length > 0 && (
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">
            Monthly Revenue Breakdown
          </p>
          <div className="space-y-2">
            {monthlyTrends.slice(-5).map((m, i) => {
              const rev = m.converted * AVG_DEAL;
              const pct = Math.round((rev / maxRevenue) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-8 flex-shrink-0">{m.month}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 w-16 text-right flex-shrink-0">
                    ${rev.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueReports;
