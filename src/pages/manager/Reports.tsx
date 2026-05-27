import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaCalendarAlt,
  FaChevronDown,
  FaEnvelope,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaPrint,
  FaRedo,
  FaSave,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import {
  createScheduledReport,
  downloadManagerReport,
  getManagerReports,
  ReportFilters,
} from "../../services/managerReportService";

const tabs = [
  ["leads", "Lead Reports"],
  ["agents", "Agent Performance"],
  ["followups", "Followup Reports"],
  ["revenue", "Revenue Reports"],
  ["sources", "Lead Sources"],
  ["time", "Time-Based"],
  ["activity", "Activity"],
  ["scheduled", "Scheduled"],
];

const colors = ["#2563eb", "#0f766e", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#db2777"];
const Icon = ({ as: Component, className, size }: { as: any; className?: string; size?: number }) => (
  <Component className={className} size={size} />
);

const fmtDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const fmtMoney = (value?: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const asTitle = (value?: string) =>
  String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const hiddenColumnKeys = new Set(["id", "leadId", "agentId"]);
const primaryColumns: Record<string, string[]> = {
  leads: ["leadName", "companyName", "phone", "email", "assignedAgent", "leadSource", "leadStatus", "priority"],
  agents: ["agentName", "totalLeadsAssigned", "activeLeads", "convertedLeads", "conversionRate", "revenueGenerated", "performanceRating"],
  followups: ["leadName", "assignedAgent", "followupDate", "followupType", "followupStatus", "completionStatus", "overdue"],
  revenue: ["leadName", "clientName", "assignedAgent", "revenueAmount", "paymentStatus", "conversionDate", "source"],
  sources: ["source", "totalLeads", "convertedLeads", "conversionRate", "revenueGenerated", "costPerLead"],
  activity: ["userName", "role", "activityType", "module", "description", "dateTime"],
  scheduled: ["reportType", "dateRange", "exportFormat", "frequency", "recipients", "isActive"],
};

const MetricCard = ({ label, value, accent }: { label: string; value: string | number; accent: string }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition dark:border-slate-700 dark:bg-slate-900"
  >
    <div className={`mb-3 h-1.5 w-14 rounded-full ${accent}`} />
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 break-words text-xl font-extrabold text-slate-900 dark:text-white">{value}</p>
  </motion.div>
);

const MultiSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) => (
  <label className="min-w-0">
    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
    <select
      multiple
      value={value ? value.split(",") : []}
      onChange={(event) => onChange(Array.from(event.target.selectedOptions).map((item) => item.value).join(","))}
      className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
    >
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  </label>
);

const DataTable = ({ rows, type }: { rows: any[]; type: string }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const columns = useMemo(() => {
    const available = Object.keys(rows[0] || {}).filter((key) => !hiddenColumnKeys.has(key));
    const preferred = (primaryColumns[type] || available).filter((key) => available.includes(key));
    return preferred.length ? preferred : available.slice(0, 7);
  }, [rows, type]);

  const detailEntries = (row: any) =>
    Object.entries(row).filter(([key]) => !hiddenColumnKeys.has(key));

  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === "") return "-";
    if (key.toLowerCase().includes("date")) return fmtDate(String(value));
    if (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("amount")) return fmtMoney(Number(value));
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ") || "-";
    if (typeof value === "object") return Object.values(value as Record<string, any>).filter(Boolean).join(", ") || "-";
    return String(value);
  };

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        No report records found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="max-h-[560px] overflow-y-auto overflow-x-hidden">
        <table className="w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-950">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-3 font-bold">{asTitle(column)}</th>
              ))}
              <th className="w-24 px-3 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, index) => {
              const rowId = row.id || row.leadId || row.agentId || String(index);
              return (
                <>
                  <tr key={rowId} className="transition hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                    {columns.map((column) => (
                      <td key={column} className="px-3 py-3 align-top text-sm text-slate-600 dark:text-slate-300">
                        <span className="block max-w-full break-words leading-5">
                          {renderValue(column, row[column])}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-3 align-top">
                      <button onClick={() => setExpanded(expanded === rowId ? null : rowId)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        Details
                      </button>
                    </td>
                  </tr>
                  {expanded === rowId && (
                    <tr>
                      <td colSpan={columns.length + 1} className="bg-slate-50 px-4 py-4 dark:bg-slate-950">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {detailEntries(row).map(([key, value]) => (
                            <div key={key} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{asTitle(key)}</p>
                              <p className="mt-1 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {renderValue(key, value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Reports = () => {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openFilters, setOpenFilters] = useState(true);
  const [activeTab, setActiveTab] = useState("leads");
  const [toast, setToast] = useState("");
  const [schedule, setSchedule] = useState({
    reportType: "lead",
    dateRange: "last30",
    exportFormat: "pdf",
    recipients: "",
    frequency: "weekly",
  });

  const loadReports = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const res = await getManagerReports(nextFilters);
      setData(res.data);
    } catch (error) {
      setToast("Reports data could not be loaded. Please check the backend server and login session.");
      setData((prev: any) => prev || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const patchFilter = (key: keyof ReportFilters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    loadReports(next);
  };

  const resetFilters = () => {
    setFilters({});
    loadReports({});
  };

  const savePreset = () => {
    localStorage.setItem("managerReportFilterPreset", JSON.stringify(filters));
    setToast("Filter preset saved");
  };

  const exportReport = async (format: string) => {
    const type = activeTab === "time" ? "leads" : activeTab === "scheduled" ? "leads" : activeTab;
    try {
      await downloadManagerReport(type, format, filters);
      setToast(`${format.toUpperCase()} report downloaded`);
    } catch (error) {
      setToast("Export failed. Please login again or try another report.");
    }
  };

  const emailReport = async () => {
    setActiveTab("scheduled");
    setToast("Add recipients in Scheduled Reports to send reports by email.");
  };

  const createSchedule = async () => {
    await createScheduledReport({
      ...schedule,
      recipients: schedule.recipients.split(",").map((item) => item.trim()).filter(Boolean),
    });
    setToast("Scheduled report created");
    loadReports();
  };

  const meta = data?.filtersMeta || {};
  const tableKey = activeTab === "time" ? "leads" : activeTab;
  const activeRows = data?.tables?.[tableKey] || [];

  return (
    <div className="dashboard manager-dashboard-shell manager-reports-theme overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <main className="dashboard-content manager-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          <div className="manager-reports-page max-w-full space-y-5 pb-10">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid gap-0 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="bg-slate-950 p-5 text-white sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Manager Reports</p>
                  <h1 className="mt-2 text-2xl font-extrabold tracking-normal sm:text-3xl">CRM Reporting Command Center</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Advanced lead, agent, followup, revenue, source, time, and activity reports powered by live MongoDB records.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 dark:bg-slate-800">
                  <MetricCard label="Total Leads" value={data?.kpis?.totalLeads || 0} accent="bg-blue-600" />
                  <MetricCard label="Converted" value={data?.kpis?.convertedLeads || 0} accent="bg-green-600" />
                  <MetricCard label="Revenue" value={fmtMoney(data?.kpis?.totalRevenue)} accent="bg-teal-600" />
                  <MetricCard label="Conversion" value={`${data?.kpis?.conversionRate || 0}%`} accent="bg-amber-500" />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <button onClick={() => setOpenFilters(!openFilters)} className="flex w-full items-center justify-between gap-3 text-left">
                <span className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
                  <Icon as={FaFilter} className="text-blue-600" /> Advanced Filter Section
                </span>
                <Icon as={FaChevronDown} className={`transition ${openFilters ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openFilters && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <label><span className="mb-1 block text-[11px] font-bold uppercase text-slate-400">Start Date</span><input type="date" value={filters.startDate || ""} onChange={(e) => patchFilter("startDate", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                      <label><span className="mb-1 block text-[11px] font-bold uppercase text-slate-400">End Date</span><input type="date" value={filters.endDate || ""} onChange={(e) => patchFilter("endDate", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                      <MultiSelect label="Select Agent" value={filters.agent} onChange={(value) => patchFilter("agent", value)} options={(meta.agents || []).map((a: any) => ({ value: a._id, label: a.name }))} />
                      <MultiSelect label="Lead Status" value={filters.status} onChange={(value) => patchFilter("status", value)} options={(meta.statuses || []).map((x: string) => ({ value: x, label: asTitle(x) }))} />
                      <MultiSelect label="Lead Source" value={filters.source} onChange={(value) => patchFilter("source", value)} options={(meta.sources || []).map((x: string) => ({ value: x, label: asTitle(x) }))} />
                      <MultiSelect label="Priority" value={filters.priority} onChange={(value) => patchFilter("priority", value)} options={(meta.priorities || []).map((x: string) => ({ value: x, label: asTitle(x) }))} />
                      <MultiSelect label="Region / City" value={filters.region} onChange={(value) => patchFilter("region", value)} options={(meta.regions || []).map((x: string) => ({ value: x, label: x }))} />
                      <MultiSelect label="Industry" value={filters.industry} onChange={(value) => patchFilter("industry", value)} options={(meta.industries || []).map((x: string) => ({ value: x, label: x }))} />
                      <select value={filters.converted || ""} onChange={(e) => patchFilter("converted", e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Converted / Non-converted</option><option value="converted">Converted</option><option value="non_converted">Non-converted</option></select>
                      <select value={filters.followupStatus || ""} onChange={(e) => patchFilter("followupStatus", e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Followup Status</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="missed">Missed</option></select>
                      <input value={filters.revenueMin || ""} onChange={(e) => patchFilter("revenueMin", e.target.value)} placeholder="Revenue min" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      <input value={filters.revenueMax || ""} onChange={(e) => patchFilter("revenueMax", e.target.value)} placeholder="Revenue max" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      <div className="relative"><Icon as={FaSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} /><input value={filters.leadName || ""} onChange={(e) => patchFilter("leadName", e.target.value)} placeholder="Search lead name" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div>
                      <div className="relative"><Icon as={FaSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} /><input value={filters.companyName || ""} onChange={(e) => patchFilter("companyName", e.target.value)} placeholder="Search company name" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => loadReports()} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Apply Filter</button>
                      <button onClick={resetFilters} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"><Icon as={FaRedo} size={12} /> Reset</button>
                      <button onClick={savePreset} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"><Icon as={FaSave} size={12} /> Save Preset</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Export Center</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => exportReport("pdf")} className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><Icon as={FaFilePdf} /> Export PDF</button>
                  <button onClick={() => exportReport("excel")} className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700"><Icon as={FaFileExcel} /> Export Excel</button>
                  <button onClick={() => exportReport("csv")} className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><Icon as={FaFileCsv} /> Export CSV</button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><Icon as={FaPrint} /> Print Report</button>
                  <button onClick={emailReport} className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"><Icon as={FaEnvelope} /> Email Report</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabs.map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${activeTab === key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                <Icon as={FaSpinner} className="mx-auto mb-3 animate-spin text-blue-600" /> Loading live MongoDB report data...
              </div>
            ) : activeTab === "scheduled" ? (
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><Icon as={FaCalendarAlt} className="text-blue-600" /> Schedule Report</h2>
                  <div className="space-y-3">
                    {["reportType", "dateRange", "exportFormat", "frequency"].map((key) => (
                      <select key={key} value={(schedule as any)[key]} onChange={(e) => setSchedule((prev) => ({ ...prev, [key]: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                        {key === "reportType" && ["lead", "agent", "followup", "revenue", "source", "activity"].map((x) => <option key={x} value={x}>{asTitle(x)} Report</option>)}
                        {key === "dateRange" && ["today", "last7", "last30", "monthly", "quarterly", "yearly"].map((x) => <option key={x} value={x}>{asTitle(x)}</option>)}
                        {key === "exportFormat" && ["pdf", "excel", "csv"].map((x) => <option key={x} value={x}>{x.toUpperCase()}</option>)}
                        {key === "frequency" && ["daily", "weekly", "monthly"].map((x) => <option key={x} value={x}>{asTitle(x)}</option>)}
                      </select>
                    ))}
                    <input value={schedule.recipients} onChange={(e) => setSchedule((prev) => ({ ...prev, recipients: e.target.value }))} placeholder="Email recipients, comma separated" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                    <button onClick={createSchedule} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white">Create Scheduled Delivery</button>
                  </div>
                </div>
                <DataTable rows={data?.schedules || []} type="scheduled" />
              </section>
            ) : (
              <>
                {activeTab === "agents" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">Agent-wise Conversion and Revenue</h2>
                    <ResponsiveContainer width="100%" height={260}><BarChart data={data?.charts?.agentReports || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="agentName" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="convertedLeads" fill="#2563eb" /><Bar dataKey="revenueGenerated" fill="#16a34a" /></BarChart></ResponsiveContainer>
                  </div>
                )}
                {activeTab === "followups" && (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {(data?.charts?.followupStatus || []).map((item: any, i: number) => <MetricCard key={item.name} label={item.name} value={item.value} accent={["bg-amber-500", "bg-green-600", "bg-red-600"][i]} />)}
                  </div>
                )}
                {activeTab === "sources" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">Source Performance</h2>
                    <ResponsiveContainer width="100%" height={260}><BarChart data={data?.charts?.sourceReports || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="source" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="totalLeads" fill="#2563eb" /><Bar dataKey="convertedLeads" fill="#16a34a" /><Bar dataKey="revenueGenerated" fill="#f59e0b" /></BarChart></ResponsiveContainer>
                  </div>
                )}
                <DataTable rows={activeRows} type={tableKey} />
              </>
            )}

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-2">
                <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">Time-Based Reports</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={data?.charts?.monthly || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="converted" stroke="#16a34a" strokeWidth={3} />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-4 text-sm font-extrabold text-slate-900 dark:text-white">Lead Status Mix</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={data?.charts?.leadsByStatus || []} dataKey="value" nameKey="name" innerRadius={46} outerRadius={78}>
                      {(data?.charts?.leadsByStatus || []).map((_: any, index: number) => <Cell key={index} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </main>
      </div>
      {toast && (
        <button onClick={() => setToast("")} className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl">
          <Icon as={FaBell} className="text-cyan-300" /> {toast}
        </button>
      )}
    </div>
  );
};

export default Reports;
