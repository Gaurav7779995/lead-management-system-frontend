import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import {
  addCallLog,
  addMeeting,
} from "../../services/leadService";
import {
  getManagerLeadById,
  updateManagerLead,
  assignManagerLead,
  addManagerLeadNote,
  addManagerLeadFollowUp,
} from "../../services/managerLeadService";
import { TimelineContainer } from "../../components/timeline";
import { mapBackendTimelineToActivities } from "../../components/timeline/timelineMapper";
import axiosInstance from "../../api/axiosInstance";
import { isBeforeToday, todayDateTimeInputValue } from "../../utils/dateValidation";
import {
  FaArrowLeft,
  FaSave,
  FaPhoneAlt,
  FaCalendarAlt,
  FaVideo,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPlus,
  FaClock,
  FaStickyNote,
  FaUserTie,
  FaClipboardCheck,
} from "react-icons/fa";
import { MdOutlineLeaderboard } from "react-icons/md";

/* ══════════════════════════════════════
   ReactQuill toolbar config — matches the image
══════════════════════════════════════ */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    ["link"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};
const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "link",
  "list",
  "bullet",
];

/* ══════════════════ Constants ══════════════════ */
const ALL_STATUSES = [
  {
    value: "new",
    label: "New",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    value: "contacted",
    label: "Contacted",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  {
    value: "interested",
    label: "Interested",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  {
    value: "not_interested",
    label: "Not Interested",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  },
  {
    value: "qualified",
    label: "Qualified",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  {
    value: "proposal_sent",
    label: "Proposal Sent",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  {
    value: "negotiation",
    label: "Negotiation",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
  {
    value: "follow_up",
    label: "Follow Up",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    value: "demo_request",
    label: "Demo Request",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    value: "meeting_schedule",
    label: "Meeting Scheduled",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  },
  {
    value: "no_response",
    label: "No Response",
    color: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  },
  {
    value: "low_priority",
    label: "Low Priority",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  {
    value: "won",
    label: "Won ✓",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    value: "lost",
    label: "Lost",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
];
const getStatusCfg = (v: string) =>
  ALL_STATUSES.find((s) => s.value === v) || {
    label: v,
    color: "bg-slate-100 text-slate-600",
  };

const fmt = (d: any) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const fmtDate = (d: any) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const fmtFollowUpDateTime = (f: any) => {
  const date = f.scheduledDate || f.date;
  if (!date) return "—";

  const dateText = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeText =
    f.scheduledTime ||
    new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return `${dateText}, ${timeText}`;
};

/* ══════════════════ Validation ══════════════════ */
interface FE {
  name?: string;
  email?: string;
  phone?: string;
  contact?: string;
  fu_date?: string;
  mt_title?: string;
  mt_date?: string;
  call_dur?: string;
}

const validateMain = (f: any): FE => {
  const e: FE = {};
  if (!f.name?.trim()) e.name = "Lead name is required.";
  else if (f.name.trim().length < 2)
    e.name = "Name must be at least 2 characters.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Invalid email address.";
  if (f.phone && !/^\+?[\d\s\-(.)]{7,15}$/.test(f.phone.trim()))
    e.phone = "Invalid phone number.";
  if (!f.email?.trim() && !f.phone?.trim())
    e.contact = "At least one of email or phone is required.";
  return e;
};

/* helper: strip HTML tags to check if Quill content is empty */
const isQuillEmpty = (html: string) =>
  !html || html.replace(/<[^>]*>/g, "").trim() === "";

/* helper: render note text — could be HTML (from Quill) or plain text */
const NoteContent = ({ text }: { text: string }) => {
  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isHtml) {
    return (
      <div
        className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed ql-note-display"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
  return (
    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
      {text}
    </p>
  );
};

/* ══════════════════ Sub-components ══════════════════ */
const inputCls =
  "w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200";
const selectCls = inputCls + " cursor-pointer";

const SectionCard = ({
  title,
  icon: Icon,
  iconColor,
  count,
  children,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden"
  >
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}
        >
          <Icon size={14} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          {title}
        </h3>
      </div>
      {count !== undefined && (
        <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
          {count} {count === 1 ? "record" : "records"}
        </span>
      )}
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

const FormRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

const Field = ({ label, required, error, children }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-500 flex items-center gap-1">
        <FaExclamationTriangle size={9} />
        {error}
      </p>
    )}
  </div>
);

const DividerAdd = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
      <FaPlus size={8} /> Add New
    </span>
    <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
  </div>
);

/* ══════════════════ Main Component ══════════════════ */
const ManagerLeadDetailPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = (location.state as any)?.from || "/manager/agents";

  const [leadData, setLeadData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");

  /* ── Agents (for assignedAgent dropdown) ── */
  const [agents, setAgents] = useState<any[]>([]);

  /* ── Main form ── */
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "new",
    source: "manual",
    assignedAgent: "",
  });
  const [formErrors, setFormErrors] = useState<FE>({});

  /* ── Notes section ── */
  const [noteHtml, setNoteHtml] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  /* ── Sub-forms ── */
  const [callForm, setCallForm] = useState({
    callType: "outgoing",
    duration: "",
    status: "connected",
    note: "",
  });
  const [callErrors, setCallErrors] = useState<FE>({});
  const [addingCall, setAddingCall] = useState(false);

  const [fuForm, setFuForm] = useState({ date: "", note: "" });
  const [fuErrors, setFuErrors] = useState<FE>({});
  const [addingFu, setAddingFu] = useState(false);

  const [mtForm, setMtForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const [mtErrors, setMtErrors] = useState<FE>({});
  const [addingMt, setAddingMt] = useState(false);

  /* ── Fetch manager's agents for dropdown ── */
  useEffect(() => {
    axiosInstance
      .get("/manager/agents")
      .then((res) => setAgents(res.data.data || []))
      .catch(() => setAgents([]));
  }, []);

  /* ── Load lead ── */
  const loadLead = async (showLoader = false) => {
    if (!leadId) return;
    try {
      if (showLoader) setPageLoading(true);
      setGlobalError("");
      const data = await getManagerLeadById(leadId);
      setLeadData(data);
      if (showLoader) {
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.status || "new",
          source: data.source || "manual",
          assignedAgent: data.assignedAgent?._id || "",
        });
      }
    } catch {
      setGlobalError("Failed to load lead details.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadLead(true);
  }, [leadId]);

  /* ── Update lead info ── */
  const handleUpdate = async () => {
    const errs = validateMain(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      document
        .getElementById("lead-form-top")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    try {
      setSaving(true);
      setGlobalError("");
      await updateManagerLead(leadId!, {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        status: form.status,
        source: form.source,
      } as any);
      const currentAgentId = leadData?.assignedAgent?._id || "";
      if (form.assignedAgent !== currentAgentId) {
        await assignManagerLead(leadId!, form.assignedAgent);
      }
      await loadLead(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setGlobalError(err?.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Add note (Quill HTML) ── */
  const handleAddNote = async () => {
    if (isQuillEmpty(noteHtml)) {
      setNoteError("Please write a note before adding.");
      return;
    }
    const plainText = noteHtml.replace(/<[^>]*>/g, "").trim();
    if (plainText.length < 3) {
      setNoteError("Note must be at least 3 characters.");
      return;
    }
    try {
      setAddingNote(true);
      setNoteError("");
      await addManagerLeadNote(leadId!, noteHtml);
      setNoteHtml("");
      await loadLead(false);
    } catch (err: any) {
      setNoteError(err?.message || "Failed to add note.");
    } finally {
      setAddingNote(false);
    }
  };

  /* ── Add call log ── */
  const handleAddCall = async () => {
    const duration = Number(callForm.duration || 0);
    if (duration < 0) {
      setCallErrors({ call_dur: "Duration cannot be negative." });
      return;
    }
    try {
      setAddingCall(true);
      await addCallLog(leadId!, { ...callForm, duration });
      setCallForm({
        callType: "outgoing",
        duration: "",
        status: "connected",
        note: "",
      });
      await loadLead(false);
    } catch (err: any) {
      setGlobalError(err?.message || "Failed to add call log.");
    } finally {
      setAddingCall(false);
    }
  };

  /* ── Add follow-up ── */
  const handleAddFu = async () => {
    if (!fuForm.date) {
      setFuErrors({ fu_date: "Date is required." });
      return;
    }
    if (isBeforeToday(fuForm.date)) {
      setFuErrors({ fu_date: "Follow-up date cannot be in the past." });
      return;
    }
    try {
      setAddingFu(true);
      await addManagerLeadFollowUp(leadId!, fuForm);
      setFuForm({ date: "", note: "" });
      await loadLead(false);
    } catch (err: any) {
      setGlobalError(err?.message || "Failed to add follow-up.");
    } finally {
      setAddingFu(false);
    }
  };

  /* ── Add meeting ── */
  const handleAddMt = async () => {
    const e: FE = {};
    if (!mtForm.title?.trim()) e.mt_title = "Meeting title is required.";
    if (!mtForm.date) e.mt_date = "Meeting date & time is required.";
    else if (isBeforeToday(mtForm.date))
      e.mt_date = "Meeting date cannot be in the past.";
    setMtErrors(e);
    if (Object.keys(e).length > 0) return;
    try {
      setAddingMt(true);
      await addMeeting(leadId!, mtForm);
      setMtForm({ title: "", date: "", location: "", description: "" });
      await loadLead(false);
    } catch (err: any) {
      setGlobalError(err?.message || "Failed to add meeting.");
    } finally {
      setAddingMt(false);
    }
  };

  /* ── Loading screen ── */
  if (pageLoading)
    return (
      <div className="dashboard manager-dashboard-shell manager-lead-detail-theme">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="dashboard-content manager-dashboard-theme flex items-center justify-center py-32">
            <FaSpinner className="text-blue-500 animate-spin mr-3" size={28} />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Loading lead details…
            </span>
          </div>
        </div>
      </div>
    );

  const statusCfg = getStatusCfg(form.status);

  return (
    <>
      {/* ── Quill dark-mode + note-display overrides ── */}
      <style>{`
        /* Quill toolbar — light base */
        .ql-toolbar.ql-snow {
          border-radius: 12px 12px 0 0;
          border-color: #e2e8f0;
          background: #f8fafc;
          padding: 8px 12px;
          font-family: inherit;
        }
        .ql-container.ql-snow {
          border-radius: 0 0 12px 12px;
          border-color: #e2e8f0;
          font-family: inherit;
          font-size: 14px;
          min-height: 160px;
        }
        .ql-editor {
          min-height: 160px;
          padding: 12px 14px;
          line-height: 1.6;
          color: #1e293b;
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        /* Dark mode overrides */
        .dark .ql-toolbar.ql-snow {
          background: rgba(51,65,85,0.5);
          border-color: #475569;
        }
        .dark .ql-container.ql-snow {
          border-color: #475569;
          background: rgba(30,41,59,0.8);
        }
        .dark .ql-editor {
          color: #f1f5f9;
        }
        .dark .ql-editor.ql-blank::before {
          color: #64748b;
        }
        .dark .ql-toolbar .ql-stroke { stroke: #94a3b8; }
        .dark .ql-toolbar .ql-fill  { fill:   #94a3b8; }
        .dark .ql-toolbar .ql-picker-label { color: #94a3b8; }
        .dark .ql-toolbar button:hover .ql-stroke,
        .dark .ql-toolbar button:hover .ql-fill { stroke: #f1f5f9; fill: #f1f5f9; }
        .dark .ql-toolbar .ql-picker-options {
          background: #1e293b; border-color: #475569; color: #f1f5f9;
        }
        /* Note-display styles (rendered Quill HTML in notes list) */
        .ql-note-display p   { margin: 0 0 4px; }
        .ql-note-display ul, .ql-note-display ol { padding-left: 18px; margin: 4px 0; }
        .ql-note-display strong { font-weight: 600; }
        .ql-note-display em    { font-style: italic; }
        .ql-note-display u     { text-decoration: underline; }
        .ql-note-display a     { color: #3b82f6; text-decoration: underline; }
        .dark .ql-note-display a { color: #60a5fa; }
      `}</style>

      <div className="dashboard manager-dashboard-shell manager-lead-detail-theme">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="dashboard-content manager-dashboard-theme">
            <div
              className="manager-lead-detail-page space-y-5 pb-10 max-w-5xl mx-auto"
              id="lead-form-top"
            >
              {/* ══ Header ══ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => navigate(backPath)}
                  className="manager-lead-detail-back flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-slate-600 dark:text-slate-100 hover:text-blue-500 dark:hover:text-cyan-200 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-500 flex items-center justify-center text-slate-600 dark:text-white group-hover:bg-blue-50 group-hover:border-blue-200 dark:group-hover:bg-cyan-500/20 dark:group-hover:border-cyan-300/60 transition-all">
                    <FaArrowLeft size={11} />
                  </div>
                  Back
                </button>

                <div className="flex items-center gap-3 flex-1 sm:justify-center">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#17145b] via-[#355f91] to-[#3db0a6] flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <MdOutlineLeaderboard className="text-white" size={18} />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
                      {leadData?.name || "Lead Details"}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Created {fmtDate(leadData?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className={`manager-lead-detail-save flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 ${saving ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 shadow-blue-500/30 active:scale-95"}`}
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" size={13} />
                  ) : (
                    <FaSave size={13} />
                  )}
                  {saving ? "Saving…" : "Update Lead"}
                </button>
              </div>

              {/* ══ Alerts ══ */}
              <AnimatePresence>
                {globalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium"
                  >
                    <FaTimesCircle size={14} />
                    {globalError}
                    <button
                      onClick={() => setGlobalError("")}
                      className="ml-auto"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl text-sm text-green-700 dark:text-green-400 font-medium"
                  >
                    <FaCheckCircle size={14} />
                    Lead updated successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ══ 1. Lead Information ══ */}
              <SectionCard
                title="Lead Information"
                icon={FaUser}
                iconColor="bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400"
              >
                <div className="space-y-4">
                  {formErrors.contact && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium">
                      <FaExclamationTriangle size={11} />
                      {formErrors.contact}
                    </div>
                  )}

                  {/* Row 1: Name + Status */}
                  <FormRow>
                    <Field label="Full Name" required error={formErrors.name}>
                      <input
                        className={`${inputCls} ${formErrors.name ? "border-red-400" : ""}`}
                        placeholder="Enter full name"
                        value={form.name}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, name: e.target.value }));
                          setFormErrors((fe) => ({ ...fe, name: undefined }));
                        }}
                      />
                    </Field>
                    <Field label="Status" required>
                      <select
                        className={selectCls}
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value }))
                        }
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </FormRow>

                  {/* Row 2: Email + Phone */}
                  <FormRow>
                    <Field label="Email Address" error={formErrors.email}>
                      <input
                        type="email"
                        className={`${inputCls} ${formErrors.email ? "border-red-400" : ""}`}
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, email: e.target.value }));
                          setFormErrors((fe) => ({
                            ...fe,
                            email: undefined,
                            contact: undefined,
                          }));
                        }}
                      />
                    </Field>
                    <Field label="Phone Number" error={formErrors.phone}>
                      <input
                        className={`${inputCls} ${formErrors.phone ? "border-red-400" : ""}`}
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, phone: e.target.value }));
                          setFormErrors((fe) => ({
                            ...fe,
                            phone: undefined,
                            contact: undefined,
                          }));
                        }}
                      />
                    </Field>
                  </FormRow>

                  {/* Row 3: Source + Assigned Agent (editable) */}
                  <FormRow>
                    <Field label="Source">
                      <select
                        className={selectCls}
                        value={form.source}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, source: e.target.value }))
                        }
                      >
                        {[
                          "manual",
                          "website",
                          "facebook",
                          "linkedin",
                          "referral",
                          "call",
                          "whatsapp",
                          "other",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Assigned Agent">
                      <div className="relative">
                        <FaUserTie
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                          size={13}
                        />
                        <select
                          className={selectCls + " pl-9"}
                          value={form.assignedAgent}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              assignedAgent: e.target.value,
                            }))
                          }
                        >
                          <option value="">— No Agent Assigned —</option>
                          {agents.map((a: any) => (
                            <option key={a._id} value={a._id}>
                              {a.name}
                              {a.performance?.assignedLeads !== undefined
                                ? ` (${a.performance.assignedLeads} leads)`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Change indicator */}
                      {form.assignedAgent !==
                        (leadData?.assignedAgent?._id || "") && (
                        <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-0.5 flex items-center gap-1">
                          <FaCheckCircle size={8} />
                          Agent change will be saved on Update Lead
                        </p>
                      )}
                    </Field>
                  </FormRow>
                </div>
              </SectionCard>

              {/* ══ 2. Notes (ReactQuill wordpad) ══ */}
              <SectionCard
                title="Notes"
                icon={FaStickyNote}
                iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400"
                count={leadData?.notes?.length ?? 0}
              >
                {/* ── Existing notes list (newest first) ── */}
                {(leadData?.notes?.length ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-4">
                    No notes yet. Add the first note below.
                  </p>
                ) : (
                  <div className="space-y-3 mb-5 max-h-80 overflow-y-auto pr-1">
                    {[...leadData.notes]
                      .reverse()
                      .map((note: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex gap-3 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30"
                        >
                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white text-[10px] font-extrabold">
                              {(note.addedBy?.name || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Meta */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                  {note.addedBy?.name || "Unknown"}
                                </span>
                                {note.addedBy?.role && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 capitalize">
                                    {note.addedBy.role}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                                <FaClock size={9} />
                                <span>{fmt(note.createdAt)}</span>
                              </div>
                            </div>
                            {/* Note body — HTML or plain */}
                            <NoteContent text={note.text} />
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}

                <DividerAdd />

                {/* ── ReactQuill editor (matches the image) ── */}
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                    <ReactQuill
                      theme="snow"
                      value={noteHtml}
                      onChange={(html: string) => {
                        setNoteHtml(html);
                        setNoteError("");
                      }}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder="Write your note here…"
                    />
                  </div>

                  {noteError && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <FaExclamationTriangle size={9} />
                      {noteError}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <FaClock size={9} />
                      Note will be saved with current timestamp
                    </p>
                    <button
                      onClick={handleAddNote}
                      disabled={addingNote || isQuillEmpty(noteHtml)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {addingNote ? (
                        <FaSpinner className="animate-spin" size={11} />
                      ) : (
                        <FaPlus size={11} />
                      )}
                      Add Note
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* ══ 3. Call Logs ══ */}
              <SectionCard
                title="Call Logs"
                icon={FaPhoneAlt}
                iconColor="bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400"
                count={leadData?.callLogs?.length ?? 0}
              >
                {(leadData?.callLogs?.length ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">
                    No call logs yet.
                  </p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {leadData.callLogs.map((log: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <FaPhoneAlt
                            className="text-green-500 dark:text-green-400"
                            size={12}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">
                              {log.callType}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${log.status === "connected" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}
                            >
                              {log.status?.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {log.duration}s
                            </span>
                          </div>
                          {log.note && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {log.note}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {fmt(log.calledAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <DividerAdd />
                <div className="space-y-3">
                  <FormRow>
                    <Field label="Call Type">
                      <div className="relative">
                        <FaPhoneAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-300" size={13} />
                      <select
                        className={selectCls + " pl-9"}
                        value={callForm.callType}
                        onChange={(e) =>
                          setCallForm((c) => ({
                            ...c,
                            callType: e.target.value,
                          }))
                        }
                      >
                          <option value="outgoing">Outgoing</option>
                          <option value="incoming">Incoming</option>
                      </select>
                      </div>
                    </Field>
                    <Field label="Result">
                      <div className="relative">
                        <FaClipboardCheck className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-300" size={13} />
                      <select
                        className={selectCls + " pl-9"}
                        value={callForm.status}
                        onChange={(e) =>
                          setCallForm((c) => ({ ...c, status: e.target.value }))
                        }
                      >
                          <option value="connected">Connected</option>
                          <option value="not_connected">Not Connected</option>
                          <option value="busy">Busy</option>
                          <option value="no_answer">No Answer</option>
                      </select>
                      </div>
                    </Field>
                  </FormRow>
                  <FormRow>
                    <Field
                      label="Duration (seconds)"
                      error={callErrors.call_dur}
                    >
                      <input
                        type="number"
                        min={0}
                        className={`${inputCls} ${callErrors.call_dur ? "border-red-400" : ""}`}
                        value={callForm.duration}
                        onChange={(e) => {
                          setCallForm((c) => ({
                            ...c,
                            duration: e.target.value,
                          }));
                          setCallErrors({});
                        }}
                      />
                    </Field>
                    <Field label="Note">
                      <input
                        className={inputCls}
                        placeholder="Brief call note…"
                        value={callForm.note}
                        onChange={(e) =>
                          setCallForm((c) => ({ ...c, note: e.target.value }))
                        }
                      />
                    </Field>
                  </FormRow>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddCall}
                      disabled={addingCall}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {addingCall ? (
                        <FaSpinner className="animate-spin" size={11} />
                      ) : (
                        <FaPlus size={11} />
                      )}{" "}
                      Add Call Log
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* ══ 4. Follow-ups ══ */}
              <SectionCard
                title="Follow-ups"
                icon={FaCalendarAlt}
                iconColor="bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400"
                count={leadData?.followUps?.length ?? 0}
              >
                {(leadData?.followUps?.length ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">
                    No follow-ups scheduled yet.
                  </p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {leadData.followUps.map((f: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <FaClock
                            className="text-orange-500 dark:text-orange-400"
                            size={12}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {fmtFollowUpDateTime(f)}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${f.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : f.status === "missed" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                            >
                              {f.status}
                            </span>
                          </div>
                          {f.note && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {f.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <DividerAdd />
                <div className="space-y-3">
                  <FormRow>
                    <Field
                      label="Follow-up Date & Time"
                      required
                      error={fuErrors.fu_date}
                    >
                      <input
                        type="datetime-local"
                        min={todayDateTimeInputValue()}
                        className={`${inputCls} ${fuErrors.fu_date ? "border-red-400" : ""}`}
                        value={fuForm.date}
                        onChange={(e) => {
                          setFuForm((f) => ({ ...f, date: e.target.value }));
                          setFuErrors({});
                        }}
                      />
                    </Field>
                    <Field label="Note">
                      <input
                        className={inputCls}
                        placeholder="What to discuss…"
                        value={fuForm.note}
                        onChange={(e) =>
                          setFuForm((f) => ({ ...f, note: e.target.value }))
                        }
                      />
                    </Field>
                  </FormRow>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddFu}
                      disabled={addingFu}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {addingFu ? (
                        <FaSpinner className="animate-spin" size={11} />
                      ) : (
                        <FaPlus size={11} />
                      )}{" "}
                      Schedule Follow-up
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* ══ 5. Meetings ══ */}
              <SectionCard
                title="Meetings"
                icon={FaVideo}
                iconColor="bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-400"
                count={leadData?.meetings?.length ?? 0}
              >
                {(leadData?.meetings?.length ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">
                    No meetings scheduled yet.
                  </p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {leadData.meetings.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                          <FaVideo
                            className="text-violet-500 dark:text-violet-400"
                            size={12}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {m.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : m.status === "cancelled" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"}`}
                            >
                              {m.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {fmt(m.date)}
                            {m.location && ` · 📍 ${m.location}`}
                          </p>
                          {m.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <DividerAdd />
                <div className="space-y-3">
                  <FormRow>
                    <Field
                      label="Meeting Title"
                      required
                      error={mtErrors.mt_title}
                    >
                      <input
                        className={`${inputCls} ${mtErrors.mt_title ? "border-red-400" : ""}`}
                        placeholder="e.g. Product Demo"
                        value={mtForm.title}
                        onChange={(e) => {
                          setMtForm((m) => ({ ...m, title: e.target.value }));
                          setMtErrors({});
                        }}
                      />
                    </Field>
                    <Field
                      label="Date & Time"
                      required
                      error={mtErrors.mt_date}
                    >
                      <input
                        type="datetime-local"
                        min={todayDateTimeInputValue()}
                        className={`${inputCls} ${mtErrors.mt_date ? "border-red-400" : ""}`}
                        value={mtForm.date}
                        onChange={(e) => {
                          setMtForm((m) => ({ ...m, date: e.target.value }));
                          setMtErrors({});
                        }}
                      />
                    </Field>
                  </FormRow>
                  <FormRow>
                    <Field label="Location">
                      <input
                        className={inputCls}
                        placeholder="Office / Google Meet / Zoom…"
                        value={mtForm.location}
                        onChange={(e) =>
                          setMtForm((m) => ({ ...m, location: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <input
                        className={inputCls}
                        placeholder="What will be discussed…"
                        value={mtForm.description}
                        onChange={(e) =>
                          setMtForm((m) => ({
                            ...m,
                            description: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </FormRow>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddMt}
                      disabled={addingMt}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {addingMt ? (
                        <FaSpinner className="animate-spin" size={11} />
                      ) : (
                        <FaPlus size={11} />
                      )}{" "}
                      Schedule Meeting
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* ══ Sticky Update Button ══ */}
              <div className="sticky bottom-4 z-20 flex justify-center pointer-events-none">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleUpdate}
                  disabled={saving}
                  className={`manager-lead-detail-save pointer-events-auto flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-extrabold text-white shadow-2xl transition-all duration-200 ${saving ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-violet-600 shadow-blue-500/40"}`}
                >
                  {saving ? (
                    <FaSpinner className="animate-spin" size={14} />
                  ) : (
                    <FaSave size={14} />
                  )}
                  {saving ? "Saving…" : "Update Lead"}
                </motion.button>
              </div>

              {/* ══ 6. Activity Timeline ══ */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-6"
              >
                <TimelineContainer
                  activities={mapBackendTimelineToActivities(
                    leadData?.timeline,
                  )}
                  title="Lead Activity Timeline"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerLeadDetailPage;
