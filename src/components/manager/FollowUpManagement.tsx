import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiPhone, FiVideo, FiMessageSquare, FiChevronDown, FiFilter } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import "./FollowUpManagement.css";

interface FollowUp {
  _id: string;
  leadId: string;
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  agentName: string;
  agentId: string;
  date: string;
  note: string;
  status: "pending" | "completed" | "missed";
  type: "today" | "missed" | "upcoming";
}

const FollowUpManagement = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "today" | "missed" | "upcoming">("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFollowUps();
  }, [filterType]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/manager/followups", {
        params: { type: filterType },
      });
      setFollowUps(response.data.data);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FiClock />;
      case "completed":
        return <FiCalendar />;
      case "missed":
        return <FiClock />;
      default:
        return <FiClock />;
    }
  };

  const getMeetingIcon = (note: string) => {
    const lowerNote = note.toLowerCase();
    if (lowerNote.includes("call") || lowerNote.includes("phone")) {
      return <FiPhone />;
    } else if (lowerNote.includes("video") || lowerNote.includes("zoom") || lowerNote.includes("meet")) {
      return <FiVideo />;
    } else if (lowerNote.includes("message") || lowerNote.includes("text") || lowerNote.includes("whatsapp")) {
      return <FiMessageSquare />;
    }
    return <FiCalendar />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const groupFollowUpsByDate = (followUps: FollowUp[]) => {
    const groups: Record<string, FollowUp[]> = {};
    
    followUps.forEach(followUp => {
      const date = new Date(followUp.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(followUp);
    });

    return Object.entries(groups).sort((a, b) => 
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
  };

  if (loading) {
    return (
      <div className="followup-loading">
        <div className="spinner"></div>
        <p>Loading follow-ups...</p>
      </div>
    );
  }

  const groupedFollowUps = groupFollowUpsByDate(followUps);

  return (
    <div className="followup-management">
      <div className="followup-header">
        <h2>Follow-up Management</h2>
        <div className="filter-controls">
          <FiFilter className="filter-icon" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Follow-ups</option>
            <option value="today">Today's</option>
            <option value="missed">Missed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      <div className="followup-timeline">
        {groupedFollowUps.length === 0 ? (
          <div className="no-followups">
            <p>No follow-ups found</p>
          </div>
        ) : (
          groupedFollowUps.map(([date, dateFollowUps], groupIndex) => (
            <div key={date} className="timeline-group">
              <div className="timeline-date">
                <div className="date-badge">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div className="timeline-items">
                {dateFollowUps.map((followUp, index) => (
                  <motion.div
                    key={followUp._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                    className={`followup-card ${followUp.status} ${expandedCards.has(followUp._id) ? 'expanded' : ''}`}
                  >
                    <div className="followup-card-header" onClick={() => toggleCard(followUp._id)}>
                      <div className="followup-left">
                        <div className={`followup-icon ${followUp.status}`}>
                          {getStatusIcon(followUp.status)}
                        </div>
                        <div className="followup-info">
                          <div className="followup-lead">{followUp.leadName}</div>
                          <div className="followup-agent">{followUp.agentName}</div>
                        </div>
                      </div>
                      <div className="followup-right">
                        <div className="followup-time">
                          {formatDate(followUp.date)}
                        </div>
                        <div className={`followup-status ${followUp.status}`}>
                          {followUp.status}
                        </div>
                        <FiChevronDown className={`expand-icon ${expandedCards.has(followUp._id) ? 'rotated' : ''}`} />
                      </div>
                    </div>

                    {expandedCards.has(followUp._id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="followup-details"
                      >
                        <div className="detail-row">
                          <div className="detail-label">
                            <FiCalendar /> Date & Time
                          </div>
                          <div className="detail-value">
                            {new Date(followUp.date).toLocaleString()}
                          </div>
                        </div>

                        {followUp.leadPhone && (
                          <div className="detail-row">
                            <div className="detail-label">
                              <FiPhone /> Phone
                            </div>
                            <div className="detail-value">{followUp.leadPhone}</div>
                          </div>
                        )}

                        {followUp.leadEmail && (
                          <div className="detail-row">
                            <div className="detail-label">
                              <FiMessageSquare /> Email
                            </div>
                            <div className="detail-value">{followUp.leadEmail}</div>
                          </div>
                        )}

                        {followUp.note && (
                          <div className="detail-row">
                            <div className="detail-label">
                              {getMeetingIcon(followUp.note)} Note
                            </div>
                            <div className="detail-value note">{followUp.note}</div>
                          </div>
                        )}

                        <div className="followup-actions">
                          <button className="action-btn complete">
                            Mark Complete
                          </button>
                          <button className="action-btn reschedule">
                            Reschedule
                          </button>
                          <button className="action-btn cancel">
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Cards */}
      <div className="followup-summary">
        <div className="summary-card today">
          <div className="summary-icon">
            <FiCalendar />
          </div>
          <div className="summary-content">
            <h3>Today</h3>
            <p>{followUps.filter(f => f.type === 'today').length}</p>
          </div>
        </div>
        <div className="summary-card missed">
          <div className="summary-icon">
            <FiClock />
          </div>
          <div className="summary-content">
            <h3>Missed</h3>
            <p>{followUps.filter(f => f.type === 'missed').length}</p>
          </div>
        </div>
        <div className="summary-card upcoming">
          <div className="summary-icon">
            <FiCalendar />
          </div>
          <div className="summary-content">
            <h3>Upcoming</h3>
            <p>{followUps.filter(f => f.type === 'upcoming').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpManagement;
