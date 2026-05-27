import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getManagers, getAgents, getManagerById } from "../../api/user.api";
import axiosInstance from "../../api/axiosInstance";
import ManagerHeader from "../../organisms/Manager/ManagerHeader";
import { FaUserTie, FaUsers, FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaPhoneAlt, FaEnvelope, FaCalendar, FaIdCard, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// CSS
import "../../assets/styles/manager.css";
import "../../assets/styles/Dashboard.css";

interface Manager {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  agentsCount?: number;
  assignedLeadsCount?: number;
  createdAt?: string;
  status?: string;
}

interface Agent {
  _id: string;
  name: string;
  status?: string;
  managerId?: string | { _id: string; name?: string; email?: string; role?: string };
}

const getAgentManagerId = (agent: Agent) => {
  if (!agent.managerId) return "";
  return typeof agent.managerId === "string" ? agent.managerId : agent.managerId._id;
};

const ManagerPage = () => {
  const navigate = useNavigate();

  const [managers, setManagers] = useState<Manager[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);
  const [unassignLoading, setUnassignLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});

  // Manager details modal state
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [managerDetails, setManagerDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const [managerData, agentData] = await Promise.all([
        getManagers(),
        getAgents(),
      ]);

      setManagers(managerData);
      setAgents(agentData);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= TOGGLE MANAGER STATUS =================
  const handleToggleStatus = async (managerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const actionText = newStatus === "active" ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${actionText} this manager?`)) {
      return;
    }

    try {
      await axiosInstance.put(`/users/manager/${managerId}/status`, {
        status: newStatus,
      });

      alert(`✅ Manager ${actionText}d successfully`);
      await fetchData();
    } catch (error: any) {
      console.error("❌ Toggle status error:", error);
      alert(error.response?.data?.message || `Failed to ${actionText} manager`);
    }
  };

  // ================= ASSIGN AGENT =================
  const handleAssignAgent = async (managerId: string) => {
    const agentId = selectedAgent[managerId];

    if (!agentId) {
      alert("Please select an agent");
      return;
    }

    // Find the selected agent
    const selectedAgentData = agents.find((a) => a._id === agentId);

    // Validation: Check if agent is already assigned to another manager
    const currentManagerId = selectedAgentData ? getAgentManagerId(selectedAgentData) : "";
    if (currentManagerId && currentManagerId !== managerId) {
      const currentManager = managers.find((m) => m._id === currentManagerId);
      alert(
        `❌ This agent is already assigned to manager "${currentManager?.name || 'Unknown'}".\n\n` +
        `Please reassign the agent from their current manager first.`
      );
      return;
    }

    try {
      setAssignLoading(managerId);

      await axiosInstance.put(`/users/agent/${agentId}/assign-manager`, {
        managerId,
      });

      alert("✅ Agent assigned successfully");

      await fetchData();
      setExpanded(null);
    } catch (error) {
      console.error("❌ Assign error:", error);
      alert("Failed to assign agent");
    } finally {
      setAssignLoading(null);
    }
  };

  // ================= UNASSIGN AGENT FROM MANAGER =================
  const handleUnassignAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`Are you sure you want to remove "${agentName}" from this manager?`)) {
      return;
    }

    try {
      setUnassignLoading(agentId);

      // Call API to remove managerId from agent (set to null)
      await axiosInstance.put(`/users/agent/${agentId}/assign-manager`, {
        managerId: null,
      });

      alert(`✅ "${agentName}" has been removed from the manager`);
      await fetchData();
    } catch (error) {
      console.error("❌ Unassign error:", error);
      alert("Failed to remove agent");
    } finally {
      setUnassignLoading(null);
    }
  };

  // ================= DELETE MANAGER =================
  const handleDeleteManager = async (managerId: string) => {
    if (!confirm("Are you sure you want to delete this manager?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/manager/${managerId}`);
      alert("✅ Manager deleted successfully");
      await fetchData();
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Failed to delete manager");
    }
  };

  // ================= SHOW MANAGER DETAILS MODAL =================
  const handleShowDetails = async (manager: Manager) => {
    navigate(`/admin/managers/${manager._id}/overview`);
    return;

    setSelectedManager(manager);
    setShowDetailsModal(true);
    setDetailsLoading(true);

    try {
      const details = await getManagerById(manager._id);
      setManagerDetails(details);
    } catch (error) {
      console.error("❌ Error fetching manager details:", error);
      alert("Failed to load manager details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedManager(null);
    setManagerDetails(null);
  };

  // ================= NAVIGATION =================
  const handleCardClick = (id: string) => {
    navigate(`/admin/managers/${id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= UI =================
  return (
    <AdminLayout>
      <div className="managers-page">
        <ManagerHeader refresh={fetchData} />

        <div className="managers-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <FaUserTie />
            </div>
            <div className="stat-content">
              <div className="stat-value">{managers.length}</div>
              <div className="stat-label">Total Managers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' }}>
              <FaUsers />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {managers.reduce((acc, m) => acc + (m.agentsCount || 0), 0)}
              </div>
              <div className="stat-label">Total Agents</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
              <FaBuilding />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {managers.reduce((acc, m) => acc + (m.assignedLeadsCount || 0), 0)}
              </div>
              <div className="stat-label">Total Leads</div>
            </div>
          </div>
        </div>

        <div className="managers-table-section">
          <div className="table-header">
            <h2>All Managers</h2>
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading managers...</div>
          ) : filteredManagers.length === 0 ? (
            <div className="empty-table-state">
              <p>No managers found</p>
            </div>
          ) : (
            <div className="professional-table-container">
              <table className="professional-table">
                <thead>
                  <tr>
                    <th>Manager</th>
                    <th>Contact</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Agents</th>
                    <th>Total Leads</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.map((m) => (
                    <tr
                      key={m._id}
                      onClick={() => handleShowDetails(m)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div className="manager-name-cell">
                          <div className="manager-avatar">
                            {getInitials(m.name)}
                          </div>
                          <div className="manager-info">
                            <div className="manager-name">{m.name}</div>
                            <div className="manager-role">Manager</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <div className="contact-row">
                            <FaEnvelope />
                            <span>{m.email}</span>
                          </div>
                          {m.phone && (
                            <div className="contact-row">
                              <FaPhoneAlt className="phone-icon" />
                              <span>{m.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="department-cell">{m.department || 'N/A'}</span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${m.status || 'active'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(m._id, m.status || 'active');
                          }}
                          style={{ cursor: "pointer" }}
                          title="Click to toggle status"
                        >
                          {(m.status || 'active') === "active" ? (
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
                        <span className="agents-count">{m.agentsCount || 0}</span>
                      </td>
                      <td>
                        <span className="leads-count">{m.assignedLeadsCount || 0}</span>
                      </td>
                      <td>
                        <span className="date-cell">{formatDate(m.createdAt)}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {(m.status === 'active' || !m.status) && (
                            <button
                              className="btn-assign-agent"
                              title="Assign Agent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(expanded === m._id ? null : m._id);
                              }}
                            >
                              <FaUsers />
                            </button>
                          )}
                          <button
                            className="btn-edit"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(m._id);
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-delete"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteManager(m._id);
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ASSIGN AGENT UI */}
              {expanded && (
                <div className="assign-overlay">
                  <div className="assign-modal">
                    <h3>Assign Agent to Manager</h3>
                    <select
                      value={selectedAgent[expanded] || ""}
                      onChange={(e) =>
                        setSelectedAgent({
                          ...selectedAgent,
                          [expanded]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Agent</option>
                      {agents
                        .filter((a) => a.status === "active") // Only show active agents
                        .map((a) => {
                          const assignedManagerId = getAgentManagerId(a);
                          const assignedManager = assignedManagerId ? managers.find((m) => m._id === assignedManagerId) : null;
                          const isAssignedToOther = Boolean(assignedManager && assignedManager._id !== expanded);

                          return (
                            <option
                              key={a._id}
                              value={a._id}
                              disabled={isAssignedToOther}
                              style={isAssignedToOther ? { color: '#999' } : {}}
                            >
                              {a.name}
                              {assignedManager
                                ? isAssignedToOther
                                  ? ` (Assigned to: ${assignedManager.name})`
                                  : ` (Currently assigned)`
                                : ` (Available)`}
                            </option>
                          );
                        })}
                    </select>

                    {/* CURRENTLY ASSIGNED AGENTS */}
                    {(() => {
                      const assignedToThisManager = agents.filter(
                        (a) => getAgentManagerId(a) === expanded
                      );

                      if (assignedToThisManager.length === 0) return null;

                      return (
                        <div className="assigned-agents-section">
                          <h4>Currently Assigned Agents ({assignedToThisManager.length})</h4>
                          <div className="assigned-agents-list">
                            {assignedToThisManager.map((agent) => (
                              <div key={agent._id} className="assigned-agent-item">
                                <div className="assigned-agent-info">
                                  <div className="assigned-agent-avatar">
                                    {getInitials(agent.name)}
                                  </div>
                                  <span className="assigned-agent-name">{agent.name}</span>
                                </div>
                                <button
                                  className="btn-remove-agent"
                                  onClick={() => handleUnassignAgent(agent._id, agent.name)}
                                  disabled={unassignLoading === agent._id}
                                  title="Remove agent from manager"
                                >
                                  {unassignLoading === agent._id ? "..." : <FaTrash />}
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="reassign-hint">
                            Click the trash icon to remove an agent. After removal, you can assign them to another manager.
                          </p>
                        </div>
                      );
                    })()}

                    <div className="assign-actions">
                      <button
                        className="btn-cancel"
                        onClick={() => setExpanded(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleAssignAgent(expanded)}
                        disabled={!selectedAgent[expanded] || assignLoading === expanded}
                      >
                        {assignLoading === expanded ? "Assigning..." : "Assign"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MANAGER DETAILS MODAL */}
        {showDetailsModal && selectedManager && (
          <div className="manager-details-overlay" onClick={closeDetailsModal}>
            <div className="manager-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="manager-details-header">
                <div className="manager-details-avatar">
                  {getInitials(selectedManager.name)}
                </div>
                <div className="manager-details-title">
                  <h3>{selectedManager.name}</h3>
                  <span className="manager-role-badge">Manager</span>
                </div>
                <button className="btn-close-modal" onClick={closeDetailsModal}>
                  <FaTimes />
                </button>
              </div>

              {detailsLoading ? (
                <div className="manager-details-loading">Loading details...</div>
              ) : (
                <div className="manager-details-content">
                  {/* Contact Information */}
                  <div className="details-section">
                    <h4>Contact Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <FaEnvelope className="detail-icon" />
                        <div>
                          <label>Email</label>
                          <span>{selectedManager.email}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaPhoneAlt className="detail-icon" />
                        <div>
                          <label>Phone</label>
                          <span>{selectedManager.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaIdCard className="detail-icon" />
                        <div>
                          <label>Department</label>
                          <span>{selectedManager.department || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <div>
                          <label>Joined Date</label>
                          <span>{formatDate(selectedManager.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="details-section">
                    <h4>Performance Statistics</h4>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <span className="stat-number">{managerDetails?.agents?.length || selectedManager.agentsCount || 0}</span>
                        <span className="stat-label">Total Agents</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-number">{managerDetails?.assignedLeads?.length || selectedManager.assignedLeadsCount || 0}</span>
                        <span className="stat-label">Assigned Leads</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Agents List */}
                  {managerDetails?.agents && managerDetails.agents.length > 0 && (
                    <div className="details-section">
                      <h4>Assigned Agents ({managerDetails.agents.length})</h4>
                      <div className="agents-list-detailed">
                        {managerDetails.agents.map((agent: any) => (
                          <div key={agent._id} className="agent-card-detailed">
                            <div className="agent-card-header">
                              <div className="agent-avatar-small">{getInitials(agent.name)}</div>
                              <div className="agent-header-info">
                                <span className="agent-name">{agent.name}</span>
                                <span className={`agent-status-badge ${agent.status || 'active'}`}>
                                  {agent.status || 'Active'}
                                </span>
                              </div>
                            </div>
                            <div className="agent-details-grid">
                              <div className="agent-detail-field">
                                <label>Email</label>
                                <span>{agent.email}</span>
                              </div>
                              <div className="agent-detail-field">
                                <label>Phone</label>
                                <span>{agent.phone || 'N/A'}</span>
                              </div>
                              <div className="agent-detail-field">
                                <label>Role</label>
                                <span className="role-badge">{agent.role}</span>
                              </div>
                              <div className="agent-detail-field">
                                <label>Joined</label>
                                <span>{formatDate(agent.createdAt)}</span>
                              </div>
                              {agent.department && (
                                <div className="agent-detail-field">
                                  <label>Department</label>
                                  <span>{agent.department}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Leads List */}
                  {managerDetails?.assignedLeads && managerDetails.assignedLeads.length > 0 && (
                    <div className="details-section">
                      <h4>Assigned Leads ({managerDetails.assignedLeads.length})</h4>
                      <div className="leads-list-detailed">
                        {managerDetails.assignedLeads.map((lead: any) => (
                          <div key={lead._id} className="lead-card-detailed">
                            <div className="lead-card-header">
                              <div className="lead-avatar-small">{getInitials(lead.name)}</div>
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
                                <span>{lead.email || 'N/A'}</span>
                              </div>
                              <div className="lead-detail-field">
                                <label>Phone</label>
                                <span>{lead.phone || 'N/A'}</span>
                              </div>
                              <div className="lead-detail-field">
                                <label>Source</label>
                                <span className="source-badge">{lead.source}</span>
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
                              {lead.notes && (
                                <div className="lead-detail-field full-width">
                                  <label>Notes</label>
                                  <span className="notes-text">{lead.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Data Messages */}
                  {(!managerDetails?.agents || managerDetails.agents.length === 0) && (
                    <div className="no-data-message">
                      <FaUsers className="no-data-icon" />
                      <p>No agents assigned to this manager yet.</p>
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

export default ManagerPage;





// import { useEffect, useState } from "react";
// import AdminLayout from "../../layouts/AdminLayout";
// import { getManagers, getAgents } from "../../api/user.api";
// import axiosInstance from "../../api/axiosInstance";
// import ManagerHeader from "../../organisms/Manager/ManagerHeader";

// // ✅ Import CSS
// import "../../assets/styles/manager.css";

// interface Manager {
//   _id: string;
//   name: string;
//   email: string;
//   agentsCount?: number;
//   assignedLeadsCount?: number;
// }

// interface Agent {
//   _id: string;
//   name: string;
// }

// const ManagerPage = () => {
//   const [managers, setManagers] = useState<Manager[]>([]);
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [assignLoading, setAssignLoading] = useState<string | null>(null);

//   // 🔽 Track dropdown + selected agent per manager
//   const [expanded, setExpanded] = useState<string | null>(null);
//   const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});

//   // ================= FETCH DATA =================
//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const [managerData, agentData] = await Promise.all([
//         getManagers(),
//         getAgents(),
//       ]);

//       setManagers(managerData);
//       setAgents(agentData);
//     } catch (error) {
//       console.error("❌ Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ================= ASSIGN AGENT =================
//   const handleAssignAgent = async (managerId: string) => {
//     const agentId = selectedAgent[managerId];

//     if (!agentId) {
//       alert("Please select an agent");
//       return;
//     }

//     try {
//       setAssignLoading(managerId);

//       await axiosInstance.put(`/users/${agentId}/assign-manager`, {
//         managerId,
//       });

//       // ✅ Better UX than alert (you can replace with toast later)
//       alert("✅ Agent assigned successfully");

//       await fetchData();
//       setExpanded(null);
//     } catch (error) {
//       console.error("❌ Assign error:", error);
//       alert("Failed to assign agent");
//     } finally {
//       setAssignLoading(null);
//     }
//   };

//   // ================= UI =================
//   return (
//     <AdminLayout>
//       <ManagerHeader refresh={fetchData} />

//       {/* <h2 className="page-title">Manager Management</h2>
//       <p className="page-subtitle">
//         Manage your team and assign agents efficiently
//       </p> */}

//       {loading ? (
//         <p>Loading managers...</p>
//       ) : managers.length === 0 ? (
//         <p className="no-data">No managers found</p>
//       ) : (
//         <div className="manager-grid">
//           {managers.map((m) => (
//             <div className="manager-card" key={m._id}>
//               {/* HEADER */}
//               <div className="card-header">
//                 <div className="avatar">
//                   {m.name.charAt(0).toUpperCase()}
//                 </div>

//                 <div className="manager-info">
//                   <h3>{m.name}</h3>
//                   <p>{m.email}</p>
//                 </div>
//               </div>

//               {/* BADGES */}
//               <div className="badges">
//                 <div className="badge">
//                   👥 {m.agentsCount || 0} Agents
//                 </div>
//                 <div className="badge">
//                   📌 {m.assignedLeadsCount || 0} Leads
//                 </div>
//               </div>

//               {/* ASSIGN BUTTON */}
//               <button
//                 className="assign-toggle"
//                 onClick={() =>
//                   setExpanded(expanded === m._id ? null : m._id)
//                 }
//               >
//                 {expanded === m._id ? "Close" : "Assign Agent"}
//               </button>

//               {/* ASSIGN UI */}
//               {expanded === m._id && (
//                 <div className="assign-box">
//                   {/* ✅ ACCESSIBILITY FIX */}
//                   <label
//                     htmlFor={`agent-select-${m._id}`}
//                     className="sr-only"
//                   >
//                     Select agent for {m.name}
//                   </label>

//                   <select
//                     id={`agent-select-${m._id}`}
//                     value={selectedAgent[m._id] || ""}
//                     onChange={(e) =>
//                       setSelectedAgent({
//                         ...selectedAgent,
//                         [m._id]: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="">Select Agent</option>
//                     {agents.map((a) => (
//                       <option key={a._id} value={a._id}>
//                         {a.name}
//                       </option>
//                     ))}
//                   </select>

//                   <button
//                     onClick={() => handleAssignAgent(m._id)}
//                     disabled={!selectedAgent[m._id] || assignLoading === m._id}
//                   >
//                     {assignLoading === m._id ? "Assigning..." : "Assign"}
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </AdminLayout>
//   );
// };

// export default ManagerPage;
