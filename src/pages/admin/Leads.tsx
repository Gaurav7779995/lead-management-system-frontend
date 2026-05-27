import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import LeadsHeader from "../../organisms/Lead/LeadsHeader";
import LeadsGrid from "../../organisms/Lead/LeadsGrid";
import LeadsTable from "../../organisms/Lead/LeadsTable";
import { getLeads, Lead } from "../../services/leadService";
import "../../assets/styles/Leads.css";
import "../../assets/styles/Dashboard.css";

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<"card" | "table">("card");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getLeads({
        page: 1,
        limit: 20,
      });

      const leadsData = Array.isArray(res?.data) ? res.data : [];

      setLeads(leadsData);
      setFilteredLeads(leadsData);
    } catch {
      setError("Failed to load leads");
      setLeads([]);
      setFilteredLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = useCallback(
    (value: string) => {
      const search = value.trim().toLowerCase();

      if (!search) {
        setFilteredLeads(leads);
        return;
      }

      const filtered = leads.filter((lead) =>
        lead?.name?.toLowerCase().includes(search) ||
        lead?.email?.toLowerCase().includes(search) ||
        lead?.phone?.toLowerCase().includes(search)
      );

      setFilteredLeads(filtered);
    },
    [leads]
  );

  if (loading) {
    return (
      <AdminLayout>
        <h2 className="page-message">Loading Leads...</h2>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <h2 className="page-message error">{error}</h2>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="leads-page admin-leads-page">
        <LeadsHeader
          onSearch={handleSearch}
          view={view}
          setView={setView}
          onAddLead={() => navigate("/admin/leads/create")}
        />

        {filteredLeads.length === 0 ? (
          <h3 className="page-message">No leads found</h3>
        ) : view === "card" ? (
          <LeadsGrid leads={filteredLeads} refresh={fetchLeads} />
        ) : (
          <LeadsTable leads={filteredLeads} refresh={fetchLeads} />
        )}
      </div>
    </AdminLayout>
  );
};

export default Leads;
