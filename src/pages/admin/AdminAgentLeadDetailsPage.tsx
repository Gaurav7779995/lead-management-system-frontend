import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import "../../assets/styles/Dashboard.css";

type PersonRef = string | { _id?: string; name?: string; email?: string } | null;

interface AgentDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  managerId?: PersonRef;
  createdAt?: string;
}

interface LeadRow {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  state?: string;
  createdAt?: string;
}

const getRows = (payload: any): LeadRow[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.leads)) return payload.data.leads;
  if (Array.isArray(payload?.leads)) return payload.leads;
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isWon = (status?: string) => ["won", "converted", "qualified"].includes((status || "").toLowerCase());
const isLost = (status?: string) => ["lost", "not_interested"].includes((status || "").toLowerCase());

const getManagerName = (manager?: PersonRef) => {
  if (!manager) return "Not Assigned";
  if (typeof manager === "string") return "Assigned";
  return manager.name || "Assigned";
};

const AdminAgentLeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgentLeads = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [agentResponse, leadsResponse] = await Promise.all([
          axiosInstance.get(`/users/agent/${id}`),
          axiosInstance.get(`/leads?agentId=${id}&limit=10000`),
        ]);

        setAgent(agentResponse.data?.data || null);
        setLeads(getRows(leadsResponse.data));
      } catch (error) {
        console.error("Error loading agent lead details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgentLeads();
  }, [id]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      won: leads.filter((lead) => isWon(lead.status)).length,
      lost: leads.filter((lead) => isLost(lead.status)).length,
      active: leads.filter((lead) => !isWon(lead.status) && !isLost(lead.status)).length,
    }),
    [leads],
  );

  return (
    <AdminLayout>
      <div className="admin-drilldown-page">
        <button className="admin-drilldown-back" onClick={() => navigate("/admin/agents")}>
          <ArrowLeft size={18} />
          Back to Agents
        </button>

        {loading ? (
          <div className="admin-drilldown-empty">Loading agent leads...</div>
        ) : (
          <>
            <div className="admin-drilldown-hero">
              <div className="admin-drilldown-avatar">
                <UserRound size={34} />
              </div>
              <div>
                <h1>{agent?.name || "Agent Details"}</h1>
                <p>{getManagerName(agent?.managerId)} Manager</p>
                <div className="admin-drilldown-meta">
                  <span><Mail size={15} /> {agent?.email || "N/A"}</span>
                  <span><Phone size={15} /> {agent?.phone || "N/A"}</span>
                  <span><CalendarDays size={15} /> {formatDate(agent?.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="admin-drilldown-stats">
              <div><strong>{stats.total}</strong><span>Total Leads</span></div>
              <div><strong>{stats.active}</strong><span>Active Leads</span></div>
              <div><strong>{stats.won}</strong><span>Won Leads</span></div>
              <div><strong>{stats.lost}</strong><span>Lost Leads</span></div>
            </div>

            <div className="admin-drilldown-card">
              <h2>Assigned Lead Details</h2>
              {leads.length === 0 ? (
                <div className="admin-drilldown-empty">No leads assigned to this agent.</div>
              ) : (
                <div className="admin-drilldown-table-wrap">
                  <table className="admin-drilldown-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Lead</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>State</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, index) => (
                        <tr key={lead._id || index}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{lead.name || "Unnamed Lead"}</strong>
                            <span>{lead.email || "No email"}</span>
                          </td>
                          <td>{lead.phone || "N/A"}</td>
                          <td><span className="admin-drilldown-pill">{lead.status || "New"}</span></td>
                          <td>{lead.source || "N/A"}</td>
                          <td>{lead.state || "N/A"}</td>
                          <td>{formatDate(lead.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAgentLeadDetailsPage;
