import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiUser, FiBriefcase, FiCheckCircle, FiXCircle, FiCalendar, FiPhone, FiMessageSquare, FiFilter } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import "./ActivityTimeline.css";

interface Activity {
  _id: string;
  type: string;
  message: string;
  leadName: string;
  leadId: string;
  agentName: string;
  agentEmail: string;
  meta?: any;
  createdAt: string;
}

const ActivityTimeline = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchActivities();
  }, [filterType]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/manager/activity", {
        params: { limit: 20 },
      });
      setActivities(response.data.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "created":
        return <FiBriefcase />;
      case "status_changed":
        return <FiCheckCircle />;
      case "assigned":
        return <FiUser />;
      case "note_added":
        return <FiMessageSquare />;
      case "follow_up_added":
        return <FiCalendar />;
      case "call_logged":
        return <FiPhone />;
      case "meeting_scheduled":
        return <FiCalendar />;
      case "closed":
        return <FiXCircle />;
      default:
        return <FiClock />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "created":
        return "#3b82f6";
      case "status_changed":
        return "#10b981";
      case "assigned":
        return "#8b5cf6";
      case "note_added":
        return "#f59e0b";
      case "follow_up_added":
        return "#06b6d4";
      case "call_logged":
        return "#ec4899";
      case "meeting_scheduled":
        return "#6366f1";
      case "closed":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filterActivities = () => {
    if (filterType === "all") return activities;
    return activities.filter(activity => activity.type === filterType);
  };

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "created", label: "New Leads" },
    { value: "status_changed", label: "Status Changes" },
    { value: "assigned", label: "Assignments" },
    { value: "note_added", label: "Notes" },
    { value: "follow_up_added", label: "Follow-ups" },
  ];

  if (loading) {
    return (
      <div className="activity-timeline-loading">
        <div className="spinner"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  const filteredActivities = filterActivities();

  return (
    <div className="activity-timeline">
      <div className="activity-header">
        <h2>Activity Timeline</h2>
        <div className="filter-controls">
          <FiFilter className="filter-icon" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="timeline-container">
        {filteredActivities.length === 0 ? (
          <div className="no-activities">
            <p>No activities found</p>
          </div>
        ) : (
          <div className="timeline">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="timeline-item"
              >
                <div
                  className="timeline-icon"
                  style={{ backgroundColor: `${getActivityColor(activity.type)}20`, color: getActivityColor(activity.type) }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-time">{formatTime(activity.createdAt)}</div>
                  </div>
                  <div className="timeline-details">
                    <div className="detail-item">
                      <FiUser className="detail-icon" />
                      <span className="detail-label">Lead:</span>
                      <span className="detail-value">{activity.leadName}</span>
                    </div>
                    <div className="detail-item">
                      <FiBriefcase className="detail-icon" />
                      <span className="detail-label">Agent:</span>
                      <span className="detail-value">{activity.agentName}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
