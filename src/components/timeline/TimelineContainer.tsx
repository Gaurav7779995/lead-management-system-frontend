import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import { ActivityType, TimelineActivity, TimelineDateGroup } from './types';
import TimelineItem from './TimelineItem';
import TimelineDateHeader from './TimelineDateHeader';
import TimelineFilters from './TimelineFilters';

interface TimelineContainerProps {
  activities: TimelineActivity[];
  title?: string;
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(activities: TimelineActivity[]): TimelineDateGroup[] {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const groups: Record<string, TimelineActivity[]> = {};
  sorted.forEach((act) => {
    const label = getDateLabel(act.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(act);
  });

  return Object.entries(groups).map(([dateLabel, activities]) => ({
    dateLabel,
    activities,
  }));
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  activities,
  title = 'Lead Timeline',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesType = selectedType === 'all' || act.type === selectedType;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.userName.toLowerCase().includes(q) ||
        (act.notes && act.notes.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [activities, selectedType, searchQuery]);

  const grouped = useMemo(() => groupByDate(filteredActivities), [filteredActivities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} tracked
          </p>
        </div>
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedType('all');
          }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-blue-600
            bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700
            rounded-md transition-colors"
          title="Reset filters"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      {/* Filters */}
      <TimelineFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Timeline content */}
      <div className="relative">
        {/* Empty state */}
        {filteredActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Activity size={24} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">No activities found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Try adjusting your search or filters to see more results.
            </p>
          </motion.div>
        )}

        {/* Grouped timeline */}
        {grouped.map((group) => (
          <div key={group.dateLabel} className="mb-2">
            <TimelineDateHeader label={group.dateLabel} />
            <div className="pt-2">
              {group.activities.map((activity, idx) => (
                <TimelineItem key={activity.id} activity={activity} index={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TimelineContainer;
