import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCircle,
} from 'react-icons/fa';

interface FollowUp {
  leadId: string;
  leadName: string;
  followUpDate: any;
  note: string;
  status: string;
  agentName: string;
}

interface TaskManagementProps {
  followUps: FollowUp[];
  convertedLeads: number;
  totalLeads: number;
}

type TaskStatus = 'pending' | 'completed' | 'missed';
type FilterType = 'all' | TaskStatus;

interface Task {
  id: string;
  title: string;
  agent: string;
  dueDate: any;
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  note?: string;
}

const now = new Date();

const getPriorityClass = (p: string) => {
  if (p === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (p === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
};

const formatDue = (d: any) => {
  if (!d) return 'No date';
  const date = new Date(d);
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Today';
  const isTmr = new Date(now.getTime() + 86400000).toDateString() === date.toDateString();
  if (isTmr) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TaskManagement: React.FC<TaskManagementProps> = ({
  followUps,
  convertedLeads,
  totalLeads,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Convert follow-ups to tasks
  const followUpTasks: Task[] = followUps.map((fu, i) => {
    const dueDate = new Date(fu.followUpDate);
    const isPast = dueDate < now;
    const isToday = dueDate.toDateString() === now.toDateString();
    let priority: Task['priority'] = 'low';
    if (isToday || (isPast && fu.status === 'pending')) priority = 'high';
    else if (!isPast) priority = 'medium';
    let status: TaskStatus = (fu.status as TaskStatus) || 'pending';
    if (fu.status === 'pending' && isPast) status = 'missed';
    return {
      id: `fu-${i}`,
      title: `Follow-up: ${fu.leadName}`,
      agent: fu.agentName,
      dueDate: fu.followUpDate,
      priority,
      status,
      note: fu.note,
    };
  });

  const systemTasks: Task[] = [
    {
      id: 'sys-1',
      title: 'Review Team Performance',
      agent: 'Manager',
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString(),
      priority: 'medium',
      status: 'pending',
    },
    {
      id: 'sys-2',
      title: `Assign Pending Leads (${Math.max(0, totalLeads - convertedLeads)})`,
      agent: 'Manager',
      dueDate: new Date().toISOString(),
      priority: 'high',
      status: convertedLeads > 0 && totalLeads > 0 ? 'completed' : 'pending',
    },
  ];

  const allTasks = [...systemTasks, ...followUpTasks];

  const counts: Record<FilterType, number> = {
    all: allTasks.length,
    pending: allTasks.filter((t) => t.status === 'pending').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
    missed: allTasks.filter((t) => t.status === 'missed').length,
  };

  const filtered = filter === 'all' ? allTasks : allTasks.filter((t) => t.status === filter);

  const getStatusIcon = (status: string) => {
    if (status === 'completed')
      return <FaCheckCircle className="text-green-500 flex-shrink-0" size={13} />;
    if (status === 'missed')
      return <FaExclamationTriangle className="text-red-500 flex-shrink-0" size={12} />;
    return <FaCircle className="text-amber-400 flex-shrink-0" size={11} />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
          <FaTasks className="text-cyan-500" size={13} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Task Management</h2>
          <p className="text-xs text-slate-400">{counts.pending} tasks pending</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
        {(['all', 'pending', 'completed', 'missed'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg capitalize transition-all duration-200 ${
              filter === f
                ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {f}
            <span className="ml-1 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <FaCheckCircle className="text-green-300 dark:text-green-700 mb-2" size={28} />
            <p className="text-sm text-slate-400">All done! 🎉</p>
          </div>
        ) : (
          filtered.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
                task.status === 'completed'
                  ? 'border-green-100 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/10 opacity-70'
                  : task.status === 'missed'
                  ? 'border-red-100 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10'
                  : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20'
              }`}
            >
              <div className="mt-0.5">{getStatusIcon(task.status)}</div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-semibold text-slate-800 dark:text-white truncate ${
                    task.status === 'completed' ? 'line-through opacity-60' : ''
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-slate-400">
                    Agent: {task.agent}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <FaClock size={8} />
                    {formatDue(task.dueDate)}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${getPriorityClass(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
