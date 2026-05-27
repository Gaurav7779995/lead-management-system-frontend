import { useState, useMemo } from 'react';
import type { ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { MdLeaderboard } from 'react-icons/md';

const SearchIcon = FaSearch as ElementType;
const ChevronLeftIcon = FaChevronLeft as ElementType;
const ChevronRightIcon = FaChevronRight as ElementType;
const LeaderboardIcon = MdLeaderboard as ElementType;

interface Lead {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  source: string;
  status: string;
  assignedAgent?: { name: string; email: string };
  createdAt: string;
}

interface RecentLeadsTableProps {
  leads: Lead[];
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  contacted: { label: 'Contacted', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  interested: { label: 'Interested', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  follow_up: { label: 'Follow Up', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  won: { label: 'Won ✓', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  qualified: { label: 'Qualified', cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  lost: { label: 'Lost', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  not_interested: { label: 'Not Interested', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  proposal_sent: { label: 'Proposal Sent', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  negotiation: { label: 'Negotiation', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  no_response: { label: 'No Response', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
  meeting_schedule: { label: 'Meeting Scheduled', cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  demo_request: { label: 'Demo Request', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  low_priority: { label: 'Low Priority', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const SOURCE_ICONS: Record<string, string> = {
  facebook: '🔵',
  instagram: '📸',
  website: '🌐',
  whatsapp: '💬',
  referral: '👥',
  google: '🔍',
  linkedin: '💼',
  manual: '✍️',
  call: '📞',
  other: '📋',
};

const PAGE_SIZE = 8;

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };

const formatDate = (d: string) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const RecentLeadsTable: React.FC<RecentLeadsTableProps> = ({ leads }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);

  const allStatuses = useMemo(() => {
    const s = new Set(leads.map((l) => l.status));
    return ['all', ...Array.from(s)];
  }, [leads]);

  const allSources = useMemo(() => {
    const s = new Set(leads.map((l) => l.source));
    return ['all', ...Array.from(s)];
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search) ||
        l.assignedAgent?.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchSource = sourceFilter === 'all' || l.source === sourceFilter;
      return matchSearch && matchStatus && matchSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <LeaderboardIcon className="text-blue-500" size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Recent Leads</h2>
            <p className="text-xs text-slate-400">{filtered.length} leads found</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl w-full sm:w-44 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Status' : getStatusConfig(s).label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            {allSources.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Sources' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60">
              {['Lead Name', 'Phone', 'Source', 'Status', 'Agent', 'Date'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            <AnimatePresence>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <LeaderboardIcon
                      className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
                      size={32}
                    />
                    <p className="text-sm text-slate-400">No leads found</p>
                  </td>
                </tr>
              ) : (
                paginated.map((lead, i) => {
                  const sc = getStatusConfig(lead.status);
                  return (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">
                              {lead.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">
                              {lead.name}
                            </p>
                            {lead.email && (
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {lead.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {lead.phone || '—'}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{SOURCE_ICONS[lead.source] || '📋'}</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                            {lead.source}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${sc.cls}`}
                        >
                          {sc.label}
                        </span>
                      </td>

                      {/* Agent */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {lead.assignedAgent?.name || '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xs text-slate-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon size={10} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  p === page
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRightIcon size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentLeadsTable;
