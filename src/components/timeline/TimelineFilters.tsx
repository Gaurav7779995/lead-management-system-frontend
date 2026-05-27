import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ActivityType } from './types';

const activityTypes: { value: ActivityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Activities' },
  { value: 'lead_created', label: 'Lead Created' },
  { value: 'lead_assigned', label: 'Assigned' },
  { value: 'call_completed', label: 'Call' },
  { value: 'followup_scheduled', label: 'Follow-up' },
  { value: 'email_sent', label: 'Email' },
  { value: 'meeting_done', label: 'Meeting' },
  { value: 'status_changed', label: 'Status' },
  { value: 'payment_received', label: 'Payment' },
  { value: 'lead_closed', label: 'Closed' },
];

interface TimelineFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: ActivityType | 'all';
  onTypeChange: (value: ActivityType | 'all') => void;
}

const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg
            text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
            transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter dropdown */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500 dark:text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as ActivityType | 'all')}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg
              text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
              cursor-pointer transition-all"
          >
            {activityTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineFilters;
