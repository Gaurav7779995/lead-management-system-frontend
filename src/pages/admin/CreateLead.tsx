import { useState, useEffect, useLayoutEffect, useRef } from "react";
import type { ChangeEvent, ElementType, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import { createLead } from "../../services/leadService";
import { getManagers, getAgents } from "../../api/user.api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../assets/styles/Leads.css";
import "../../assets/styles/Dashboard.css";

const ArrowLeftIcon = FaArrowLeft as ElementType;
const CheckCircleIcon = FaCheckCircle as ElementType;
const EnvelopeIcon = FaEnvelope as ElementType;
const PhoneIcon = FaPhoneAlt as ElementType;
const UserIcon = FaUser as ElementType;
const UserTieIcon = FaUserTie as ElementType;

type LeadForm = {
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  assignedManager: string;
  assignedAgent: string;
  note: string;
};

const initialForm: LeadForm = {
  name: "",
  email: "",
  phone: "",
  source: "manual",
  status: "new",
  assignedManager: "",
  assignedAgent: "",
  note: "",
};

const sourceOptions = [
  { value: "manual", label: "Manual" },
  { value: "website", label: "Website" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Referral" },
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const CreateLead = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<LeadForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [managers, setManagers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const activeFieldRef = useRef<keyof LeadForm | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("leadDraft");

    if (saved) {
      try {
        setForm({ ...initialForm, ...JSON.parse(saved) });
      } catch {
        localStorage.removeItem("leadDraft");
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("leadDraft", JSON.stringify(form));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [form]);

  useLayoutEffect(() => {
    if (!activeFieldRef.current) return;
    const selector = `[name="${activeFieldRef.current}"]`;
    const element = document.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
    if (element && document.activeElement !== element) {
      const length = element.value?.length ?? 0;
      element.focus();
      if ("setSelectionRange" in element && element.tagName === "INPUT") {
        element.setSelectionRange(length, length);
      }
    }
  }, [form.name, form.email, form.phone, form.source, form.status, form.assignedManager, form.assignedAgent]);

  useEffect(() => {
    getManagers()
      .then(setManagers)
      .catch(() => setManagers([]));
  }, []);

  useEffect(() => {
    if (!form.assignedManager) {
      setAgents([]);
      return;
    }

    getAgents(form.assignedManager)
      .then(setAgents)
      .catch(() => setAgents([]));
  }, [form.assignedManager]);

  const updateField = (name: keyof LeadForm, value: string) => {
    activeFieldRef.current = name;
    if (submitError) setSubmitError("");
    if (success) setSuccess("");
    if (errors[name] || errors.contact) {
      setErrors((prev) => ({ ...prev, [name]: "", contact: "" }));
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "assignedManager" ? { assignedAgent: "" } : {}),
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateField(e.target.name as keyof LeadForm, e.target.value);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.email.trim() && !form.phone.trim()) {
      nextErrors.contact = "Add an email or phone number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setSubmitError("");
      setSuccess("");

      const plainNote = form.note
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      await createLead({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        source: form.source,
        status: form.status,
        assignedManager: form.assignedManager || null,
        assignedAgent: form.assignedAgent || null,
        note: plainNote ? form.note : "",
      });

      localStorage.removeItem("leadDraft");
      setSuccess("Lead created successfully.");

      setTimeout(() => {
        navigate("/admin/leads");
      }, 700);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Lead creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard manager-dashboard-shell">
      <Sidebar />

      <div className="main manager-dashboard-theme">
        <Navbar />

        <form className="create-lead-premium" onSubmit={handleSubmit}>
          <div className="lead-create-hero">
            <button
              type="button"
              className="lead-back-btn"
              onClick={() => navigate("/admin/leads")}
            >
              <ArrowLeftIcon />
              Back to Leads
            </button>

            <div className="lead-create-title">
              <span>New Lead</span>
              <h1>Create Lead</h1>
              <p>Capture contact details, ownership, status, and first conversation notes in one clean workflow.</p>
            </div>

            <button className="lead-primary-action" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>

          {(success || submitError) && (
            <div className={success ? "lead-alert success" : "lead-alert error"}>
              {success ? <CheckCircleIcon /> : null}
              <span>{success || submitError}</span>
            </div>
          )}

          <div className="lead-create-grid">
            <section className="lead-form-panel">
              <div className="panel-heading">
                <h2>Contact Information</h2>
                <p>Basic details used by your sales team to identify and reach the lead.</p>
              </div>

              <div className="premium-field full">
                <label htmlFor="name">Full Name</label>
                <div className="premium-input-wrap">
                  <UserIcon />
                  <input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="lead-two-col">
                <div className="premium-field">
                  <label htmlFor="email">Email</label>
                  <div className="premium-input-wrap">
                    <EnvelopeIcon />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="premium-field">
                  <label htmlFor="phone">Phone</label>
                  <div className="premium-input-wrap">
                    <PhoneIcon />
                    <input
                      id="phone"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {errors.contact && <span className="field-error">{errors.contact}</span>}

              <div className="lead-two-col">
                <div className="premium-field">
                  <label htmlFor="source">Lead Source</label>
                  <select
                    id="source"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                  >
                    {sourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="premium-field">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="lead-form-panel">
              <div className="panel-heading">
                <h2>Ownership</h2>
                <p>Assign the lead to the right manager and agent before it enters the pipeline.</p>
              </div>

              <div className="lead-assignment-card">
                <UserTieIcon />
                <div>
                  <strong>Assignment</strong>
                  <span>Agents are filtered after selecting a manager.</span>
                </div>
              </div>

              <div className="premium-field">
                <label htmlFor="manager">Manager</label>
                <select
                  id="manager"
                  name="assignedManager"
                  value={form.assignedManager}
                  onChange={handleChange}
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="premium-field">
                <label htmlFor="agent">Agent</label>
                <select
                  id="agent"
                  name="assignedAgent"
                  value={form.assignedAgent}
                  onChange={handleChange}
                  disabled={!form.assignedManager}
                >
                  <option value="">
                    {form.assignedManager ? "Select Agent" : "Select Manager First"}
                  </option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          </div>

          <section className="lead-notes-panel">
            <div className="panel-heading">
              <h2>Initial Notes</h2>
              <p>Add the first interaction summary, requirements, budget, or next action.</p>
            </div>

            <ReactQuill
              theme="snow"
              value={form.note}
              onChange={(value: string) => updateField("note", value)}
            />
          </section>
        </form>
      </div>
    </div>
  );
};

export default CreateLead;
