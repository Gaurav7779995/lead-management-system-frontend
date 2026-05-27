import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaPhoneAlt,
  FaSearch,
  FaSpinner,
  FaTasks,
  FaUserTie,
  FaVideo,
} from "react-icons/fa";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import { getManagerFollowUpCenter, ManagerFollowUp } from "../../services/managerFollowUpService";

const typeIcon: Record<string, any> = {
  call: FaPhoneAlt,
  whatsapp: FaPhoneAlt,
  email: FaTasks,
  meeting: FaCalendarAlt,
  video_call: FaVideo,
  demo: FaVideo,
  site_visit: FaUserTie,
  consultation: FaClock,
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fmtMonth = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const fmtTime = (item: ManagerFollowUp) =>
  item.scheduledTime ||
  new Date(item.scheduledDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const ManagerCalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });
  const [followUps, setFollowUps] = useState<ManagerFollowUp[]>([]);
  const [selectedDate, setSelectedDate] = useState(getDateKey(new Date()));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        setLoading(true);
        const monthStart = new Date(currentMonth);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const res = await getManagerFollowUpCenter({
          limit: 500,
          dateFilter: "custom",
          startDate: getDateKey(monthStart),
          endDate: getDateKey(monthEnd),
        });
        setFollowUps(res.data?.followUps || []);
      } finally {
        setLoading(false);
      }
    };
    loadCalendar();
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const first = new Date(currentMonth);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = getDateKey(date);
      const items = followUps.filter((item) => getDateKey(new Date(item.scheduledDate)) === key);
      return {
        date,
        key,
        items,
        inMonth: date.getMonth() === currentMonth.getMonth(),
        today: key === getDateKey(new Date()),
      };
    });
  }, [currentMonth, followUps]);

  const selectedItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return followUps
      .filter((item) => getDateKey(new Date(item.scheduledDate)) === selectedDate)
      .filter((item) => {
        if (!query) return true;
        return [item.lead?.name, item.lead?.phone, item.assignedTo?.name, item.followUpType, item.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => fmtTime(a).localeCompare(fmtTime(b)));
  }, [followUps, selectedDate, search]);

  const moveMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + direction);
      return next;
    });
  };

  return (
    <div className="dashboard manager-dashboard-shell manager-calendar-theme">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="dashboard-content manager-dashboard-theme">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="manager-calendar-page space-y-3"
          >
            <div className="manager-calendar-header flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#17145b] via-[#355f91] to-[#3db0a6] text-white shadow-lg">
                  <FaCalendarAlt size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Manager Schedule</p>
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Calendar</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => moveMonth(-1)} className="manager-calendar-icon-btn">
                  <FaChevronLeft size={12} />
                </button>
                <div className="min-w-[170px] text-center text-sm font-semibold text-slate-800 dark:text-white">
                  {fmtMonth(currentMonth)}
                </div>
                <button onClick={() => moveMonth(1)} className="manager-calendar-icon-btn">
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
              <section className="manager-calendar-panel">
                <div className="grid grid-cols-7 border-b border-slate-100 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-3">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calendarDays.map((day) => (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDate(day.key)}
                      className={[
                        "manager-calendar-day",
                        !day.inMonth ? "is-muted" : "",
                        day.today ? "is-today" : "",
                        selectedDate === day.key ? "is-selected" : "",
                      ].join(" ")}
                    >
                      <span>{day.date.getDate()}</span>
                      <div className="mt-1 space-y-1">
                        {day.items.slice(0, 2).map((item) => (
                          <p key={item._id} className="manager-calendar-followup-chip truncate rounded-md bg-blue-50 px-2 py-1 text-left text-[11px] font-normal text-blue-700">
                            {fmtTime(item)} {item.lead?.name || "Lead"}
                          </p>
                        ))}
                        {day.items.length > 2 && (
                          <p className="text-left text-[11px] font-semibold text-slate-400">+{day.items.length - 2} more</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <aside className="manager-calendar-panel p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Selected Day</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h2>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {selectedItems.length} items
                  </span>
                </div>

                <div className="relative mt-3">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search this day"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none"
                  />
                </div>

                <div className="manager-calendar-agenda mt-3 space-y-2">
                  {loading && (
                    <div className="py-10 text-center text-sm text-slate-500">
                      <FaSpinner className="mx-auto mb-2 animate-spin" /> Loading calendar...
                    </div>
                  )}
                  {!loading && selectedItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-500">
                      No follow-ups scheduled for this day.
                    </div>
                  )}
                  {!loading && selectedItems.map((item) => {
                    const Icon = typeIcon[item.followUpType] || FaTasks;
                    return (
                      <div key={item._id} className="manager-calendar-event">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {item.lead?.name || "Lead"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {fmtTime(item)} | {item.assignedTo?.name || "Unassigned"} | {item.status}
                          </p>
                          {item.nextAction && <p className="mt-1 text-xs text-slate-500">{item.nextAction}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCalendarPage;
