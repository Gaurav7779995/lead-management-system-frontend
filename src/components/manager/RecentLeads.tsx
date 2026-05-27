import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiMoreVertical, FiCalendar, FiPhone, FiMail } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import "./RecentLeads.css";

interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  assignedAgent?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const RecentLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "interested", label: "Interested" },
    { value: "qualified", label: "Qualified" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];

  const sourceOptions = [
    { value: "all", label: "All Sources" },
    { value: "manual", label: "Manual" },
    { value: "website", label: "Website" },
    { value: "facebook", label: "Facebook" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "referral", label: "Referral" },
    { value: "call", label: "Call" },
    { value: "whatsapp", label: "WhatsApp" },
  ];

  useEffect(() => {
    fetchLeads();
  }, [currentPage, statusFilter, sourceFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentPage === 1) {
        fetchLeads();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      if (sourceFilter !== "all") params.source = sourceFilter;

      const response = await axiosInstance.get("/manager/leads/recent", { params });
      setLeads(response.data.data.leads);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotal(response.data.data.pagination.total);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "#3b82f6",
      contacted: "#f59e0b",
      interested: "#8b5cf6",
      qualified: "#10b981",
      won: "#059669",
      lost: "#ef4444",
      not_interested: "#64748b",
      follow_up: "#06b6d4",
    };
    return colors[status] || "#64748b";
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      manual: "📝",
      website: "🌐",
      facebook: "📘",
      linkedin: "💼",
      referral: "👥",
      call: "📞",
      whatsapp: "💬",
      other: "📌",
    };
    return icons[source] || "📌";
  };

  if (loading) {
    return (
      <div className="recent-leads-loading">
        <div className="spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="recent-leads">
      <div className="leads-header">
        <h2>Recent Leads</h2>
        <div className="leads-controls">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-wrapper">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-wrapper">
            <FiFilter className="filter-icon" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Status</th>
              <th>Assigned Agent</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <motion.tr
                key={lead._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="lead-row"
              >
                <td className="lead-name-cell">
                  <div className="lead-name">{lead.name}</div>
                </td>
                <td className="lead-contact-cell">
                  {lead.email && (
                    <div className="contact-item">
                      <FiMail className="contact-icon" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="contact-item">
                      <FiPhone className="contact-icon" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </td>
                <td className="lead-source-cell">
                  <div className="source-badge">
                    <span className="source-icon">{getSourceIcon(lead.source)}</span>
                    <span className="source-name">{lead.source}</span>
                  </div>
                </td>
                <td className="lead-status-cell">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: `${getStatusColor(lead.status)}20`, color: getStatusColor(lead.status) }}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="lead-agent-cell">
                  {lead.assignedAgent ? (
                    <div className="agent-badge">
                      {lead.assignedAgent.name}
                    </div>
                  ) : (
                    <span className="unassigned">Unassigned</span>
                  )}
                </td>
                <td className="lead-date-cell">
                  <div className="date-info">
                    <FiCalendar className="date-icon" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="lead-actions-cell">
                  <button className="action-btn">
                    <FiMoreVertical />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <div className="no-leads">
          <p>No leads found matching your criteria</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
            Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages} ({total} total)
          </div>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentLeads;
