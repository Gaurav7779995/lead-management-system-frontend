import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, FileText, Phone, Presentation, Target, TrendingUp, Zap } from "lucide-react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import "../../assets/styles/Dashboard.css";
import { getAgentReports } from "../../services/agentService";

const Stat = ({ label, value, icon: Icon, tone }: any) => (
  <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex justify-between"><div><p className="text-xs font-black uppercase text-slate-400">{label}</p><b className="text-3xl text-slate-900 dark:text-white">{value}</b></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span></div>
  </motion.div>
);

const ReportCard = ({ title, subtitle, rows, accent }: any) => (
  <motion.section whileHover={{ y: -3 }} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <h2 className="text-sm font-black text-slate-900 dark:text-white">{title}</h2>
    <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
    <div className="mt-4 space-y-2">
      {(rows || []).length ? rows.slice(0, 6).map((row: any, index: number) => {
        const total = Math.max(...rows.map((x: any) => x.value || 0), 1);
        const pct = Math.round(((row.value || 0) / total) * 100);
        return (
          <div key={`${row.name}-${index}`} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-black text-slate-800 dark:text-white">{row.name}</span>
              <span className="font-black text-blue-600">{row.value || 0}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      }) : <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">No report data available.</div>}
    </div>
  </motion.section>
);

const AgentReportsPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        setError("");
        setData((await getAgentReports()).data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Reports API is not available. Please restart the backend server.");
        setData({
          analytics: { totalCalls: 0, meetingsDone: 0, conversionPercentage: 0, monthlyGrowth: 0, productivityScore: 0 },
          reports: { leadConversion: [], monthlyPerformance: [], followupPerformance: [], taskCompletion: [], leadSource: [] },
          exportRows: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const exportCsv = () => {
    const rows = data?.exportRows || [];
    const headers = Object.keys(rows[0] || { name: "", company: "", source: "", status: "", priority: "" });
    const csv = [headers.join(","), ...rows.map((r: any) => headers.map((h) => `"${String(r[h] || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agent-report-${Date.now()}.csv`;
    a.click();
  };
  const exportExcel = () => exportCsv();
  const makePdf = (lines: string[]) => {
    const esc = (s: string) => String(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const text = lines.slice(0, 36).map((line, i) => `BT /F1 11 Tf 50 ${790 - i * 20} Td (${esc(line)}) Tj ET`).join("\n");
    const stream = `0.1 0.2 0.45 rg\nBT /F1 18 Tf 50 820 Td (HYGO LMS - Agent Performance Report) Tj ET\n0 0 0 rg\n${text}`;
    const objects = [
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
      "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
      `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((obj) => { offsets.push(pdf.length); pdf += `${obj}\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((o) => String(o).padStart(10, "0") + " 00000 n ").join("\n")}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  };
  const exportPdf = () => {
    const a = data?.analytics || {};
    const rows = [
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      `Total Calls: ${a.totalCalls || 0}`,
      `Meetings Done: ${a.meetingsDone || 0}`,
      `Conversion: ${a.conversionPercentage || 0}%`,
      `Monthly Growth: ${a.monthlyGrowth || 0}%`,
      `Productivity Score: ${a.productivityScore || 0}%`,
      "",
      "Lead Export Summary:",
      ...(data?.exportRows || []).slice(0, 25).map((r: any) => `${r.name || "-"} | ${r.company || "-"} | ${r.source || "-"} | ${r.status || "-"}`),
    ];
    const blob = makePdf(rows);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `agent-performance-report-${Date.now()}.pdf`;
    link.click();
  };
  if (loading) return <div className="dashboard agent-dashboard-shell"><Sidebar /><div className="main-content"><Navbar /><main className="dashboard-content agent-dashboard-theme"><div className="rounded-2xl bg-white p-10 text-center">Loading reports...</div></main></div></div>;
  const a = data?.analytics || {};
  const r = data?.reports || {};
  return (
    <div className="dashboard agent-dashboard-shell overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar /><div className="main-content min-w-0 overflow-x-hidden"><Navbar />
        <main className="dashboard-content agent-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-blue-500/20 dark:bg-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.12),transparent_30%)]" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500">Agent Analytics</p><h1 className="text-2xl font-black text-slate-900 dark:text-white">Reports & Performance</h1><p className="text-sm text-slate-500 dark:text-slate-300">Lead conversions, followups, tasks, source insights and productivity reporting.</p></div>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportPdf} className="agent-report-export-btn agent-report-export-btn--pdf flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-black text-red-600 shadow-sm dark:border-red-400 dark:bg-red-600 dark:text-white">
                  <FileText size={15} /> PDF
                </button>
                <button onClick={exportExcel} className="agent-report-export-btn agent-report-export-btn--excel flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm font-black text-green-600 shadow-sm dark:border-emerald-400 dark:bg-emerald-600 dark:text-white">
                  <FileSpreadsheet size={15} /> Excel
                </button>
                <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-black text-white">
                  <Download size={15} /> CSV
                </button>
              </div>
            </div>
          </motion.section>
          {error && (
            <section className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
              {error}
            </section>
          )}
          <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Total Calls" value={a.totalCalls || 0} icon={Phone} tone="bg-blue-50 text-blue-700" />
            <Stat label="Meetings Done" value={a.meetingsDone || 0} icon={Presentation} tone="bg-violet-50 text-violet-700" />
            <Stat label="Conversion" value={`${a.conversionPercentage || 0}%`} icon={Target} tone="bg-green-50 text-green-700" />
            <Stat label="Monthly Growth" value={`${a.monthlyGrowth || 0}%`} icon={TrendingUp} tone="bg-amber-50 text-amber-700" />
            <Stat label="Productivity" value={`${a.productivityScore || 0}%`} icon={Zap} tone="bg-cyan-50 text-cyan-700" />
          </section>
          <section className="grid gap-4 xl:grid-cols-3">
            <ReportCard title="Lead Conversion Report" subtitle="Lead outcomes grouped by status." rows={r.leadConversion || []} accent="bg-blue-600" />
            <ReportCard title="Followup Performance" subtitle="Followup status distribution." rows={r.followupPerformance || []} accent="bg-violet-600" />
            <ReportCard title="Task Completion Report" subtitle="Task progress grouped by status." rows={r.taskCompletion || []} accent="bg-green-600" />
            <ReportCard title="Lead Source Report" subtitle="Where assigned leads are coming from." rows={r.leadSource || []} accent="bg-amber-500" />
            <motion.section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Monthly Performance Report</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Simple month-by-month performance table.</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-950"><tr>{["Month", "Leads", "Converted", "Followups", "Tasks"].map((h) => <th key={h} className="p-3 font-black">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{(r.monthlyPerformance || []).map((m: any) => <tr key={m.month}><td className="p-3 font-black">{m.month}</td><td className="p-3">{m.leads}</td><td className="p-3">{m.converted}</td><td className="p-3">{m.followups}</td><td className="p-3">{m.tasks}</td></tr>)}</tbody>
                </table>
              </div>
            </motion.section>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AgentReportsPage;
