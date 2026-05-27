import { motion } from 'framer-motion';
import type { ElementType } from 'react';
import {
  FaPlus,
  FaExchangeAlt,
  FaUserCheck,
  FaStickyNote,
  FaPhone,
  FaCalendarCheck,
  FaFile,
  FaTimes,
  FaHistory,
  FaStream,
} from 'react-icons/fa';

const PlusIcon = FaPlus as ElementType;
const ExchangeIcon = FaExchangeAlt as ElementType;
const UserCheckIcon = FaUserCheck as ElementType;
const StickyNoteIcon = FaStickyNote as ElementType;
const PhoneIcon = FaPhone as ElementType;
const CalendarCheckIcon = FaCalendarCheck as ElementType;
const FileIcon = FaFile as ElementType;
const TimesIcon = FaTimes as ElementType;
const HistoryIcon = FaHistory as ElementType;
const StreamIcon = FaStream as ElementType;

interface Activity {
  type: string;
  message: string;
  leadName: string;
  agentName: string;
  createdAt: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  created: { icon: PlusIcon, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Lead Created' },
  status_changed: { icon: ExchangeIcon, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', label: 'Status Changed' },
  assigned: { icon: UserCheckIcon, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30', label: 'Lead Assigned' },
  note_added: { icon: StickyNoteIcon, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Note Added' },
  follow_up_added: { icon: CalendarCheckIcon, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Follow-up Added' },
  call_logged: { icon: PhoneIcon, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Call Logged' },
  meeting_scheduled: { icon: CalendarCheckIcon, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30', label: 'Meeting Scheduled' },
  file_uploaded: { icon: FileIcon, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'File Uploaded' },
  closed: { icon: TimesIcon, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Lead Closed' },
};

const getTimeAgo = (dateStr: string) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
          <StreamIcon className="text-violet-500" size={13} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Activity Timeline</h2>
          <p className="text-xs text-slate-400">Real-time CRM activity feed</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <HistoryIcon className="text-slate-300 dark:text-slate-600 mb-3" size={32} />
          <p className="text-sm text-slate-400">No recent activity</p>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          {/* gradient line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-slate-200 to-transparent dark:from-blue-700 dark:via-slate-700" />

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 pl-1">
            {activities.map((activity, index) => {
              const conf =
                TYPE_CONFIG[activity.type] || {
                  icon: HistoryIcon,
                  color: 'text-slate-500',
                  bg: 'bg-slate-100 dark:bg-slate-700',
                  label: activity.type,
                };
              const Icon = conf.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative flex gap-3 pl-10"
                >
                  {/* icon */}
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full ${conf.bg} flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-slate-800 z-10`}
                  >
                    <Icon className={conf.color} size={12} />
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                          {activity.message || conf.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          Lead:{' '}
                          <span className="text-blue-500 font-medium">{activity.leadName}</span>{' '}
                          - by{' '}
                          <span className="font-medium">{activity.agentName}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                        {getTimeAgo(activity.createdAt)}
                      </span>
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

export default ActivityTimeline;
