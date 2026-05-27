import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import { FaUserTie, FaArrowLeft } from "react-icons/fa";

const AddManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form data before validation:", formData);

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.phone.trim() === "") {
      alert("Phone number is required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: "manager",
      };
      console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
      console.log("Phone field value:", payload.phone);
      console.log("Phone field type:", typeof payload.phone);
      console.log("Phone field length:", payload.phone.length);
      
      const response = await axiosInstance.post("/auth/register", payload);
      console.log("Response from backend:", response.data);

      alert("✅ Manager added successfully");
      navigate("/admin/managers");
    } catch (error: any) {
      console.error("❌ Error adding manager:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to add manager";
      console.error("Server error details:", error?.response?.data);
      console.error("Full error object:", error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="add-manager-page">
        <div className="add-manager-header">
          <button
            className="btn-back"
            onClick={() => navigate("/admin/managers")}
          >
            <FaArrowLeft /> Back
          </button>
          <div className="header-title">
            <div className="header-icon">
              <FaUserTie />
            </div>
            <div>
              <h1>Add New Manager</h1>
              <p>Create a new manager account</p>
            </div>
          </div>
        </div>

        <div className="add-manager-form-container">
          <form onSubmit={handleSubmit} className="add-manager-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter manager's full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
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
                <label>Phone Number *</label>
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
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/admin/managers")}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Adding..." : "Add Manager"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddManager;