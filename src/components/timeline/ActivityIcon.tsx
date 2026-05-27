import React from 'react';
import {
  UserPlus,
  Phone,
  CalendarClock,
  Mail,
  CalendarCheck,
  RefreshCw,
  CreditCard,
  XCircle,
  ClipboardList,
  UserCheck,
  FileText,
  StickyNote,
} from 'lucide-react';
import { ActivityType } from './types';

interface ActivityIconProps {
  type: ActivityType;
  size?: number;
}

const iconMap: Record<ActivityType, React.ElementType> = {
  lead_created: UserPlus,
  lead_assigned: UserCheck,
  call_completed: Phone,
  followup_scheduled: CalendarClock,
  email_sent: Mail,
  meeting_done: CalendarCheck,
  status_changed: RefreshCw,
  payment_received: CreditCard,
  lead_closed: XCircle,
  note_added: StickyNote,
  file_uploaded: FileText,
};

const colorMap: Record<ActivityType, string> = {
  lead_created: 'bg-blue-500 text-white',
  lead_assigned: 'bg-violet-500 text-white',
  call_completed: 'bg-emerald-500 text-white',
  followup_scheduled: 'bg-amber-500 text-white',
  email_sent: 'bg-indigo-500 text-white',
  meeting_done: 'bg-pink-500 text-white',
  status_changed: 'bg-cyan-500 text-white',
  payment_received: 'bg-green-500 text-white',
  lead_closed: 'bg-red-500 text-white',
  note_added: 'bg-slate-500 text-white',
  file_uploaded: 'bg-teal-500 text-white',
};

const ActivityIcon: React.FC<ActivityIconProps> = ({ type, size = 18 }) => {
  const Icon = iconMap[type] || ClipboardList;
  return (
    <div
      className={`flex items-center justify-center rounded-full shadow-sm ${colorMap[type]} w-9 h-9 sm:w-10 sm:h-10`}
    >
      <Icon size={size} strokeWidth={2} />
    </div>
  );
};

export default ActivityIcon;
