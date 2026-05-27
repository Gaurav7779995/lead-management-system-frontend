import { motion } from 'framer-motion';
import type { ElementType } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import { MdSchedule } from 'react-icons/md';

const CalendarAltIcon = FaCalendarAlt as ElementType;
const CheckCircleIcon = FaCheckCircle as ElementType;
const ExclamationCircleIcon = FaExclamationCircle as ElementType;
const ClockIcon = FaClock as ElementType;
const ScheduleIcon = MdSchedule as ElementType;

interface FollowUp {
  leadId: string;
  leadName: string;
  followUpDate: any;
  note: string;
  status: string;
  agentName: string;
}

interface FollowUpTimelineProps {
  followUps: FollowUp[];
}

const now = new Date();

const getStatusConf = (status: string, date: any) => {
  const d = new Date(date);
  if (status === 'completed')
    return {
      Icon: CheckCircleIcon,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-700/50',
      label: 'Completed',
      labelCls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
  if (status === 'missed' || (status === 'pending' && d < now))
    return {
      Icon: ExclamationCircleIcon,
      color: 'text-red-500',
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-700/50',
      label: 'Missed',
      labelCls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
  const isToday = d.toDateString() === now.toDateString();
  if (isToday)
    return {
      Icon: ClockIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      border: 'border-orange-200 dark:border-orange-700/50',
      label: 'Today',
      labelCls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
  return {
    Icon: ScheduleIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700/50',
    label: 'Upcoming',
    labelCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
};

const formatDate = (d: any) => {
  if (!d) return 'N/A';
  const date = new Date(d);
  const isToday = date.toDateString() === now.toDateString();
  const isTmr = new Date(now.getTime() + 86400000).toDateString() === date.toDateString();
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today, ${timeStr}`;
  if (isTmr) return `Tomorrow, ${timeStr}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
};

const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ followUps }) => {
  const sorted = [...followUps].sort((a, b) => {
    const aConf = getStatusConf(a.status, a.followUpDate);
    const bConf = getStatusConf(b.status, b.followUpDate);
    // today first, then upcoming, then completed/missed
    if (aConf.label === 'Today' && bConf.label !== 'Today') return -1;
    if (bConf.label === 'Today' && aConf.label !== 'Today') return 1;
    return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
  });

  const pendingCount = followUps.filter((f) => f.status === 'pending').length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
          <ScheduleIcon className="text-orange-500" size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Follow-up Timeline</h2>
          <p className="text-xs text-slate-400">{pendingCount} pending follow-ups</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <CalendarAltIcon className="text-slate-300 dark:text-slate-600 mb-3" size={32} />
          <p className="text-sm text-slate-400">No follow-ups scheduled</p>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          {/* vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 pl-1">
            {sorted.map((fu, index) => {
              const conf = getStatusConf(fu.status, fu.followUpDate);
              const Icon = conf.Icon;
              return (
                <motion.div
                  key={`${fu.leadId}-${index}`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="relative flex gap-3 pl-10"
                >
                  {/* icon */}
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full ${conf.bg} flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-slate-800 z-10`}
                  >
                    <Icon className={conf.color} size={13} />
                  </div>

                  {/* card */}
                  <div
                    className={`flex-1 p-3 rounded-xl border ${conf.border} bg-slate-50/50 dark:bg-slate-700/30`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                        {fu.leadName}
                      </p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${conf.labelCls}`}>
                        {conf.label}
                      </span>
                    </div>
                    {fu.note && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 line-clamp-2">
                        {fu.note}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <ClockIcon size={8} />
                        <span>{formatDate(fu.followUpDate)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">by {fu.agentName}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpTimeline;
