import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../DashboardSidebar/Sidebar";
import Navbar from "../DashboardNavbar/Navbar";

import { getLeadById, updateLead, addCallLog, addFollowUp, addMeeting } from "../../services/leadService";
import { getManagers, getAgents } from "../../api/user.api";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { TimelineContainer } from "../../components/timeline";
import { mapBackendTimelineToActivities } from "../../components/timeline/timelineMapper";
import "../../assets/styles/Leads.css";
import "../../assets/styles/Dashboard.css";
import { isBeforeToday, todayDateTimeInputValue } from "../../utils/dateValidation";

const getRefId = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || value.$oid || "";
  return "";
};

const getNotesHtml = (lead: any) => {
  if (Array.isArray(lead?.notes) && lead.notes.length > 0) {
    return lead.notes
      .map((note: any) => note?.text || note)
      .filter(Boolean)
      .join("<br/><br/>");
  }

  return lead?.note || lead?.description || lead?.followUpNotes || "";
};

const mergeLeadDetails = (primary: any = {}, fallback: any = {}) => ({
  ...fallback,
  ...primary,
  name: primary?.name || fallback?.name || "",
  email: primary?.email || fallback?.email || "",
  phone: primary?.phone || fallback?.phone || "",
  status: primary?.status || fallback?.status || "new",
  assignedManager: primary?.assignedManager || fallback?.assignedManager || "",
  assignedAgent: primary?.assignedAgent || fallback?.assignedAgent || "",
  notes: primary?.notes?.length ? primary.notes : fallback?.notes || [],
  note: getNotesHtml(primary) || getNotesHtml(fallback),
});

const LeadDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackLead = (location.state as { lead?: any } | null)?.lead;

  const durationOptions = (count: number) =>
    Array.from({ length: count }, (_, index) => (
      <option key={index} value={index}>
        {String(index).padStart(2, "0")}
      </option>
    ));

  const formatDuration = (duration = 0) => {
    const totalSeconds = Number(duration) || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  };

  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    status: "new",
    assignedManager: "",
    assignedAgent: "",
    note: "",
  });

  const [managers, setManagers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [leadData, setLeadData] = useState<any>(null);

  // New entry forms (pending until Update is clicked)
  const [callForm, setCallForm] = useState({ callType: "outgoing", duration: 0, status: "connected", note: "" });
  const [followupForm, setFollowupForm] = useState({ date: "", note: "" });
  const [meetingForm, setMeetingForm] = useState({ title: "", date: "", location: "", description: "" });
  const durationMinutes = Math.floor((callForm.duration || 0) / 60);
  const durationSeconds = (callForm.duration || 0) % 60;

  const setCallDuration = (minutes: number, seconds: number) => {
    setCallForm((prev) => ({
      ...prev,
      duration: minutes * 60 + seconds,
    }));
  };

  // ================= FETCH LEAD =================
  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;

      try {
        const data = mergeLeadDetails(await getLeadById(id), fallbackLead);
        if (!data?._id && !data?.id && !fallbackLead) {
          setError("Lead details not found");
          return;
        }
        setLeadData(data);

        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.status || "new",
          assignedManager: getRefId(data.assignedManager),
          assignedAgent: getRefId(data.assignedAgent),

          // âœ… Notes convert to editor format
          note: data.note || getNotesHtml(data),
        });
      } catch (err) {
        if (fallbackLead) {
          const data = mergeLeadDetails(fallbackLead);
          setLeadData(data);
          setForm({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            status: data.status || "new",
            assignedManager: getRefId(data.assignedManager),
            assignedAgent: getRefId(data.assignedAgent),
            note: data.note || getNotesHtml(data),
          });
          setError("");
          return;
        }

        console.error("Error fetching lead:", err);
        setError("Failed to load lead");
      }
    };

    fetchLead();
  }, [id, fallbackLead]);

  // ================= FETCH MANAGERS =================
  useEffect(() => {
    getManagers()
      .then(setManagers)
      .catch(() => console.error("Manager fetch failed"));
  }, []);

  // ================= FETCH AGENTS =================
  useEffect(() => {
    if (!form.assignedManager) {
      setAgents([]);
      return;
    }

    getAgents(form.assignedManager)
      .then(setAgents)
      .catch(() => console.error("Agent fetch failed"));
  }, [form.assignedManager]);

  // ================= UPDATE (single button saves everything) =================
  const handleUpdate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      // 1. Update lead fields
      await updateLead(id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: form.status,
        assignedManager: form.assignedManager || null,
        assignedAgent: form.assignedAgent || null,
        note: form.note,
      });

      // 2. Save new call log if filled
      if (callForm.note || callForm.duration > 0) {
        await addCallLog(id, callForm);
        setCallForm({ callType: "outgoing", duration: 0, status: "connected", note: "" });
      }

      // 3. Save new follow-up if date is filled
      if (followupForm.date) {
        if (isBeforeToday(followupForm.date)) {
          setError("Follow-up date cannot be in the past");
          return;
        }
        await addFollowUp(id, followupForm);
        setFollowupForm({ date: "", note: "" });
      }

      // 4. Save new meeting if title + date are filled
      if (meetingForm.title && meetingForm.date) {
        if (isBeforeToday(meetingForm.date)) {
          setError("Meeting date cannot be in the past");
          return;
        }
        await addMeeting(id, meetingForm);
        setMeetingForm({ title: "", date: "", location: "", description: "" });
      }

      // 5. Refresh lead data
      const data = await getLeadById(id);
      setLeadData(data);

      navigate("/admin/leads");

    } catch (err: any) {
      console.error("Update failed:", err);
      setError(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard manager-dashboard-shell admin-lead-detail-theme">
      <Sidebar />

      <div className="main manager-dashboard-theme">
        <Navbar />

        <div className="create-page admin-lead-detail-page">

          {/* HEADER */}
          <div className="create-header">
            <div>
              <h2>Lead Details</h2>
              <p>View & update lead</p>
            </div>

            <button
              type="button"
              className="admin-lead-back-btn"
              onClick={() => navigate("/admin/leads")}
            >
              <span aria-hidden="true">←</span>
              Back to Leads
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          {/* GRID */}
          <div className="create-grid">

            {/* LEFT SIDE */}
            <div className="form-card">

              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <label htmlFor="status">Status</label>
              <select
                id="status"
                aria-label="Select Status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="not_interested">Not Interested</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>

              <label htmlFor="manager">Manager</label>
              <select
                id="manager"
                aria-label="Select Manager"
                value={form.assignedManager}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignedManager: e.target.value,
                    assignedAgent: "",
                  })
                }
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <label htmlFor="agent">Agent</label>
              <select
                id="agent"
                aria-label="Select Agent"
                value={form.assignedAgent}
                onChange={(e) =>
                  setForm({ ...form, assignedAgent: e.target.value })
                }
                disabled={!form.assignedManager}
              >
                <option value="">
                  {form.assignedManager
                    ? "Select Agent"
                    : "Select Manager First"}
                </option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>

            </div>

            {/* RIGHT SIDE EDITOR */}
            <div className="editor-card">
              <ReactQuill
                theme="snow"
                value={form.note}
                onChange={(val: string) =>
                  setForm({ ...form, note: val })
                }
              />
            </div>

          </div>

          {/* CALL LOGS */}
          {leadData && (
            <div className="form-card" style={{ marginTop: "24px", marginBottom: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Call Logs</h4>

              {/* Existing call logs */}
              {leadData.callLogs?.length === 0 && <p style={{ fontSize: "14px", color: "#888" }}>No call logs yet.</p>}
              {leadData.callLogs?.map((log: any, idx: number) => (
                <div key={idx} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <strong>{log.callType}</strong> - {log.status} - {formatDuration(log.duration)}
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {new Date(log.calledAt).toLocaleString()} | {log.note}
                  </div>
                </div>
              ))}

              {/* New call log form */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #ddd" }}>
                <div>
                  <label>Call Type</label>
                  <select
                    value={callForm.callType}
                    onChange={(e) => setCallForm({ ...callForm, callType: e.target.value })}
                  >
                    <option value="outgoing">Outgoing</option>
                    <option value="incoming">Incoming</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select
                    value={callForm.status}
                    onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
                  >
                    <option value="connected">Connected</option>
                    <option value="not_connected">Not Connected</option>
                    <option value="busy">Busy</option>
                    <option value="no_answer">No Answer</option>
                  </select>
                </div>
                <div className="call-duration-field">
                  <label>Duration</label>
                  <div className="call-duration-selects">
                    <select
                      aria-label="Call duration minutes"
                      value={durationMinutes}
                      onChange={(e) => setCallDuration(Number(e.target.value), durationSeconds)}
                    >
                      {durationOptions(121)}
                    </select>
                    <span>min</span>
                    <select
                      aria-label="Call duration seconds"
                      value={durationSeconds}
                      onChange={(e) => setCallDuration(durationMinutes, Number(e.target.value))}
                    >
                      {durationOptions(60)}
                    </select>
                    <span>sec</span>
                  </div>
                </div>
                <div>
                  <label>Note</label>
                  <input
                    type="text"
                    placeholder="Call note..."
                    value={callForm.note}
                    onChange={(e) => setCallForm({ ...callForm, note: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* FOLLOW-UPS */}
          {leadData && (
            <div className="form-card" style={{ marginBottom: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Follow-ups</h4>

              {/* Existing follow-ups */}
              {leadData.followUps?.length === 0 && <p style={{ fontSize: "14px", color: "#888" }}>No follow-ups yet.</p>}
              {leadData.followUps?.map((f: any, idx: number) => (
                <div key={idx} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <strong>{new Date(f.date).toLocaleString()}</strong> â€” {f.status}
                  <div style={{ fontSize: "12px", color: "#666" }}>{f.note}</div>
                </div>
              ))}

              {/* New follow-up form */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #ddd" }}>
                <div>
                  <label>Follow-up Date</label>
                  <input
                    type="datetime-local"
                    min={todayDateTimeInputValue()}
                    value={followupForm.date}
                    onChange={(e) => setFollowupForm({ ...followupForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label>Note</label>
                  <input
                    type="text"
                    placeholder="Follow-up note..."
                    value={followupForm.note}
                    onChange={(e) => setFollowupForm({ ...followupForm, note: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* MEETINGS */}
          {leadData && (
            <div className="form-card" style={{ marginBottom: "20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Meetings</h4>

              {/* Existing meetings */}
              {leadData.meetings?.length === 0 && <p style={{ fontSize: "14px", color: "#888" }}>No meetings scheduled yet.</p>}
              {leadData.meetings?.map((m: any, idx: number) => (
                <div key={idx} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <strong>{m.title}</strong> â€” {m.status}
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {new Date(m.date).toLocaleString()} | {m.location} | {m.description}
                  </div>
                </div>
              ))}

              {/* New meeting form */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #ddd" }}>
                <div>
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Meeting title..."
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    min={todayDateTimeInputValue()}
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Location..."
                    value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Description..."
                    value={meetingForm.description}
                    onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SINGLE SUBMIT */}
          <div className="submit-section">
            <button onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>

          {/* TIMELINE */}
          <div className="form-card" style={{ marginTop: "24px" }}>
            <TimelineContainer activities={mapBackendTimelineToActivities(leadData?.timeline)} title="Lead Activity Timeline" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadDetailsPage;



























// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Sidebar from "../DashboardSidebar/Sidebar";
// import Navbar from "../DashboardNavbar/Navbar";

// import { getLeadById, updateLead } from "../../services/leadService";
// import { getManagers, getAgents } from "../../api/user.api";

// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

// const LeadDetailsPage = () => {
//   // âœ… ONLY ONE DECLARATION (FIXED)
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [form, setForm] = useState<any>({
//     name: "",
//     email: "",
//     phone: "",
//     status: "new",
//     assignedManager: "",
//     assignedAgent: "",
//     note: "",
//   });

//   const [managers, setManagers] = useState<any[]>([]);
//   const [agents, setAgents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ================= FETCH LEAD =================
//   useEffect(() => {
//     const fetchLead = async () => {
//       if (!id) return; // âœ… safety check

//       try {
//         const data = await getLeadById(id);

//         setForm({
//           name: data.name || "",
//           email: data.email || "",
//           phone: data.phone || "",
//           status: data.status || "new",
//           assignedManager: data.assignedManager?._id || "",
//           assignedAgent: data.assignedAgent?._id || "",
//           note: data.notes?.map((n: any) => n.text).join("<br/><br/>") || "",
//         });
//       } catch (err) {
//         console.error("Error fetching lead:", err);
//       }
//     };

//     fetchLead();
//   }, [id]);

//   // ================= FETCH MANAGERS =================
//   useEffect(() => {
//     getManagers().then(setManagers);
//   }, []);

//   // ================= FETCH AGENTS =================
//   useEffect(() => {
//     if (!form.assignedManager) return;
//     getAgents(form.assignedManager).then(setAgents);
//   }, [form.assignedManager]);

//   // ================= UPDATE =================
//   const handleUpdate = async () => {
//     console.log("UPDATE CLICKED");
//   if (!id) return;

//   try {
//     setLoading(true);

//     await updateLead(id, {
//       ...form,
//       note: form.note, // âœ… FIXED
//     });

//     navigate("/admin/leads");
//   } catch (err) {
//     console.error("Update failed:", err);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="dashboard">
//       <Sidebar />

//       <div className="main">
//         <Navbar user={{ name: "Admin" }} />

//         <div className="create-page">

//           {/* HEADER */}
//           <div className="create-header">
//             <div>
//               <h2>Lead Details</h2>
//               <p>View & update lead</p>
//             </div>

//             <button onClick={() => navigate("/admin/leads")}>
//               â† Back
//             </button>
//           </div>

//           {/* GRID */}
//           <div className="create-grid">

//             {/* LEFT SIDE */}
//             <div className="form-card">

//               <label htmlFor="name">Full Name</label>
//               <input
//                 id="name"
//                 placeholder="Enter full name"
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm({ ...form, name: e.target.value })
//                 }
//               />

//               <label htmlFor="email">Email</label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="email@example.com"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm({ ...form, email: e.target.value })
//                 }
//               />

//               <label htmlFor="phone">Phone</label>
//               <input
//                 id="phone"
//                 placeholder="Phone number"
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm({ ...form, phone: e.target.value })
//                 }
//               />

//               <label htmlFor="status">Status</label>
//               <select
//                 id="status"
//                 value={form.status}
//                 onChange={(e) =>
//                   setForm({ ...form, status: e.target.value })
//                 }
//               >
//                 <option value="new">New</option>
//                 <option value="contacted">Contacted</option>
//                 <option value="interested">Interested</option>
//               </select>

//               <label htmlFor="manager">Manager</label>
//               <select
//                 id="manager"
//                 value={form.assignedManager}
//                 onChange={(e) =>
//                   setForm({
//                     ...form,
//                     assignedManager: e.target.value,
//                     assignedAgent: "",
//                   })
//                 }
//               >
//                 <option value="">Select Manager</option>
//                 {managers.map((m) => (
//                   <option key={m._id} value={m._id}>
//                     {m.name}
//                   </option>
//                 ))}
//               </select>

//               <label htmlFor="agent">Agent</label>
//               <select
//                 id="agent"
//                 value={form.assignedAgent}
//                 onChange={(e) =>
//                   setForm({ ...form, assignedAgent: e.target.value })
//                 }
//               >
//                 <option value="">Select Agent</option>
//                 {agents.map((a) => (
//                   <option key={a._id} value={a._id}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>

//             </div>

//             {/* RIGHT SIDE EDITOR */}
//             <div className="editor-card">
//               <ReactQuill
//                 theme="snow"
//                 value={form.note}
//                 onChange={(val: string) =>
//                   setForm({ ...form, note: val })
//                 }
//               />
//             </div>

//           </div>

//           {/* SUBMIT */}
//           <div className="submit-section">
//             <button onClick={handleUpdate} disabled={loading}>
//               {loading ? "Updating..." : "Update Lead"}
//             </button>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeadDetailsPage;
