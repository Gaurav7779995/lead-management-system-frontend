import React from 'react';
import { Calendar } from 'lucide-react';

interface TimelineDateHeaderProps {
  label: string;
}

const TimelineDateHeader: React.FC<TimelineDateHeaderProps> = ({ label }) => {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-center py-3">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
        <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
};

export default TimelineDateHeader;
