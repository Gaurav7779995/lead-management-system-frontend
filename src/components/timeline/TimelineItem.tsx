import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, StickyNote } from 'lucide-react';
import { TimelineActivity } from './types';
import ActivityIcon from './ActivityIcon';
import ActivityBadge from './ActivityBadge';

interface TimelineItemProps {
  activity: TimelineActivity;
  index: number;
}

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TimelineItem: React.FC<TimelineItemProps> = ({ activity, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="relative pl-10 sm:pl-12"
    >
      {/* Vertical line segment */}
      <div className="absolute left-[1.15rem] sm:left-[1.3rem] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

      {/* Icon positioned on the line */}
      <div className="absolute left-0 top-0">
        <ActivityIcon type={activity.type} />
      </div>

      {/* Card */}
      <div
        className={`
          group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700
          shadow-sm hover:shadow-md transition-shadow duration-200 mb-4 overflow-hidden
        `}
      >
        {/* Top accent bar */}
        <div
          className={`
            h-1 w-full
            ${activity.type === 'lead_created' ? 'bg-blue-500' : ''}
            ${activity.type === 'lead_assigned' ? 'bg-violet-500' : ''}
            ${activity.type === 'call_completed' ? 'bg-emerald-500' : ''}
            ${activity.type === 'followup_scheduled' ? 'bg-amber-500' : ''}
            ${activity.type === 'email_sent' ? 'bg-indigo-500' : ''}
            ${activity.type === 'meeting_done' ? 'bg-pink-500' : ''}
            ${activity.type === 'status_changed' ? 'bg-cyan-500' : ''}
            ${activity.type === 'payment_received' ? 'bg-green-500' : ''}
            ${activity.type === 'lead_closed' ? 'bg-red-500' : ''}
          `}
        />

        <div className="p-4 sm:p-5">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {activity.title}
                </h4>
                <ActivityBadge type={activity.type} status={activity.status} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {activity.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Clock size={12} />
                {formatDateTime(activity.timestamp)}
              </span>
            </div>
          </div>

          {/* User row */}
          <div className="flex items-center gap-2 mt-3">
            {activity.userAvatar ? (
              <img
                src={activity.userAvatar}
                alt={activity.userName}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {activity.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {activity.userName}
            </span>
          </div>

          {/* Expandable details */}
          {(activity.notes || activity.metadata) && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                />
                {expanded ? 'Hide details' : 'Show details'}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                      {activity.notes && (
                        <div className="flex items-start gap-2">
                          <StickyNote size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-slate-600 dark:text-slate-300">{activity.notes}</p>
                        </div>
                      )}
                      {activity.metadata &&
                        Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 min-w-[80px]">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineItem;
