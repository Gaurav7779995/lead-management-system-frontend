import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import { FaUser, FaArrowLeft, FaUserTie, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const AddAgent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    managerId: "",
  });
  const [managers, setManagers] = useState<{ _id: string; name: string }[]>([]);

  // Fetch managers on component mount
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axiosInstance.get("/users/managers");
        setManagers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: "agent",
        managerId: formData.managerId || null,
      };

      await axiosInstance.post("/auth/register", payload);
      alert("✅ Agent added successfully");
      navigate("/admin/agents");
    } catch (error: any) {
      console.error("❌ Error adding agent:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to add agent";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="add-agent-page">
        <div className="add-agent-header">
          <button
            className="btn-back"
            onClick={() => navigate("/admin/agents")}
          >
            <FaArrowLeft /> Back
          </button>
          <div className="header-title">
            <div className="header-icon">
              <FaUser />
            </div>
            <div>
              <h1>Add New Agent</h1>
              <p>Create a new agent account</p>
            </div>
          </div>
        </div>

        <div className="add-agent-form-container">
          <form onSubmit={handleSubmit} className="add-agent-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaUser /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter agent's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <FaEnvelope /> Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaPhone /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <FaLock /> Password *
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaUserTie /> Assign Manager
                </label>
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                >
                  <option value="">-- Select Manager (Optional) --</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/admin/agents")}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Adding..." : "Add Agent"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddAgent;
