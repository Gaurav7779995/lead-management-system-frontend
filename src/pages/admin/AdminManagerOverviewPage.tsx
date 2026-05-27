import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Mail, Phone, UserRound, UsersRound } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import axiosInstance from "../../api/axiosInstance";
import "../../assets/styles/Dashboard.css";

type PersonRef = string | { _id?: string; name?: string; email?: string } | null;

interface AgentRow {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
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
  assignedAgent?: PersonRef;
  createdAt?: string;
}

interface ManagerDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  status?: string;
  createdAt?: string;
  agents?: AgentRow[];
  assignedLeads?: LeadRow[];
}

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

const getPersonId = (value?: PersonRef) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const AdminManagerOverviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState<ManagerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManagerOverview = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/users/manager/${id}`);
        setManager(response.data?.data || null);
      } catch (error) {
        console.error("Error loading manager overview:", error);
      } finally {
        setLoading(false);
      }
    };

    loadManagerOverview();
  }, [id]);

  const leads = manager?.assignedLeads || [];
  const agents = manager?.agents || [];
  const agentNameById = useMemo(
    () => new Map(agents.map((agent) => [agent._id, agent.name])),
    [agents],
  );

  const stats = {
    agents: agents.length,
    leads: leads.length,
    won: leads.filter((lead) => isWon(lead.status)).length,
    lost: leads.filter((lead) => isLost(lead.status)).length,
  };

  const getLeadAgentName = (lead: LeadRow) => {
    if (lead.assignedAgent && typeof lead.assignedAgent === "object") {
      return lead.assignedAgent.name || "Assigned Agent";
    }
    return agentNameById.get(getPersonId(lead.assignedAgent)) || "Not Assigned";
  };

  return (
    <AdminLayout>
      <div className="admin-drilldown-page">
        <button className="admin-drilldown-back" onClick={() => navigate("/admin/managers")}>
          <ArrowLeft size={18} />
          Back to Managers
        </button>

        {loading ? (
          <div className="admin-drilldown-empty">Loading manager details...</div>
        ) : (
          <>
            <div className="admin-drilldown-hero">
              <div className="admin-drilldown-avatar">
                <UsersRound size={34} />
              </div>
              <div>
                <h1>{manager?.name || "Manager Details"}</h1>
                <p>{manager?.department || "Management"}</p>
                <div className="admin-drilldown-meta">
                  <span><Mail size={15} /> {manager?.email || "N/A"}</span>
                  <span><Phone size={15} /> {manager?.phone || "N/A"}</span>
                  <span><CalendarDays size={15} /> {formatDate(manager?.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="admin-drilldown-stats">
              <div><strong>{stats.agents}</strong><span>Total Agents</span></div>
              <div><strong>{stats.leads}</strong><span>Total Leads</span></div>
              <div><strong>{stats.won}</strong><span>Won Leads</span></div>
              <div><strong>{stats.lost}</strong><span>Lost Leads</span></div>
            </div>

            <div className="admin-drilldown-card">
              <h2>Manager Agents</h2>
              {agents.length === 0 ? (
                <div className="admin-drilldown-empty">No agents assigned to this manager.</div>
              ) : (
                <div className="admin-agent-list">
                  {agents.map((agent) => (
                    <div className="admin-agent-mini-card" key={agent._id}>
                      <div className="admin-agent-mini-icon"><UserRound size={20} /></div>
                      <div>
                        <strong>{agent.name}</strong>
                        <span>{agent.email || "No email"}</span>
                      </div>
                      <em>{agent.status || "active"}</em>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-drilldown-card">
              <h2>Agent Lead Details</h2>
              {leads.length === 0 ? (
                <div className="admin-drilldown-empty">No leads assigned under this manager.</div>
              ) : (
                <div className="admin-drilldown-table-wrap">
                  <table className="admin-drilldown-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Lead</th>
                        <th>Agent</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Source</th>
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
                          <td>{getLeadAgentName(lead)}</td>
                          <td>{lead.phone || "N/A"}</td>
                          <td><span className="admin-drilldown-pill">{lead.status || "New"}</span></td>
                          <td>{lead.source || "N/A"}</td>
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

export default AdminManagerOverviewPage;
