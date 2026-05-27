import React from 'react';
import { ActivityType } from './types';

interface ActivityBadgeProps {
  type: ActivityType;
  status?: string;
}

const typeLabelMap: Record<ActivityType, string> = {
  lead_created: 'Lead Created',
  lead_assigned: 'Assigned',
  call_completed: 'Call',
  followup_scheduled: 'Follow-up',
  email_sent: 'Email',
  meeting_done: 'Meeting',
  status_changed: 'Status',
  payment_received: 'Payment',
  lead_closed: 'Closed',
  note_added: 'Note',
  file_uploaded: 'File',
};

const badgeColorMap: Record<ActivityType, string> = {
  lead_created: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  lead_assigned: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  call_completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  followup_scheduled: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  email_sent: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  meeting_done: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  status_changed: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  payment_received: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  lead_closed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  note_added: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800',
  file_uploaded: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
};

const ActivityBadge: React.FC<ActivityBadgeProps> = ({ type, status }) => {
  const label = status || typeLabelMap[type] || 'Activity';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColorMap[type]}`}
    >
      {label}
    </span>
  );
};

export default ActivityBadge;
