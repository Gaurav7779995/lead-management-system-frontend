import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiFilter, FiMoreVertical, FiTrendingUp, FiTrendingDown, FiClock } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import "./TeamPerformanceTable.css";

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  performance: {
    assignedLeads: number;
    convertedLeads: number;
    pendingLeads: number;
    activeFollowUps: number;
    conversionRate: number;
  };
  onlineStatus: string;
  lastActive: string;
}

const TeamPerformanceTable = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [sortField, setSortField] = useState<"name" | "convertedLeads" | "conversionRate">("convertedLeads");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchQuery, statusFilter, sortField, sortOrder]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/manager/agents");
      setAgents(response.data.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((agent) => agent.onlineStatus === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortField === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === "convertedLeads") {
        aValue = a.performance.convertedLeads;
        bValue = b.performance.convertedLeads;
      } else if (sortField === "conversionRate") {
        aValue = a.performance.conversionRate;
        bValue = b.performance.conversionRate;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAgents(filtered);
  };

  const handleSort = (field: "name" | "convertedLeads" | "conversionRate") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getPerformanceRank = (index: number) => {
    if (index === 0) return { rank: 1, color: "#ffd700" }; // Gold
    if (index === 1) return { rank: 2, color: "#c0c0c0" }; // Silver
    if (index === 2) return { rank: 3, color: "#cd7f32" }; // Bronze
    return { rank: index + 1, color: "#94a3b8" };
  };

  if (loading) {
    return (
      <div className="team-performance-loading">
        <div className="spinner"></div>
        <p>Loading team performance...</p>
      </div>
    );
  }

  return (
    <div className="team-performance-table">
      <div className="table-header">
        <h2>Team Performance</h2>
        <div className="table-controls">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th onClick={() => handleSort("name")} className="sortable">
                Agent Name
                {sortField === "name" && (
                  <span className="sort-icon">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th onClick={() => handleSort("convertedLeads")} className="sortable">
                Converted Leads
                {sortField === "convertedLeads" && (
                  <span className="sort-icon">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th>Pending Leads</th>
              <th>Active Follow-ups</th>
              <th onClick={() => handleSort("conversionRate")} className="sortable">
                Conversion Rate
                {sortField === "conversionRate" && (
                  <span className="sort-icon">{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((agent, index) => {
              const { rank, color } = getPerformanceRank(index);
              return (
                <motion.tr
                  key={agent._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="table-row"
                >
                  <td className="rank-cell">
                    <div
                      className="rank-badge"
                      style={{
                        backgroundColor: color,
                        color: index < 3 ? "#1e293b" : "white",
                      }}
                    >
                      {rank}
                    </div>
                  </td>
                  <td className="agent-cell">
                    <div className="agent-info">
                      <div className="agent-avatar">
                        {agent.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="agent-name">{agent.name}</div>
                        <div className="agent-email">{agent.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-value">{agent.performance.convertedLeads}</div>
                    <div className="metric-label">of {agent.performance.assignedLeads}</div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-value">{agent.performance.pendingLeads}</div>
                  </td>
                  <td className="metric-cell">
                    <div className="metric-value">{agent.performance.activeFollowUps}</div>
                  </td>
                  <td className="metric-cell">
                    <div
                      className={`conversion-rate ${
                        agent.performance.conversionRate >= 50 ? "high" : agent.performance.conversionRate >= 25 ? "medium" : "low"
                      }`}
                    >
                      {agent.performance.conversionRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="status-cell">
                    <div
                      className={`status-badge ${agent.onlineStatus === "online" ? "online" : "offline"}`}
                    >
                      <span className="status-dot"></span>
                      {agent.onlineStatus}
                    </div>
                  </td>
                  <td className="time-cell">
                    <div className="time-info">
                      <FiClock className="time-icon" />
                      {new Date(agent.lastActive).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn">
                      <FiMoreVertical />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAgents.length === 0 && (
        <div className="no-results">
          <p>No agents found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default TeamPerformanceTable;
