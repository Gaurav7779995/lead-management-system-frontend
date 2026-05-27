import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaPhoneAlt,
  FaSpinner,
  FaUserTie,
} from "react-icons/fa";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import {
  ManagerFollowUp,
  addManagerFollowUpNote,
  getManagerFollowUpById,
} from "../../services/managerFollowUpService";

const fmt = (date?: string) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not set";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="manager-followup-detail-section rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-200">
      {title}
    </h2>
    {children}
  </div>
);

const ManagerFollowUpDetailsPage = () => {
  const { followUpId } = useParams<{ followUpId: string }>();
  const navigate = useNavigate();
  const [followUp, setFollowUp] = useState<ManagerFollowUp | any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const loadDetails = () => {
    if (!followUpId) return;
    setLoading(true);
    getManagerFollowUpById(followUpId)
      .then((res) => setFollowUp(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDetails();
  }, [followUpId]);

  const submitNote = async () => {
    if (!followUpId || !note.trim()) return;
    setSavingNote(true);
    await addManagerFollowUpNote(followUpId, note.trim());
    setNote("");
    await loadDetails();
    setSavingNote(false);
  };

  return (
    <div className="dashboard manager-dashboard-shell manager-followup-detail-theme overflow-x-hidden">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <div className="dashboard-content manager-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-500">
              <FaSpinner className="mr-3 animate-spin text-blue-600" /> Loading follow-up details...
            </div>
          ) : (
            <div className="manager-followup-detail-page mx-auto max-w-5xl space-y-5 pb-10">
              <button
                onClick={() => navigate("/manager/followups")}
                className="manager-followup-detail-back flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm"
              >
                <FaArrowLeft size={12} /> Back to Follow-Ups
              </button>

              <div className="manager-followup-detail-hero rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white shadow-lg">
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Follow-Up Profile
                </p>
                <h1 className="mt-2 text-2xl font-extrabold">
                  {followUp?.lead?.name || "Lead"}
                </h1>
                <p className="mt-2 text-sm text-white/80">
                  {followUp?.followUpType?.replace(/_/g, " ")} scheduled for {fmt(followUp?.scheduledDate)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Section title="Basic Information">
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-100">
                    <p className="flex items-center gap-2"><FaUserTie /> Lead: {followUp?.lead?.name || "-"}</p>
                    <p className="flex items-center gap-2"><FaPhoneAlt /> Phone: {followUp?.lead?.phone || "-"}</p>
                    <p className="flex items-center gap-2"><FaEnvelope /> Email: {followUp?.lead?.email || "-"}</p>
                    <p>Company: {followUp?.lead?.company || "-"}</p>
                    <p>Agent: {followUp?.assignedTo?.name || "Unassigned"}</p>
                  </div>
                </Section>

                <Section title="Follow-Up Information">
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-100">
                    <p className="flex items-center gap-2"><FaCalendarAlt /> Date: {fmt(followUp?.scheduledDate)}</p>
                    <p className="flex items-center gap-2"><FaClock /> Time: {followUp?.scheduledTime || "Not set"}</p>
                    <p>Status: {followUp?.status}</p>
                    <p>Priority: {followUp?.priority}</p>
                    <p className="flex items-center gap-2"><FaBell /> Reminder: {followUp?.reminderTime ? fmt(followUp.reminderTime) : "Not set"}</p>
                    <p>Outcome: {followUp?.outcome || "-"}</p>
                  </div>
                </Section>
              </div>

              <Section title="Notes And Internal Comments">
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="Add internal comment, rich text content, or communication note"
                    />
                    <button
                      disabled={!note.trim() || savingNote}
                      onClick={submitNote}
                      className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {savingNote ? "Saving..." : "Add Note"}
                    </button>
                  </div>
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-100">
                    {followUp?.notes || "No main notes yet."}
                  </p>
                  {(followUp?.notesThread || []).map((note: any) => (
                    <div key={note._id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-100">{note.text}</p>
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-300">
                        {note.addedBy?.name || "User"} · {fmt(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="History And Activity Logs">
                <div className="space-y-4">
                  {(followUp?.activity || []).map((item: any) => (
                    <div key={item._id} className="relative pl-7">
                      <span className="absolute left-0 top-1 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{item.message}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                        {item.addedBy?.name || "System"} · {fmt(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerFollowUpDetailsPage;

