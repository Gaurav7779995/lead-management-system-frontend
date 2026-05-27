import { useEffect, useState } from "react";
import type { ElementType } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import { FaArrowLeft, FaSave, FaUser, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa";

import "../../assets/styles/agent.css";
import "../../assets/styles/Dashboard.css";

const ArrowLeftIcon = FaArrowLeft as ElementType;
const SaveIcon = FaSave as ElementType;
const UserIcon = FaUser as ElementType;
const EnvelopeIcon = FaEnvelope as ElementType;
const PhoneIcon = FaPhone as ElementType;
const UserTieIcon = FaUserTie as ElementType;

const EditAgent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    managerId: "",
  });
  const [managers, setManagers] = useState<{ _id: string; name: string }[]>([]);

  // Fetch agent data and managers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch agent details
        const agentResponse = await axiosInstance.get(`/users/agent/${id}`);
        const agent = agentResponse.data.data;

        if (agent) {
          setFormData({
            name: agent.name || "",
            email: agent.email || "",
            phone: agent.phone || "",
            managerId: agent.managerId || "",
          });
        }

        // Fetch managers for dropdown
        const managersResponse = await axiosInstance.get("/users/managers");
        setManagers(managersResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load agent data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);

      await axiosInstance.put(`/users/agent/${id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        managerId: formData.managerId || null,
      });

      alert("✅ Agent updated successfully");
      navigate("/admin/agents");
    } catch (error: any) {
      console.error("Error updating agent:", error);
      alert(error.response?.data?.message || "Failed to update agent");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="edit-agent-page">
          <div className="loading-state">Loading agent data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="edit-agent-page">
        {/* Header */}
        <div className="edit-agent-header">
          <button className="btn-back" onClick={() => navigate("/admin/agents")}>
            <ArrowLeftIcon /> Back to Agents
          </button>
          <h2 className="edit-agent-title">
            <UserIcon className="title-icon" />
            Edit Agent
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-agent-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  <UserIcon className="field-icon" />
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter agent name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <EnvelopeIcon className="field-icon" />
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <PhoneIcon className="field-icon" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="managerId">
                  <UserTieIcon className="field-icon" />
                  Assign Manager
                </label>
                <select
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                >
                  <option value="">-- Select Manager --</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/admin/agents")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              <SaveIcon className="btn-icon" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditAgent;
