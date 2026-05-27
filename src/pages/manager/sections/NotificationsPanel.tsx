import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBell,
  FaCheckDouble,
  FaUserPlus,
  FaTrophy,
  FaExchangeAlt,
  FaCalendarCheck,
  FaTasks,
  FaTimes,
} from 'react-icons/fa';

interface NotificationsPanelProps {
  activityCount: number;
  newLeadsCount: number;
  convertedCount: number;
  followUpsCount: number;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  activityCount,
  newLeadsCount,
  convertedCount,
  followUpsCount,
}) => {
  const [dismissed, setDismissed] = useState<number[]>([]);

  const allNotifications = [
    {
      id: 1,
      icon: FaUserPlus,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      title: 'New Leads Assigned',
      message: `${newLeadsCount} new leads are waiting for your team's attention`,
      time: 'Just now',
      priority: 'high',
    },
    {
      id: 2,
      icon: FaTrophy,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
      title: 'Leads Converted',
      message: `${convertedCount} leads converted successfully this period`,
      time: '1h ago',
      priority: 'normal',
    },
    {
      id: 3,
      icon: FaCalendarCheck,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      title: 'Follow-ups Due',
      message: `${followUpsCount} follow-ups scheduled for your team today`,
      time: '2h ago',
      priority: 'high',
    },
    {
      id: 4,
      icon: FaExchangeAlt,
      color: 'text-violet-500',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      title: 'Status Updates',
      message: `${activityCount} lead status changes recorded recently`,
      time: '3h ago',
      priority: 'normal',
    },
    {
      id: 5,
      icon: FaTasks,
      color: 'text-pink-500',
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      title: 'Weekly Report Ready',
      message: 'Your team performance report is ready to view',
      time: '1d ago',
      priority: 'low',
    },
  ];

  const notifications = allNotifications.filter((n) => !dismissed.includes(n.id));
  const unreadCount = notifications.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center relative">
            <FaBell className="text-red-500" size={13} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h2>
            <p className="text-xs text-slate-400">{unreadCount} unread alerts</p>
          </div>
        </div>
        <button
          onClick={() => setDismissed([1, 2, 3, 4, 5])}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
        >
          <FaCheckDouble size={10} />
          Mark all read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FaBell className="text-slate-300 dark:text-slate-600 mb-2" size={28} />
              <p className="text-sm text-slate-400">All caught up!</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = n.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    n.priority === 'high'
                      ? 'border-red-100 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10'
                      : n.priority === 'low'
                      ? 'border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-700/10'
                      : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${n.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={n.color} size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white">{n.title}</p>
                      {n.priority === 'high' && (
                        <span className="text-[9px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => [...prev, n.id])}
                    className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors duration-150"
                  >
                    <FaTimes size={10} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPanel;
