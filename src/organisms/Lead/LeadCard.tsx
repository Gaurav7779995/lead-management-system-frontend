import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lead } from "../../services/leadService";

type Props = {
  lead: Lead;
  refresh?: () => void;
};

const getLeadId = (lead: Lead) => {
  const rawId = lead._id || lead.id;

  if (typeof rawId === "string") return rawId;
  if (rawId && typeof rawId === "object" && "$oid" in rawId) {
    return String((rawId as { $oid?: string }).$oid || "");
  }

  return "";
};

const LeadCard = ({ lead }: Props) => {
  const navigate = useNavigate();
  const leadId = getLeadId(lead);
  const statusClass = lead.status?.replace(/_/g, "-") || "new";
  const leadInitial = lead.name?.trim()?.charAt(0)?.toUpperCase() || "L";
  const canOpenDetails = /^[a-f\d]{24}$/i.test(leadId);

  const openDetails = () => {
    if (canOpenDetails) {
      navigate(`/admin/leads/${leadId}`, { state: { lead } });
    }
  };

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
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
      role="button"
      tabIndex={canOpenDetails ? 0 : -1}
      style={{ cursor: canOpenDetails ? "pointer" : "default" }}
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
