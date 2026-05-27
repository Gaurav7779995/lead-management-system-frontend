import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlignLeft, Bold, CalendarPlus, ChevronLeft, ChevronRight, Download, Eye, FileSpreadsheet, FileText, FileUp, Italic, List, ListOrdered, MessageSquare, PhoneCall, Search, SlidersHorizontal, Sparkles, Underline, X } from "lucide-react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import "../../assets/styles/Dashboard.css";
import {
  addAgentCallSummary,
  addAgentLeadDocument,
  addAgentLeadNote,
  getAgentLeadExport,
  getAgentLeadDetails,
  getAgentLeads,
  scheduleAgentLeadFollowup,
  updateAgentLeadStatus,
} from "../../services/agentService";
import { todayDateTimeInputValue } from "../../utils/dateValidation";

const statusOptions = ["all", "new", "contacted", "interested", "qualified", "follow_up", "converted", "lost", "not_interested"];
const priorityOptions = ["all", "high", "medium", "low"];
const sourceOptions = ["all", "manual", "website", "facebook", "linkedin", "referral", "call", "whatsapp", "other"];
const sortOptions = [
  ["assignedDate", "Assigned Date"],
  ["nextFollowUpDate", "Next Followup"],
  ["name", "Lead Name"],
  ["company", "Company"],
  ["status", "Status"],
  ["priority", "Priority"],
];

const title = (value?: string) => String(value || "-").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const dt = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const statusTone = (value?: string) => ["converted", "won"].includes(String(value)) ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" : ["lost", "not_interested"].includes(String(value)) ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : String(value) === "interested" ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
const leadStatusSurface = (value?: string) => {
  const status = String(value || "");
  if (["converted", "won"].includes(status)) return "bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35";
  if (["lost", "not_interested"].includes(status)) return "bg-red-50/80 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-950/35";
  if (status === "interested") return "bg-violet-50/80 hover:bg-violet-100/80 dark:bg-violet-950/20 dark:hover:bg-violet-950/35";
  if (["qualified", "proposal_sent", "negotiation"].includes(status)) return "bg-cyan-50/80 hover:bg-cyan-100/80 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/35";
  if (["follow_up", "demo_request", "meeting_schedule"].includes(status)) return "bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/35";
  if (["contacted", "no_response"].includes(status)) return "bg-sky-50/80 hover:bg-sky-100/80 dark:bg-sky-950/20 dark:hover:bg-sky-950/35";
  return "bg-white hover:bg-blue-50/50 dark:bg-slate-900 dark:hover:bg-blue-950/20";
};
const priorityTone = (value?: string) => value === "high" ? "agent-priority-badge agent-priority-high bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200" : value === "low" ? "agent-priority-badge agent-priority-low bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100" : "agent-priority-badge agent-priority-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";

const fieldClass = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const apiBaseUrl = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const documentUrl = (url?: string) => !url ? "#" : url.startsWith("http") ? url : `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;

const exportColumns = [
  ["name", "Lead Name"],
  ["company", "Company"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["source", "Source"],
  ["status", "Status"],
  ["priority", "Priority"],
  ["interestedService", "Service"],
  ["assignedDate", "Assigned Date"],
  ["nextFollowUpDate", "Next Followup"],
];

const cleanCell = (value: any) => String(value ?? "-").replace(/<[^>]*>/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const exportFileName = (label: string, ext: string) => `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "leads"}-${new Date().toISOString().slice(0, 10)}.${ext}`;
const exportRows = (leads: any[]) => leads.map((lead) => ({
  ...lead,
  source: title(lead.source),
  status: title(lead.status),
  priority: title(lead.priority),
  assignedDate: dt(lead.assignedDate || lead.createdAt),
  nextFollowUpDate: dt(lead.nextFollowUpDate),
}));

const downloadExcel = (leads: any[], label: string) => {
  const rows = exportRows(leads);
  const table = `<table><thead><tr>${exportColumns.map(([, heading]) => `<th>${heading}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${exportColumns.map(([key]) => `<td>${cleanCell(row[key])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const blob = new Blob([`\ufeff${table}`], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName(label, "xls");
  link.click();
  URL.revokeObjectURL(url);
};

const downloadPdf = (leads: any[], label: string) => {
  const rows = exportRows(leads);
  const printable = window.open("", "_blank", "width=1100,height=800");
  if (!printable) return;
  printable.document.write(`
    <html>
      <head>
        <title>${cleanCell(label)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
          h1 { margin: 0 0 16px; font-size: 22px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 7px; text-align: left; vertical-align: top; }
          th { background: #e2e8f0; }
        </style>
      </head>
      <body>
        <h1>${cleanCell(label)}</h1>
        <table><thead><tr>${exportColumns.map(([, heading]) => `<th>${heading}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${exportColumns.map(([key]) => `<td>${cleanCell(row[key])}</td>`).join("")}</tr>`).join("")}</tbody></table>
      </body>
    </html>
  `);
  printable.document.close();
  printable.focus();
  printable.print();
};

const ActionModal = ({ type, lead, onClose, onDone }: any) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<any>({});
  const [noteLead, setNoteLead] = useState<any>(lead);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (["note", "document"].includes(type)) {
      setNoteLead(lead);
      getAgentLeadDetails(lead._id).then((response) => setNoteLead(response.data || lead)).catch(() => setNoteLead(lead));
    }
  }, [type, lead]);
  useLayoutEffect(() => {
    if (type === "note" && noteRef.current) noteRef.current.innerHTML = form.text || "";
  }, [type]);
  const formatNote = (command: string, value?: string) => {
    noteRef.current?.focus();
    document.execCommand(command, false, value);
    setForm({ text: noteRef.current?.innerHTML || "" });
  };
  const submit = async () => {
    setSaving(true);
    try {
      if (type === "note") await addAgentLeadNote(lead._id, form.text || "");
      if (type === "followup") await scheduleAgentLeadFollowup(lead._id, form);
      if (type === "call") await addAgentCallSummary(lead._id, form);
      if (type === "document") {
        const data = new FormData();
        data.append("document", form.document);
        data.append("fileName", form.fileName || form.document?.name || "Document");
        await addAgentLeadDocument(lead._id, data);
      }
      onDone();
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const heading = type === "note" ? "Add Note" : type === "followup" ? "Schedule Followup" : type === "call" ? "Add Call Summary" : "Upload Document";
  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/50 p-3 sm:p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className={`w-full overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 ${type === "note" ? "max-w-4xl" : "max-w-lg p-5"}`}>
        <div className={`${type === "note" ? "border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950" : "mb-4"} flex items-center justify-between`}>
          <div>
            {type === "note" && <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-300">Lead Note Document</p>}
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{heading}</h3>
            {type === "note" && <p className="text-xs font-semibold text-slate-500">{lead.name} {lead.company ? `- ${lead.company}` : ""}</p>}
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        {type === "note" && (
          <div className="grid gap-3 bg-slate-100 p-3 dark:bg-slate-950 lg:grid-cols-[1fr_280px]">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                {[
                  ["bold", "Bold", Bold],
                  ["italic", "Italic", Italic],
                  ["underline", "Underline", Underline],
                  ["justifyLeft", "Align Left", AlignLeft],
                  ["insertUnorderedList", "Bullets", List],
                  ["insertOrderedList", "Numbering", ListOrdered],
                ].map(([command, label, Icon]: any) => (
                  <button
                    key={command}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={() => formatNote(command)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-950/40"
                  >
                    <Icon size={15} />
                  </button>
                ))}
                <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <select className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white" onChange={(e) => formatNote("fontSize", e.target.value)} defaultValue="">
                  <option value="" disabled>Size</option>
                  <option value="2">Small</option>
                  <option value="3">Normal</option>
                  <option value="4">Large</option>
                </select>
              </div>
              <div className="bg-slate-200/70 p-3 dark:bg-slate-950">
                <div className="mx-auto min-h-[170px] max-w-2xl bg-white px-5 py-4 shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <div
                    ref={noteRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-[140px] text-sm leading-6 text-slate-900 outline-none empty:before:text-slate-400 empty:before:content-['Write_lead_note_here...'] dark:text-white"
                    onInput={(e) => setForm({ text: (e.currentTarget as HTMLDivElement).innerHTML })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                <span>Document editor</span>
                <span>{String(form.text || "").replace(/<[^>]+>/g, "").length} chars</span>
              </div>
            </div>
            <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Old Notes</h4>
              <div className="mt-2 max-h-[260px] space-y-2 overflow-y-auto pr-1">
                {(noteLead?.notes || []).length ? (noteLead.notes || []).map((note: any, index: number) => (
                  <div key={note._id || index} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                    <div className="break-words text-slate-700 dark:text-slate-200 [&_b]:font-black [&_strong]:font-black [&_em]:italic [&_i]:italic [&_li]:ml-4 [&_li]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_u]:underline [&_ul]:ml-4 [&_ul]:list-disc" dangerouslySetInnerHTML={{ __html: note.text || "-" }} />
                    <p className="mt-1 text-[10px] font-bold text-slate-400">{dt(note.createdAt)}</p>
                  </div>
                )) : <p className="rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-500 dark:bg-slate-950">No old notes yet.</p>}
              </div>
            </aside>
          </div>
        )}
        {type === "followup" && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
            <div className="mb-3 rounded-xl bg-blue-600 px-4 py-3 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">Next Touchpoint</p>
              <h4 className="text-lg font-black">{lead.name}</h4>
              <p className="text-xs font-semibold text-blue-100">{lead.company || "No company"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[11px] font-black uppercase tracking-wide text-blue-600 dark:text-cyan-300">Date & Time<input type="datetime-local" min={todayDateTimeInputValue()} className={`${fieldClass} mt-1`} onChange={(e) => setForm({ ...form, scheduledDate: new Date(e.target.value).toISOString() })} /></label>
              <label className="text-[11px] font-black uppercase tracking-wide text-blue-600 dark:text-cyan-300">Followup Type<select className={`${fieldClass} mt-1`} onChange={(e) => setForm({ ...form, followUpType: e.target.value })}>{["call", "whatsapp", "email", "meeting", "demo", "other"].map((x) => <option key={x} value={x}>{title(x)}</option>)}</select></label>
              <label className="text-[11px] font-black uppercase tracking-wide text-blue-600 dark:text-cyan-300 sm:col-span-2">Notes / Next Action<textarea className="mt-1 min-h-[110px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="Write followup notes and next action..." onChange={(e) => setForm({ ...form, notes: e.target.value, nextAction: e.target.value })} /></label>
            </div>
          </div>
        )}
        {type === "call" && <div className="grid gap-3"><select className={fieldClass} onChange={(e) => setForm({ ...form, callType: e.target.value })}><option value="outgoing">Outgoing</option><option value="incoming">Incoming</option></select><select className={fieldClass} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["connected", "not_connected", "busy", "no_answer"].map((x) => <option key={x} value={x}>{title(x)}</option>)}</select><input className={fieldClass} type="number" placeholder="Duration in seconds" onChange={(e) => setForm({ ...form, duration: e.target.value })} /><textarea className="min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Call summary" onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>}
        {type === "document" && (
          <div className="grid gap-3">
            <input className={fieldClass} placeholder="Document name" value={form.fileName || ""} onChange={(e) => setForm({ ...form, fileName: e.target.value })} />
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-blue-500/30 dark:bg-blue-950/20">
              <FileUp className="mb-2 text-blue-600 dark:text-blue-300" size={26} />
              <span className="text-sm font-black text-slate-900 dark:text-white">{form.document?.name || "Upload document"}</span>
              <span className="mt-1 text-xs font-semibold text-slate-500">Choose any document from this system</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm({ ...form, document: file, fileName: form.fileName || file.name });
                }}
              />
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Uploaded Documents</h4>
              <div className="mt-2 max-h-[180px] space-y-2 overflow-y-auto pr-1">
                {(noteLead?.attachments || []).length ? (noteLead.attachments || []).map((doc: any, index: number) => (
                  <a key={doc._id || index} href={documentUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg bg-white p-2 text-xs font-semibold text-slate-700 shadow-sm hover:text-blue-600 dark:bg-slate-900 dark:text-slate-200">
                    <FileText className="mt-0.5 shrink-0 text-blue-600" size={14} />
                    <span className="min-w-0"><span className="block break-words">{doc.fileName || "Document"}</span><span className="text-[10px] text-slate-400">{dt(doc.uploadedAt || doc.createdAt)}</span></span>
                  </a>
                )) : <p className="rounded-lg bg-white p-3 text-xs font-semibold text-slate-500 dark:bg-slate-900">No documents uploaded yet.</p>}
              </div>
            </div>
          </div>
        )}
        <div className={`${type === "note" ? "border-t border-slate-200 px-4 py-3 dark:border-slate-800" : "mt-4"} flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`}><button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button><button disabled={saving || (type === "document" && !form.document)} onClick={submit} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button></div>
      </motion.div>
    </div>
  );
};

const DetailsDrawer = ({ lead, onClose, onRefresh }: any) => (
  <div className="fixed inset-0 z-[1250] flex justify-end bg-slate-950/40">
    <motion.aside initial={{ x: 520 }} animate={{ x: 0 }} className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-blue-500">Lead Details</p><h2 className="text-2xl font-black text-slate-900 dark:text-white">{lead.name}</h2><p className="text-sm text-slate-500">{lead.company || "No company"}</p></div><button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button></div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["interested", "converted", "lost"].map((s) => <button key={s} onClick={async () => { await updateAgentLeadStatus(lead._id, s); onRefresh(); }} className={`rounded-full px-3 py-1.5 text-xs font-black ${statusTone(s)}`}>Mark {title(s)}</button>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2">{[["Phone", lead.phone], ["Email", lead.email], ["Source", title(lead.source)], ["Status", title(lead.status)], ["Priority", title(lead.priority)], ["Assigned Date", dt(lead.assignedDate)], ["Next Followup", dt(lead.nextFollowUpDate)], ["Service", lead.interestedService]].map(([k, v]) => <div key={k} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{k}</p><p className="mt-1 break-words text-sm font-bold text-slate-900 dark:text-white">{v || "-"}</p></div>)}</div>
      {[
        ["Activity History", lead.timeline || []],
        ["Notes Timeline", lead.notes || []],
        ["Followup History", lead.followupHistory || lead.followUps || []],
        ["Uploaded Documents", lead.attachments || []],
        ["Communication Logs", lead.callLogs || []],
      ].map(([heading, items]: any) => <section key={heading} className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="mb-3 font-black text-slate-900 dark:text-white">{heading}</h3>{items.length ? <div className="space-y-3">{items.map((item: any, i: number) => <div key={item._id || i} className="border-l-2 border-blue-200 pl-3 text-sm"><b>{item.fileUrl ? <a href={documentUrl(item.fileUrl)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{item.fileName || "Open Document"}</a> : item.message || item.text || item.note || item.fileName || title(item.followUpType || item.status || item.type)}</b><p className="text-xs text-slate-500">{item.notes || item.nextAction || (!item.fileUrl ? item.fileUrl : "") || item.outcome || ""}</p><p className="text-[11px] text-slate-400">{dt(item.createdAt || item.date || item.scheduledDate || item.calledAt || item.uploadedAt)}</p></div>)}</div> : <p className="text-sm text-slate-500">No records yet.</p>}</section>)}
    </motion.aside>
  </div>
);

const AgentLeadsPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<any>({ search: "", status: "all", priority: "all", source: "all", date: "", sortBy: "assignedDate", sortOrder: "desc", page: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [modal, setModal] = useState<any>(null);

  const load = async (patch: any = {}) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    setLoading(true);
    try {
      const response = await getAgentLeads(next);
      setLeads(response.data?.leads || []);
      setPagination(response.data?.pagination || pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const openDetails = async (leadId: string) => setDetails((await getAgentLeadDetails(leadId)).data);
  const refreshDetails = async () => details?._id && setDetails((await getAgentLeadDetails(details._id)).data);
  const reset = () => load({ search: "", status: "all", priority: "all", source: "all", date: "", sortBy: "assignedDate", sortOrder: "desc", page: 1 });
  const exportAll = async (format: "pdf" | "excel") => {
    setExporting(true);
    try {
      const response = await getAgentLeadExport(filters);
      const allLeads = response.data?.leads || [];
      if (format === "pdf") downloadPdf(allLeads, "All Assigned Leads");
      else downloadExcel(allLeads, "All Assigned Leads");
    } finally {
      setExporting(false);
    }
  };
  const exportLead = (lead: any, format: "pdf" | "excel") => {
    const label = `${lead.name || "Lead"} Lead Data`;
    if (format === "pdf") downloadPdf([lead], label);
    else downloadExcel([lead], label);
  };
  const rows = useMemo(() => leads, [leads]);

  return (
    <div className="dashboard agent-dashboard-shell overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <main className="dashboard-content agent-dashboard-theme agent-leads-theme min-w-0 max-w-full overflow-x-hidden">
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 dark:border-blue-500/20 dark:bg-slate-900 dark:shadow-blue-500/10">
            <div className="relative overflow-hidden p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.20),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(34,197,94,0.14),transparent_28%)]" />
              <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <motion.div animate={{ rotate: [0, 4, 0], scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
                    <Sparkles size={19} />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500 dark:text-cyan-300">Agent Lead Workspace</p>
                    <h1 className="mt-0.5 bg-gradient-to-r from-slate-950 to-slate-600 bg-clip-text text-2xl font-black tracking-tight text-transparent dark:from-white dark:to-slate-300">My Assigned Leads</h1>
                    <p className="mt-1 max-w-2xl text-sm font-medium leading-5 text-slate-500 dark:text-slate-300">Search, filter, update status, schedule followups, and maintain every interaction.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 xl:w-[360px]">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-2.5 dark:border-blue-500/20 dark:bg-blue-950/30"><p className="text-[10px] font-black uppercase tracking-wide text-blue-600">Total</p><b className="text-xl text-slate-950 dark:text-white">{pagination.total}</b></div>
                  <div className="rounded-xl border border-violet-100 bg-violet-50/80 p-2.5 dark:border-violet-500/20 dark:bg-violet-950/30"><p className="text-[10px] font-black uppercase tracking-wide text-violet-600">Showing</p><b className="text-xl text-slate-950 dark:text-white">{rows.length}</b></div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-2.5 dark:border-emerald-500/20 dark:bg-emerald-950/30"><p className="text-[10px] font-black uppercase tracking-wide text-emerald-600">Page</p><b className="text-xl text-slate-950 dark:text-white">{pagination.page}/{pagination.totalPages}</b></div>
                </div>
              </div>
            </div>
          </motion.section>
          <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(5,1fr)_110px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input className={`${fieldClass} pl-9`} placeholder="Search name, company, phone, email" value={filters.search} onChange={(e) => load({ search: e.target.value, page: 1 })} /></div><select className={fieldClass} value={filters.status} onChange={(e) => load({ status: e.target.value, page: 1 })}>{statusOptions.map((x) => <option key={x} value={x}>{title(x)}</option>)}</select><select className={fieldClass} value={filters.priority} onChange={(e) => load({ priority: e.target.value, page: 1 })}>{priorityOptions.map((x) => <option key={x} value={x}>{title(x)}</option>)}</select><select className={fieldClass} value={filters.source} onChange={(e) => load({ source: e.target.value, page: 1 })}>{sourceOptions.map((x) => <option key={x} value={x}>{title(x)}</option>)}</select><input type="date" className={fieldClass} value={filters.date} onChange={(e) => load({ date: e.target.value, page: 1 })} /><select className={fieldClass} value={filters.sortBy} onChange={(e) => load({ sortBy: e.target.value })}>{sortOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><button onClick={reset} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-black dark:border-slate-700"><SlidersHorizontal size={15} />Reset</button></div>
          </section>
          <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white"><Download size={16} /> Download Leads Data</div>
            <div className="flex flex-wrap gap-2">
              <button disabled={exporting} onClick={() => exportAll("pdf")} className="flex h-10 items-center gap-2 rounded-xl bg-red-50 px-3 text-sm font-black text-red-700 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-300"><FileText size={15} />All PDF</button>
              <button disabled={exporting} onClick={() => exportAll("excel")} className="flex h-10 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-sm font-black text-emerald-700 disabled:opacity-50 dark:bg-emerald-950/30 dark:text-emerald-300"><FileSpreadsheet size={15} />All Excel</button>
            </div>
          </section>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="hidden lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-950">
                  <tr>
                    <th className="w-[13%] p-3 font-black">Lead</th>
                    <th className="w-[14%] p-3 font-black">Contact</th>
                    <th className="w-[9%] p-3 font-black">Source</th>
                    <th className="w-[12%] p-3 font-black">Status</th>
                    <th className="w-[9%] p-3 font-black">Priority</th>
                    <th className="w-[13%] p-3 font-black">Followups</th>
                    <th className="w-[9%] p-3 font-black">Assigned</th>
                    <th className="w-[20%] p-3 text-center font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan={8} className="p-10 text-center text-slate-500">Loading leads...</td></tr>
                  ) : rows.length ? rows.map((lead) => (
                    <tr key={lead._id} className={`align-top transition-colors ${leadStatusSurface(lead.status)}`}>
                      <td className="p-3"><p className="break-words font-black leading-5 text-slate-900 dark:text-white">{lead.name}</p><p className="mt-1 break-words text-xs font-semibold text-slate-500">{lead.company || "No company"}</p></td>
                      <td className="p-3"><p className="break-words text-xs font-bold text-slate-700 dark:text-slate-200">{lead.phone || "-"}</p><p className="mt-1 break-all text-xs text-slate-500">{lead.email || "-"}</p></td>
                      <td className="break-words p-3 text-xs font-bold">{title(lead.source)}</td>
                      <td className="p-3"><select value={lead.status} onChange={async (e) => { await updateAgentLeadStatus(lead._id, e.target.value); load(); }} className={`max-w-full rounded-full px-2 py-1 text-xs font-black outline-none ${statusTone(lead.status)}`}>{statusOptions.filter((x) => x !== "all").map((s) => <option key={s} value={s}>{title(s)}</option>)}</select></td>
                      <td className="p-3"><span className={`inline-flex max-w-full rounded-full px-2 py-1 text-xs font-black ${priorityTone(lead.priority)}`}>{title(lead.priority)}</span></td>
                      <td className="p-3 text-xs"><p><b>Last:</b> {dt((lead.followUps || []).slice(-1)[0]?.date)}</p><p className="mt-1"><b>Next:</b> {dt(lead.nextFollowUpDate)}</p></td>
                      <td className="p-3 text-xs font-semibold">{dt(lead.assignedDate || lead.createdAt)}</td>
                      <td className="p-3"><div className="flex flex-wrap items-center justify-center gap-1"><button title="View Details" onClick={() => openDetails(lead._id)} className="agent-lead-action flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-blue-600"><Eye size={14} /></button><button title="Add Notes" onClick={() => setModal({ type: "note", lead })} className="agent-lead-action flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-700 dark:text-white"><MessageSquare size={14} /></button><button title="Schedule Followup" onClick={() => setModal({ type: "followup", lead })} className="agent-lead-action flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-amber-600"><CalendarPlus size={14} /></button><button title="Upload Documents" onClick={() => setModal({ type: "document", lead })} className="agent-lead-action flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-violet-600"><FileUp size={14} /></button><button title="Add Call Summary" onClick={() => setModal({ type: "call", lead })} className="agent-lead-action flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-green-600"><PhoneCall size={14} /></button><button title="Download Lead PDF" onClick={() => exportLead(lead, "pdf")} className="agent-lead-action flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600"><FileText size={14} /></button><button title="Download Lead Excel" onClick={() => exportLead(lead, "excel")} className="agent-lead-action flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-600"><FileSpreadsheet size={14} /></button></div></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="p-10 text-center text-slate-500">No assigned leads found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-3 lg:hidden">
              {loading ? <div className="p-8 text-center text-slate-500">Loading leads...</div> : rows.length ? rows.map((lead) => (
                <div key={lead._id} className={`rounded-2xl border border-slate-200 p-4 shadow-sm transition-colors dark:border-slate-700 ${leadStatusSurface(lead.status)}`}>
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900 dark:text-white">{lead.name}</h3><p className="text-xs font-semibold text-slate-500">{lead.company || "No company"}</p></div><span className={`rounded-full px-2 py-1 text-xs font-black ${priorityTone(lead.priority)}`}>{title(lead.priority)}</span></div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><p><b>Phone:</b> {lead.phone || "-"}</p><p className="break-all"><b>Email:</b> {lead.email || "-"}</p><p><b>Source:</b> {title(lead.source)}</p><p><b>Assigned:</b> {dt(lead.assignedDate || lead.createdAt)}</p><p><b>Last:</b> {dt((lead.followUps || []).slice(-1)[0]?.date)}</p><p><b>Next:</b> {dt(lead.nextFollowUpDate)}</p></div>
                  <div className="mt-3 flex items-center justify-between gap-3"><select value={lead.status} onChange={async (e) => { await updateAgentLeadStatus(lead._id, e.target.value); load(); }} className={`rounded-full px-2 py-1 text-xs font-black outline-none ${statusTone(lead.status)}`}>{statusOptions.filter((x) => x !== "all").map((s) => <option key={s} value={s}>{title(s)}</option>)}</select><div className="flex flex-wrap justify-end gap-1"><button onClick={() => openDetails(lead._id)} className="agent-lead-action rounded-lg p-2 text-blue-600"><Eye size={14} /></button><button onClick={() => setModal({ type: "note", lead })} className="agent-lead-action rounded-lg p-2 text-slate-700 dark:text-white"><MessageSquare size={14} /></button><button onClick={() => setModal({ type: "followup", lead })} className="agent-lead-action rounded-lg p-2 text-amber-600"><CalendarPlus size={14} /></button><button onClick={() => setModal({ type: "document", lead })} className="agent-lead-action rounded-lg p-2 text-violet-600"><FileUp size={14} /></button><button onClick={() => setModal({ type: "call", lead })} className="agent-lead-action rounded-lg p-2 text-green-600"><PhoneCall size={14} /></button><button onClick={() => exportLead(lead, "pdf")} className="agent-lead-action rounded-lg p-2 text-red-600"><FileText size={14} /></button><button onClick={() => exportLead(lead, "excel")} className="agent-lead-action rounded-lg p-2 text-emerald-600"><FileSpreadsheet size={14} /></button></div></div>
                </div>
              )) : <div className="p-8 text-center text-slate-500">No assigned leads found.</div>}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 p-3 text-sm dark:border-slate-800"><span>Showing {rows.length} of {pagination.total}</span><div className="flex items-center gap-2"><button disabled={pagination.page <= 1} onClick={() => load({ page: pagination.page - 1 })} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={15} /></button><b>Page {pagination.page} / {pagination.totalPages}</b><button disabled={pagination.page >= pagination.totalPages} onClick={() => load({ page: pagination.page + 1 })} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={15} /></button></div></div>
          </section>
        </main>
      </div>
      <AnimatePresence>{details && <DetailsDrawer lead={details} onClose={() => setDetails(null)} onRefresh={refreshDetails} />}{modal && <ActionModal type={modal.type} lead={modal.lead} onClose={() => setModal(null)} onDone={() => { load(); refreshDetails(); }} />}</AnimatePresence>
    </div>
  );
};

export default AgentLeadsPage;
