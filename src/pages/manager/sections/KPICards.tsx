import { motion } from "framer-motion";
import {
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUserFriends,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

interface KPIData {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  lostLeads: number;
  teamMembers: number;
  conversionRate: number;
  monthlyGrowth: number;
  thisMonth: number;
}

interface KPICardsProps {
  kpi: KPIData;
}

const KPICards: React.FC<KPICardsProps> = ({ kpi }) => {
  const palette = [
    {
      gradient: "from-[#17145b] to-[#2b3578]",
      lightBg: "bg-[#17145b]/10 dark:bg-[#17145b]/30",
      iconColor: "text-[#17145b] dark:text-[#8ea8d8]",
      border: "border-[#17145b]/15 dark:border-[#3db0a6]/20",
    },
    {
      gradient: "from-[#2b3578] to-[#355f91]",
      lightBg: "bg-[#2b3578]/10 dark:bg-[#2b3578]/30",
      iconColor: "text-[#2b3578] dark:text-[#9fb6df]",
      border: "border-[#2b3578]/15 dark:border-[#3db0a6]/20",
    },
    {
      gradient: "from-[#355f91] to-[#3db0a6]",
      lightBg: "bg-[#355f91]/10 dark:bg-[#355f91]/30",
      iconColor: "text-[#355f91] dark:text-[#9bdad4]",
      border: "border-[#355f91]/15 dark:border-[#3db0a6]/20",
    },
    {
      gradient: "from-[#3db0a6] to-[#17145b]",
      lightBg: "bg-[#3db0a6]/10 dark:bg-[#3db0a6]/20",
      iconColor: "text-[#3db0a6]",
      border: "border-[#3db0a6]/20 dark:border-[#3db0a6]/25",
    },
  ];

  const cards = [
    {
      title: "Total Leads",
      value: kpi.totalLeads,
      icon: FaUsers,
      ...palette[0],
      growth: kpi.monthlyGrowth,
      suffix: "",
      progress: 100,
      sub: "All time",
    },
    {
      title: "New Leads",
      value: kpi.newLeads,
      icon: FaUserPlus,
      ...palette[1],
      growth: 12,
      suffix: "",
      progress:
        kpi.totalLeads > 0
          ? Math.round((kpi.newLeads / kpi.totalLeads) * 100)
          : 0,
      sub: "Awaiting contact",
    },
    {
      title: "Converted",
      value: kpi.convertedLeads,
      icon: FaCheckCircle,
      ...palette[3],
      growth: 8,
      suffix: "",
      progress:
        kpi.totalLeads > 0
          ? Math.round((kpi.convertedLeads / kpi.totalLeads) * 100)
          : 0,
      sub: "Deals closed",
    },
    {
      title: "Pending Leads",
      value: kpi.pendingLeads,
      icon: FaClock,
      ...palette[2],
      growth: -3,
      suffix: "",
      progress:
        kpi.totalLeads > 0
          ? Math.round((kpi.pendingLeads / kpi.totalLeads) * 100)
          : 0,
      sub: "In pipeline",
    },
    {
      title: "Lost Leads",
      value: kpi.lostLeads,
      icon: FaTimesCircle,
      ...palette[0],
      growth: -5,
      suffix: "",
      progress:
        kpi.totalLeads > 0
          ? Math.round((kpi.lostLeads / kpi.totalLeads) * 100)
          : 0,
      sub: "Not interested",
    },
    {
      title: "Team Members",
      value: kpi.teamMembers,
      icon: FaUserFriends,
      ...palette[2],
      growth: 0,
      suffix: "",
      progress: 100,
      sub: "Active agents",
    },
    {
      title: "Conversion Rate",
      value: kpi.conversionRate,
      icon: FaTrophy,
      ...palette[3],
      growth: 2,
      suffix: "%",
      progress: kpi.conversionRate,
      sub: "Win rate",
    },
    {
      title: "This Month",
      value: kpi.thisMonth,
      icon: FaChartLine,
      ...palette[1],
      growth: kpi.monthlyGrowth,
      suffix: "",
      progress:
        kpi.totalLeads > 0
          ? Math.round((kpi.thisMonth / kpi.totalLeads) * 100)
          : 0,
      sub: "New this month",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-2.5 [perspective:1200px]"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.growth >= 0;
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              y: -5,
              rotateX: 5,
              rotateY: index % 2 === 0 ? -4 : 4,
              scale: 1.015,
              transition: { duration: 0.2 },
            }}
            style={{ transformStyle: "preserve-3d" }}
            className={`relative bg-white dark:bg-slate-800 rounded-xl border ${card.border} shadow-sm hover:shadow-xl dark:hover:shadow-blue-950/30 transition-shadow duration-300 overflow-hidden group cursor-pointer transform-gpu manager-kpi-card`}
          >
            {/* gradient top bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${card.gradient}`} />

            <div className="p-2.5">
              {/* header row */}
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg ${card.lightBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 group-hover:[transform:translateZ(18px)_scale(1.18)_rotate(6deg)]`}
                >
                  <Icon className={`${card.iconColor} text-sm drop-shadow-sm`} />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg ${
                    isPositive
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <MdTrendingUp size={12} />
                  ) : (
                    <MdTrendingDown size={12} />
                  )}
                  <span>
                    {isPositive ? "+" : ""}
                    {card.growth}%
                  </span>
                </div>
              </div>

              {/* value */}
              <div className="mb-2">
                <div className="text-2xl font-extrabold text-slate-800 dark:text-cyan-100 leading-none tabular-nums">
                  {card.value.toLocaleString()}
                  {card.suffix}
                </div>
                <div className="text-xs font-extrabold bg-gradient-to-r from-[#17145b] via-[#355f91] to-[#3db0a6] bg-clip-text text-transparent drop-shadow-sm mt-1">
                  {card.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {card.sub}
                </div>
              </div>

              {/* progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">of total</span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {card.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${card.gradient}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default KPICards;
