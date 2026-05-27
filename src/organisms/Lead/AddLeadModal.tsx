import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createLead } from "../../services/leadService";
import { getManagers, getAgents } from "../../api/user.api";

const sourceOptions = [
  { value: "manual",   label: "✍️  Manual",    icon: "✍️" },
  { value: "website",  label: "🌐  Website",   icon: "🌐" },
  { value: "facebook", label: "📘  Facebook",  icon: "📘" },
  { value: "linkedin", label: "💼  LinkedIn",  icon: "💼" },
  { value: "referral", label: "🤝  Referral",  icon: "🤝" },
  { value: "call",     label: "📞  Call",      icon: "📞" },
  { value: "whatsapp", label: "💬  WhatsApp",  icon: "💬" },
  { value: "other",    label: "➕  Other",     icon: "➕" },
];

const statusOptions = [
  { value: "new", label: "New", color: "#3b82f6" },
  { value: "contacted", label: "Contacted", color: "#8b5cf6" },
  { value: "interested", label: "Interested", color: "#06b6d4" },
  { value: "not_interested", label: "Not Interested", color: "#ef4444" },
  { value: "won", label: "Won", color: "#16a34a" },
  { value: "lost", label: "Lost", color: "#dc2626" },
];

const AddLeadModal = ({ open, onClose, refresh }: any) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "manual",
    status: "new",
    assignedManager: "",
    assignedAgent: "",
    note: "",
    isClosed: false,
    reassignmentRequested: false,
    reassignmentReason: "",
  });

  const [managers, setManagers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // ================= FETCH MANAGERS =================
  useEffect(() => {
    if (!open) return;

    getManagers()
      .then(setManagers)
      .catch(() => console.error("Manager fetch error"));
  }, [open]);

  // ================= FETCH AGENTS =================
  useEffect(() => {
    if (!form.assignedManager) {
      setAgents([]);
      return;
    }

    getAgents(form.assignedManager)
      .then(setAgents)
      .catch(() => console.error("Agent fetch error"));

    setForm((prev) => ({ ...prev, assignedAgent: "" }));
  }, [form.assignedManager]);

  // ================= RESET =================
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setForm({
          name: "",
          email: "",
          phone: "",
          source: "manual",
          status: "new",
          assignedManager: "",
          assignedAgent: "",
          note: "",
          isClosed: false,
          reassignmentRequested: false,
          reassignmentReason: "",
        });
        setError("");
        setStep(1);
        setSuccess(false);
      }, 300);
    }
  }, [open]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setError("");
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email && !form.phone) return "Email or phone required.";
    return "";
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const err = validate();
    if (err) return setError(err);

    try {
      setLoading(true);

      await createLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: form.source,
        status: form.status,
        assignedManager: form.assignedManager || null,
        assignedAgent: form.assignedAgent || null,

        // ✅ IMPORTANT FIX (Timeline + Notes trigger)
        note: form.note,

        isClosed: form.isClosed,
        reassignmentRequested: form.reassignmentRequested,
        reassignmentReason: form.reassignmentReason,
      });

      setSuccess(true);

      setTimeout(() => {
        refresh?.();
        onClose();
      }, 800);

    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="popup-overlay">
          <motion.div className="lead-popup-card">

            {/* HEADER */}
            <div className="ldp-header">
              <h2>Create Lead</h2>
              <button onClick={onClose}>✕</button>
            </div>

            {/* ERROR */}
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                  <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                  <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />

                  <button type="button" onClick={() => setStep(2)}>
                    Next
                  </button>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <select
                    name="assignedManager"
                    value={form.assignedManager}
                    onChange={handleChange}
                    aria-label="Select Manager"
                  >
                    <option value="">Manager</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>

                  <select
                    name="assignedAgent"
                    value={form.assignedAgent}
                    onChange={handleChange}
                    aria-label="Select Agent"
                  >
                    <option value="">Agent</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>

                  <textarea
                    name="note"
                    placeholder="Note"
                    value={form.note}
                    onChange={handleChange}
                  />

                  <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Lead"}
                  </button>
                </>
              )}

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddLeadModal;












































// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { createLead } from "../../services/leadService";
// import { getManagers, getAgents } from "../../api/user.api";

// // import "../../styles/leads.css";

// const sourceOptions = [
//   { value: "manual",   label: "✍️  Manual",    icon: "✍️" },
//   { value: "website",  label: "🌐  Website",   icon: "🌐" },
//   { value: "facebook", label: "📘  Facebook",  icon: "📘" },
//   { value: "linkedin", label: "💼  LinkedIn",  icon: "💼" },
//   { value: "referral", label: "🤝  Referral",  icon: "🤝" },
//   { value: "call",     label: "📞  Call",      icon: "📞" },
//   { value: "whatsapp", label: "💬  WhatsApp",  icon: "💬" },
//   { value: "other",    label: "➕  Other",     icon: "➕" },
// ];

// const statusOptions = [
//   { value: "new",           label: "New",           color: "#3b82f6" },
//   { value: "contacted",     label: "Contacted",     color: "#8b5cf6" },
//   { value: "interested",    label: "Interested",    color: "#06b6d4" },
//   { value: "not_interested",label: "Not Interested",color: "#ef4444" },
//   { value: "won",           label: "Won",           color: "#16a34a" },
//   { value: "lost",          label: "Lost",          color: "#dc2626" },
// ];

// const overlayVariants = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 0.2 } },
//   exit:   { opacity: 0, transition: { duration: 0.18 } },
// };

// const cardVariants = {
//   hidden:  { opacity: 0, y: 28, scale: 0.97 },
//   visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
//   exit:    { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2 } },
// };

// const AddLeadModal = ({ open, onClose, refresh }: any) => {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     source: "manual",
//     status: "new",
//     assignedManager: "",
//     assignedAgent: "",
//     note: "",
//     isClosed: false,
//     reassignmentRequested: false,
//     reassignmentReason: "",
//   });

//   const [managers, setManagers]   = useState<any[]>([]);
//   const [agents, setAgents]       = useState<any[]>([]);
//   const [loading, setLoading]     = useState(false);
//   const [success, setSuccess]     = useState(false);
//   const [error, setError]         = useState("");
//   const [step, setStep]           = useState(1); // 1 = Contact, 2 = Details

//   // ================= FETCH MANAGERS =================
//   useEffect(() => {
//     const fetchManagers = async () => {
//       try {
//         const data = await getManagers();
//         setManagers(data);
//       } catch (err) {
//         console.error("Error fetching managers:", err);
//       }
//     };
//     if (open) fetchManagers();
//   }, [open]);

//   // ================= FETCH AGENTS =================
//   useEffect(() => {
//     if (!form.assignedManager) { setAgents([]); return; }
//     const fetchAgents = async () => {
//       try {
//         const data = await getAgents(form.assignedManager);
//         setAgents(data);
//       } catch (err) {
//         console.error("Error fetching agents:", err);
//       }
//     };
//     fetchAgents();
//     setForm((prev) => ({ ...prev, assignedAgent: "" }));
//   }, [form.assignedManager]);

//   // Reset on close
//   useEffect(() => {
//     if (!open) {
//       setTimeout(() => {
//         setForm({ name:"", email:"", phone:"", source:"manual", status:"new",
//           assignedManager:"", assignedAgent:"", note:"", isClosed:false,
//           reassignmentRequested:false, reassignmentReason:"" });
//         setError(""); setStep(1); setSuccess(false);
//       }, 300);
//     }
//   }, [open]);

//   const handleChange = (e: any) => {
//     const { name, value, type, checked } = e.target;
//     setError("");
//     setForm({ ...form, [name]: type === "checkbox" ? checked : value });
//   };

//   const validate = () => {
//     if (!form.name.trim()) return "Full name is required.";
//     if (!form.email && !form.phone) return "Please provide an email or phone number.";
//     return "";
//   };

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     const err = validate();
//     if (err) return setError(err);

//     try {
//       setLoading(true);
//       await createLead({
//         name: form.name,
//         email: form.email,
//         phone: form.phone,
//         source: form.source,
//         status: form.status,
//         assignedManager: form.assignedManager || null,
//         assignedAgent: form.assignedAgent || null,
//         notes: form.note ? [{ text: form.note }] : [],
//         isClosed: form.isClosed,
//         reassignmentRequested: form.reassignmentRequested,
//         reassignmentReason: form.reassignmentReason,
//       });
//       setSuccess(true);
//       setTimeout(() => {
//         if (typeof refresh === "function") refresh();
//         onClose();
//       }, 900);
//     } catch (e: any) {
//       setError(e?.message || "Something went wrong. Please try again.");
//       setLoading(false);
//     }
//   };

//   const currentStatus = statusOptions.find(s => s.value === form.status) || statusOptions[0];

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="popup-overlay"
//           variants={overlayVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//           onClick={(e) => e.target === e.currentTarget && onClose()}
//         >
//           <motion.div
//             className="lead-popup-card alm-card"
//             variants={cardVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//           >

//             {/* ── HEADER ── */}
//             <div className="ldp-header alm-header">
//               <div className="ldp-header-left">
//                 <span className="ldp-eyebrow">New Lead</span>
//                 <h2 className="ldp-title">Create Lead</h2>
//               </div>

//               {/* STEP PILLS */}
//               <div className="alm-steps">
//                 <button
//                   type="button"
//                   className={`alm-step-pill ${step === 1 ? "active" : "done"}`}
//                   onClick={() => setStep(1)}
//                 >
//                   <span className="alm-step-num">1</span>
//                   <span className="alm-step-label">Contact</span>
//                 </button>
//                 <span className="alm-step-line" />
//                 <button
//                   type="button"
//                   className={`alm-step-pill ${step === 2 ? "active" : step > 2 ? "done" : ""}`}
//                   onClick={() => setStep(2)}
//                 >
//                   <span className="alm-step-num">2</span>
//                   <span className="alm-step-label">Details</span>
//                 </button>
//               </div>

//               <button className="ldp-close-btn" onClick={onClose} aria-label="Close">✕</button>
//             </div>

//             {/* ── ERROR BANNER ── */}
//             <AnimatePresence>
//               {error && (
//                 <motion.div
//                   className="alm-error-banner"
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                 >
//                   <span className="alm-error-icon">⚠️</span>
//                   {error}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* ── FORM ── */}
//             <form onSubmit={handleSubmit} noValidate>
//               <div className="ldp-body">

//                 {/* ════ STEP 1: CONTACT INFO ════ */}
//                 <AnimatePresence mode="wait">
//                   {step === 1 && (
//                     <motion.div
//                       key="step1"
//                       initial={{ opacity: 0, x: -16 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: 16 }}
//                       transition={{ duration: 0.22 }}
//                     >
//                       <p className="ldp-section-title">Contact Information</p>
//                       <div className="ldp-fields-grid">

//                         <div className="ldp-field full">
//                           <label className="ldp-label" htmlFor="alm-name">Full Name <span className="alm-required">*</span></label>
//                           <div className="alm-input-wrap">
//                             <span className="alm-input-icon">👤</span>
//                             <input
//                               className="ldp-input alm-has-icon"
//                               id="alm-name"
//                               name="name"
//                               placeholder="e.g. Rahul Sharma"
//                               value={form.name}
//                               onChange={handleChange}
//                               autoFocus
//                             />
//                           </div>
//                         </div>

//                         <div className="ldp-field">
//                           <label className="ldp-label" htmlFor="alm-email">Email Address</label>
//                           <div className="alm-input-wrap">
//                             <span className="alm-input-icon">✉️</span>
//                             <input
//                               className="ldp-input alm-has-icon"
//                               id="alm-email"
//                               name="email"
//                               type="email"
//                               placeholder="email@example.com"
//                               value={form.email}
//                               onChange={handleChange}
//                             />
//                           </div>
//                         </div>

//                         <div className="ldp-field">
//                           <label className="ldp-label" htmlFor="alm-phone">Phone Number</label>
//                           <div className="alm-input-wrap">
//                             <span className="alm-input-icon">📱</span>
//                             <input
//                               className="ldp-input alm-has-icon"
//                               id="alm-phone"
//                               name="phone"
//                               placeholder="+91 98765 43210"
//                               value={form.phone}
//                               onChange={handleChange}
//                             />
//                           </div>
//                         </div>

//                       </div>

//                       {/* SOURCE */}
//                       <p className="ldp-section-title" style={{ marginTop: 24 }}>Lead Source</p>
//                       <div className="alm-source-grid">
//                         {sourceOptions.map((s) => (
//                           <button
//                             key={s.value}
//                             type="button"
//                             className={`alm-source-chip ${form.source === s.value ? "selected" : ""}`}
//                             onClick={() => { setForm({ ...form, source: s.value }); setError(""); }}
//                           >
//                             <span className="alm-source-emoji">{s.icon}</span>
//                             <span>{s.value.charAt(0).toUpperCase() + s.value.slice(1)}</span>
//                           </button>
//                         ))}
//                       </div>
//                     </motion.div>
//                   )}

//                   {/* ════ STEP 2: DETAILS ════ */}
//                   {step === 2 && (
//                     <motion.div
//                       key="step2"
//                       initial={{ opacity: 0, x: 16 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -16 }}
//                       transition={{ duration: 0.22 }}
//                     >
//                       <p className="ldp-section-title">Lead Status</p>
//                       <div className="alm-status-grid">
//                         {statusOptions.map((s) => (
//                           <button
//                             key={s.value}
//                             type="button"
//                             className={`alm-status-chip ${form.status === s.value ? "selected" : ""}`}
//                             style={form.status === s.value
//                               ? { borderColor: s.color, background: s.color + "18", color: s.color }
//                               : {}}
//                             onClick={() => { setForm({ ...form, status: s.value }); setError(""); }}
//                           >
//                             <span
//                               className="alm-status-dot"
//                               style={{ background: s.color }}
//                             />
//                             {s.label}
//                           </button>
//                         ))}
//                       </div>

//                       <p className="ldp-section-title" style={{ marginTop: 24 }}>Assignment</p>
//                       <div className="ldp-fields-grid">
//                         <div className="ldp-field">
//                           <label className="ldp-label" htmlFor="alm-manager">Manager</label>
//                           <select
//                             className="ldp-select"
//                             id="alm-manager"
//                             name="assignedManager"
//                             value={form.assignedManager}
//                             onChange={handleChange}
//                           >
//                             <option value="">Select Manager</option>
//                             {managers.map((m) => (
//                               <option key={m._id} value={m._id}>{m.name}</option>
//                             ))}
//                           </select>
//                         </div>

//                         <div className="ldp-field">
//                           <label className="ldp-label" htmlFor="alm-agent">Agent</label>
//                           <select
//                             className="ldp-select"
//                             id="alm-agent"
//                             name="assignedAgent"
//                             value={form.assignedAgent}
//                             onChange={handleChange}
//                             disabled={!form.assignedManager}
//                           >
//                             <option value="">
//                               {form.assignedManager ? "Select Agent" : "Select Manager First"}
//                             </option>
//                             {agents.map((a) => (
//                               <option key={a._id} value={a._id}>{a.name}</option>
//                             ))}
//                           </select>
//                         </div>
//                       </div>

//                       <p className="ldp-section-title" style={{ marginTop: 24 }}>Note</p>
//                       <div className="ldp-field">
//                         <label className="ldp-label" htmlFor="alm-note">Initial Note</label>
//                         <textarea
//                           className="ldp-textarea"
//                           id="alm-note"
//                           name="note"
//                           placeholder="Add any initial note about this lead…"
//                           value={form.note}
//                           onChange={handleChange}
//                         />
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//               </div>

//               <div className="ldp-divider" />

//               {/* ── FOOTER ── */}
//               <div className="ldp-footer">
//                 <button type="button" className="ldp-btn-secondary" onClick={onClose}>
//                   Cancel
//                 </button>

//                 {step === 1 ? (
//                   <button
//                     type="button"
//                     className="ldp-btn-primary"
//                     onClick={() => {
//                       const err = validate();
//                       if (err) return setError(err);
//                       setStep(2);
//                     }}
//                   >
//                     Next — Details →
//                   </button>
//                 ) : (
//                   <div style={{ display: "flex", gap: 10 }}>
//                     <button
//                       type="button"
//                       className="ldp-btn-secondary"
//                       onClick={() => setStep(1)}
//                     >
//                       ← Back
//                     </button>
//                     <button
//                       type="submit"
//                       className={`ldp-btn-primary${success ? " success-state" : ""}`}
//                       disabled={loading}
//                     >
//                       {loading && !success && <span className="ldp-spinner" />}
//                       {success ? "✓ Created!" : loading ? "Creating…" : "Create Lead"}
//                     </button>
//                   </div>
//                 )}
//               </div>

//             </form>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default AddLeadModal;