import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lead } from "../../services/leadService";

type Props = {
  lead: Lead;
  refresh?: () => void;
};

const LeadCard = ({ lead }: Props) => {
  const navigate = useNavigate();
  const leadId = lead._id || lead.id;
  const statusClass = lead.status?.replace(/_/g, "-") || "new";
  const leadInitial = lead.name?.trim()?.charAt(0)?.toUpperCase() || "L";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "status-blue";
      case "contacted":
      case "proposal-sent":
      case "negotiation":
        return "status-amber";
      case "interested":
      case "qualified":
        return "status-cyan";
      case "won":
        return "status-green";
      case "lost":
      case "not-interested":
        return "status-red";
      default:
        return "status-gray";
    }
  };

  return (
    <motion.div
      className="lead-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => leadId && navigate(`/admin/leads/${leadId}`)}
      style={{ cursor: leadId ? "pointer" : "default" }}
    >
      {/* Header: Avatar + Status */}
      <div className="lead-card-header">
        <div className="lead-avatar">{leadInitial}</div>
        <div className="lead-header-info">
          <span className={`status-badge ${getStatusColor(lead.status)}`}>
            <span className="status-dot"></span>
            {lead.status?.replace(/_/g, " ") || "New"}
          </span>
          <span className="lead-date">{formatDate(lead.createdAt)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="lead-card-body">
        <h3 className="lead-name">{lead.name}</h3>
        <p className="lead-title">{lead.email || lead.phone || "No contact info"}</p>
      </div>

      {/* Footer: Source + Open/Closed */}
      <div className="lead-card-footer">
        <span className="source-pill">{lead.source || "Unknown"}</span>
        <span className={`state-indicator ${lead.isClosed ? "closed" : "open"}`}>
          {lead.isClosed ? "Closed" : "Active"}
        </span>
      </div>
    </motion.div>
  );
};

export default LeadCard;
