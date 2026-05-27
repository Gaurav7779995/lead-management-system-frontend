import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import { FaUserTie, FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";

const ManagerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [isEdit, setIsEdit] = useState(true);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    const fetchManager = async () => {
      if (!id) return;

      try {
        const response = await axiosInstance.get(`/users/manager/${id}`);
        const data = response.data.data || response.data;

        if (data) {
          setForm({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        }
      } catch (error) {
        console.error("Error fetching manager:", error);
      }
    };

    fetchManager();
  }, [id]);

  // ================= UPDATE =================
  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!id) return;

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      alert("Please fill in all manager details");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put(`/users/manager/${id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      alert("✅ Manager updated successfully");
      setIsEdit(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update manager");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AdminLayout>
      <div className="add-manager-page manager-details-edit-page">
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
              <h1>Manager Details</h1>
              <p>View and update manager information</p>
            </div>
          </div>
        </div>

        <div className="add-manager-form-container">
          <form className="add-manager-form" onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!isEdit}
                  placeholder="Enter manager's full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!isEdit}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!isEdit}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-actions">
              {!isEdit ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsEdit(true)}
                >
                  <FaEdit /> Edit Manager
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsEdit(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : <><FaSave /> Save Changes</>}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManagerDetailsPage;
