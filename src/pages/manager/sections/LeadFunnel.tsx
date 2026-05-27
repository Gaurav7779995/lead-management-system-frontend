import { motion } from "framer-motion";
import type { ElementType } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClipboardList,
  FaPhoneAlt,
  FaProjectDiagram,
  FaRegStar,
  FaSyncAlt,
  FaTag,
} from "react-icons/fa";

const ArrowRightIcon = FaArrowRight as ElementType;
const ProjectDiagramIcon = FaProjectDiagram as ElementType;
const ClipboardListIcon = FaClipboardList as ElementType;
const PhoneAltIcon = FaPhoneAlt as ElementType;
const StarIcon = FaRegStar as ElementType;
const SyncAltIcon = FaSyncAlt as ElementType;
const CheckCircleIcon = FaCheckCircle as ElementType;
const TagIcon = FaTag as ElementType;

interface FunnelStage {
  stage: string;
  count: number;
  color: string;
  percentage: number;
}

interface LeadFunnelProps {
  funnel: FunnelStage[];
  totalLeads: number;
}

const STAGE_META: Record<string, { icon: ElementType; desc: string }> = {
  New: { icon: ClipboardListIcon, desc: "Fresh leads entered the pipeline" },
  Contacted: { icon: PhoneAltIcon, desc: "Initial contact attempted" },
  Interested: { icon: StarIcon, desc: "Showed interest / qualified" },
  "Follow-up": { icon: SyncAltIcon, desc: "Regular follow-up in progress" },
  Converted: { icon: CheckCircleIcon, desc: "Deal successfully closed" },
};

const LeadFunnel: React.FC<LeadFunnelProps> = ({ funnel, totalLeads }) => {
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <ProjectDiagramIcon className="text-blue-500" size={13} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              Lead Funnel
            </h2>
            <p className="text-xs text-slate-400">Stage-wise progression</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">
            {totalLeads}
          </div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
            Total Leads
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {funnel.map((stage, index) => {
          const barWidth =
            maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 8) : 8;
          const meta = STAGE_META[stage.stage] || { icon: TagIcon, desc: "" };
          const StageIcon = meta.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-white/10"
                  style={{ color: stage.color }}
                >
                  <StageIcon size={12} />
                </span>

                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-20 flex-shrink-0">
                  {stage.stage}
                </span>

                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{
                      duration: 0.9,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stage.color + "cc" }}
                  />
                  <div
                    className="absolute inset-0 flex items-center px-3"
                    style={{ zIndex: 1 }}
                  >
                    <span className="text-[10px] font-bold text-white drop-shadow">
                      {stage.count > 0 ? stage.count : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-800 dark:text-white w-6 text-right tabular-nums">
                    {stage.count}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white min-w-[32px] text-center"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.percentage}%
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pl-10 mt-0.5">
                {meta.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {funnel.map((stage, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="px-2.5 py-1 rounded-lg text-white text-[10px] font-bold shadow-sm"
                style={{ backgroundColor: stage.color }}
              >
                {stage.stage}
              </div>
              {index < funnel.length - 1 && (
                <ArrowRightIcon
                  size={9}
                  className="text-slate-300 dark:text-slate-600"
                />
              )}
            </div>
          ))}
        </div>

        {funnel.length > 0 && funnel[0].count > 0 && (
          <div className="mt-3 flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">
              Funnel Efficiency
            </span>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
              {funnel[funnel.length - 1].count} / {funnel[0].count} (
              {Math.round(
                (funnel[funnel.length - 1].count / funnel[0].count) * 100,
              )}
              %)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadFunnel;
