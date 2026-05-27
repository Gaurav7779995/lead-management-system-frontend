import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getAgents, getManagers, User } from "../../api/user.api";
import axiosInstance from "../../api/axiosInstance";
import AgentHeader from "../../organisms/Agent/AgentHeader";
import {
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaSearch,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaTrophy,
  FaSpinner,
  FaPen,
  FaTrashAlt,
} from "react-icons/fa";

import "../../assets/styles/agent.css";
import "../../assets/styles/Dashboard.css";

interface EnrichedAgent extends User {
  managerName?: string;
  leadsCount?: number;
  wonLeads?: number;
  lostLeads?: number;
  inProgressLeads?: number;
  createdAt?: string;
  activeLeadsCount?: number;
  inactiveLeadsCount?: number;
}

interface Manager {
  _id: string;
  name: string;
}

const getId = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const isWonLead = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  return normalized === "won" || normalized === "converted";
};

const isLostLead = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  return normalized === "lost" || normalized === "not_interested";
};

const getLeadAgentId = (lead: any) => getId(lead?.assignedAgent);

const AgentPage = () => {
  const navigate = useNavigate();

  const [agents, setAgents] = useState<EnrichedAgent[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Agent details modal state
  const [selectedAgent, setSelectedAgent] = useState<EnrichedAgent | null>(null);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const [agentsData, managersData, allLeadsResponse] = await Promise.all([
        getAgents(),
        getManagers(),
        axiosInstance.get("/leads?limit=10000"),
      ]);

      const allLeads = allLeadsResponse.data.data || [];
      const leadsByAgent = allLeads.reduce((acc: Record<string, any[]>, lead: any) => {
        const assignedAgentId = getLeadAgentId(lead);
        if (!assignedAgentId) return acc;
        acc[assignedAgentId] = [...(acc[assignedAgentId] || []), lead];
        return acc;
      }, {});

      // Enrich agents with manager names and lead statistics
      const enrichedAgents: EnrichedAgent[] =
        agentsData.map((agent: User): EnrichedAgent => {
          const managerId = getId(agent.managerId);
          const managerFromAgent =
            typeof agent.managerId === "object" ? (agent.managerId as any) : null;
          const manager = managersData.find((m: Manager) => m._id === managerId);
          const agentLeads = leadsByAgent[agent._id] || [];
          const leadsCount = agentLeads.length;
          const wonLeads = agentLeads.filter((lead: any) => isWonLead(lead.status)).length;
          const lostLeads = agentLeads.filter((lead: any) => isLostLead(lead.status)).length;

          return {
            ...agent,
            managerName: managerFromAgent?.name || manager?.name || "Not Assigned",
            assignedLeadsCount: leadsCount,
            wonLeads,
            lostLeads,
          };
        });

      setAgents(enrichedAgents);
      setManagers(managersData);
      setTotalLeadsCount(allLeads.length);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= TOGGLE AGENT STATUS =================
  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const actionText = newStatus === "active" ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${actionText} this agent?`)) {
      return;
    }

    try {
      await axiosInstance.put(`/users/agent/${agentId}/status`, {
        status: newStatus,
      });

      alert(`✅ Agent ${actionText}d successfully`);
      await fetchData();
    } catch (error) {
      console.error("❌ Status toggle error:", error);
      alert(`Failed to ${actionText} agent`);
    }
  };

  // ================= DELETE AGENT =================
  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/agent/${agentId}`);
      alert("✅ Agent deleted successfully");
      await fetchData();
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Failed to delete agent");
    }
  };

  // ================= SHOW AGENT DETAILS MODAL =================
  const handleShowDetails = async (agent: EnrichedAgent) => {
    navigate(`/admin/agents/${agent._id}/leads`);
    return;

    setSelectedAgent(agent);
    setShowDetailsModal(true);
    setDetailsLoading(true);

    try {
      // Fetch detailed agent information including all leads
      const leadsResponse = await axiosInstance.get(`/leads?agentId=${agent._id}`);
      const leads = leadsResponse.data.data || [];

      setAgentDetails({
        ...agent,
        leads: leads,
      });
    } catch (error) {
      console.error("❌ Error fetching agent details:", error);
      alert("Failed to load agent details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAgent(null);
    setAgentDetails(null);
  };

  // ================= NAVIGATION =================
  const handleEditAgent = (id: string) => {
    navigate(`/admin/agents/${id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ================= FILTERING =================
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.managerName &&
        agent.managerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats for ALL agents (like Manager page)
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === "active" || !a.status).length;
  const inactiveAgents = agents.filter((a) => a.status === "inactive").length;
  const totalLeadsForAll = agents.reduce((acc, a) => acc + (a.assignedLeadsCount || 0), 0);
  const totalWonLeadsForAll = agents.reduce((acc, a) => acc + (a.wonLeads || 0), 0);
  const totalLostLeadsForAll = agents.reduce((acc, a) => acc + (a.lostLeads || 0), 0);

  // ================= UI =================
  return (
    <AdminLayout>
      <div className="agents-page">
        <AgentHeader refresh={fetchData} />

        {/* Statistics Cards */}
        <div className="agents-stats">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)",
              }}
            >
              <FaUsers />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalAgents}</div>
              <div className="stat-label">Total Agents</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
              }}
            >
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{activeAgents}</div>
              <div className="stat-label">Active Agents</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #F44336 0%, #FF5722 100%)",
              }}
            >
              <FaTimesCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{inactiveAgents}</div>
              <div className="stat-label">Inactive Agents</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)",
              }}
            >
              <FaBuilding />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalLeadsForAll}</div>
              <div className="stat-label">Total Leads</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #FF9800 0%, #FFC107 100%)",
              }}
            >
              <FaTrophy />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalWonLeadsForAll}</div>
              <div className="stat-label">Won Leads</div>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background:
                  "linear-gradient(135deg, #F44336 0%, #FF5722 100%)",
              }}
            >
              <FaTimesCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalLostLeadsForAll}</div>
              <div className="stat-label">Lost Leads</div>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="agents-table-section">
          <div className="table-header">
            <h2>All Agents</h2>
            <div className="filter-section">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "active" | "inactive")
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading agents...</div>
          ) : filteredAgents.length === 0 ? (
            <div className="empty-state">No agents found</div>
          ) : (
            <table className="agents-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Contact</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Leads Stats</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => {
                  return (
                    <tr
                      key={agent._id}
                      onClick={() => handleShowDetails(agent)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div
                          className="agent-name-cell"
                        >
                          <div className="agent-avatar">
                            {getInitials(agent.name)}
                          </div>
                          <div className="agent-info">
                            <div className="agent-name">{agent.name}</div>
                            <div className="agent-role">Agent</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <div className="contact-row">
                            <FaEnvelope />
                            <span>{agent.email}</span>
                          </div>
                          {agent.phone && (
                            <div className="contact-row">
                              <FaPhoneAlt className="phone-icon" />
                              <span>{agent.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="manager-cell">
                          {agent.managerName || "Not Assigned"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${agent.status}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(agent._id, agent.status || "active")
                          }}
                          style={{ cursor: "pointer" }}
                          title="Click to toggle status"
                        >
                          {agent.status === "active" ? (
                            <>
                              <FaCheckCircle /> Active
                            </>
                          ) : (
                            <>
                              <FaTimesCircle /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="leads-stats">
                          <div className="stat-item">
                            <span className="stat-total">
                              {agent.assignedLeadsCount || 0}
                            </span>
                            <span className="stat-label-small">Total</span>
                          </div>
                          <div className="stat-item won">
                            <span className="stat-won">
                              {agent.wonLeads || 0}
                            </span>
                            <span className="stat-label-small">Won</span>
                          </div>
                          <div className="stat-item lost">
                            <span className="stat-won" style={{ color: '#F44336' }}>
                              {agent.lostLeads || 0}
                            </span>
                            <span className="stat-label-small">Lost</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="date-cell">
                          {formatDate(agent.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            title="Edit Agent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAgent(agent._id);
                            }}
                          >
                            <FaPen />
                          </button>
                          <button
                            className="btn-delete"
                            title="Delete Agent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAgent(agent._id);
                            }}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* AGENT DETAILS MODAL */}
        {showDetailsModal && selectedAgent && (
          <div className="agent-details-overlay" onClick={closeDetailsModal}>
            <div
              className="agent-details-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="agent-details-header">
                <div className="agent-details-avatar">
                  {getInitials(selectedAgent.name)}
                </div>
                <div className="agent-details-title">
                  <h3>{selectedAgent.name}</h3>
                  <span className={`agent-role-badge ${selectedAgent.status}`}>
                    {selectedAgent.status === "active" ? "Active" : "Inactive"}{" "}
                    Agent
                  </span>
                </div>
                <button className="btn-close-modal" onClick={closeDetailsModal}>
                  <FaTimes />
                </button>
              </div>

              {detailsLoading ? (
                <div className="agent-details-loading">Loading details...</div>
              ) : (
                <div className="agent-details-content">
                  {/* Contact Information */}
                  <div className="details-section">
                    <h4>Contact Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <FaEnvelope className="detail-icon" />
                        <div>
                          <label>Email</label>
                          <span>{selectedAgent.email}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaPhoneAlt className="detail-icon" />
                        <div>
                          <label>Phone</label>
                          <span>{selectedAgent.phone || "N/A"}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaUserTie className="detail-icon" />
                        <div>
                          <label>Manager</label>
                          <span>
                            {selectedAgent.managerName || "Not Assigned"}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <div>
                          <label>Joined Date</label>
                          <span>{formatDate(selectedAgent.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Statistics */}
                  <div className="details-section">
                    <h4>Performance Statistics</h4>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <span className="stat-number">
                          {agentDetails?.leads?.length ||
                            selectedAgent.leadsCount ||
                            0}
                        </span>
                        <span className="stat-label">Total Leads</span>
                      </div>
                      <div className="stat-box won">
                        <span className="stat-number">
                          {selectedAgent.wonLeads || 0}
                        </span>
                        <span className="stat-label">Won Leads</span>
                      </div>
                      <div className="stat-box progress">
                        <span className="stat-number">
                          {selectedAgent.inProgressLeads || 0}
                        </span>
                        <span className="stat-label">In Progress</span>
                      </div>
                      <div className="stat-box lost">
                        <span className="stat-number">
                          {(
                            agentDetails?.leads?.length ||
                            selectedAgent.leadsCount ||
                            0
                          ) -
                            (selectedAgent.wonLeads || 0) -
                            (selectedAgent.inProgressLeads || 0)}
                        </span>
                        <span className="stat-label">Lost/Other</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Leads List */}
                  {agentDetails?.leads && agentDetails.leads.length > 0 && (
                    <div className="details-section">
                      <h4>Assigned Leads ({agentDetails.leads.length})</h4>
                      <div className="leads-list-detailed">
                        {agentDetails.leads.map((lead: any) => (
                          <div key={lead._id} className="lead-card-detailed">
                            <div className="lead-card-header">
                              <div className="lead-avatar-small">
                                {getInitials(lead.name)}
                              </div>
                              <div className="lead-header-info">
                                <span className="lead-name">{lead.name}</span>
                                <span className={`lead-status-badge ${lead.status}`}>
                                  {lead.status}
                                </span>
                              </div>
                            </div>
                            <div className="lead-details-grid">
                              <div className="lead-detail-field">
                                <label>Email</label>
                                <span>{lead.email || "N/A"}</span>
                              </div>
                              <div className="lead-detail-field">
                                <label>Phone</label>
                                <span>{lead.phone || "N/A"}</span>
                              </div>
                              <div className="lead-detail-field">
                                <label>Source</label>
                                <span className="source-badge">
                                  {lead.source}
                                </span>
                              </div>
                              <div className="lead-detail-field">
                                <label>Created</label>
                                <span>{formatDate(lead.createdAt)}</span>
                              </div>
                              {lead.company && (
                                <div className="lead-detail-field">
                                  <label>Company</label>
                                  <span>{lead.company}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Data Message */}
                  {(!agentDetails?.leads || agentDetails.leads.length === 0) && (
                    <div className="no-data-message">
                      <FaSpinner className="no-data-icon" />
                      <p>No leads assigned to this agent yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AgentPage;
