import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiBriefcase, FiTrendingUp, FiClock, FiDollarSign, FiPieChart } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import "./AgentLeadAnalytics.css";

interface AgentAnalytics {
  agent: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
  };
  analytics: {
    totalLeads: number;
    convertedLeads: number;
    pendingLeads: number;
    lostLeads: number;
    revenueGenerated: number;
    conversionRate: number;
    leadsBySource: Record<string, number>;
    todayFollowUps: number;
    missedFollowUps: number;
  };
  recentLeads: any[];
}

interface AgentLeadAnalyticsProps {
  agentId: string;
  onBack: () => void;
}

const AgentLeadAnalytics = ({ agentId, onBack }: AgentLeadAnalyticsProps) => {
  const [data, setData] = useState<AgentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentAnalytics();
  }, [agentId]);

  const fetchAgentAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/manager/agents/${agentId}`);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching agent analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="agent-analytics-loading">
        <div className="spinner"></div>
        <p>Loading agent analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="agent-analytics-error">
        <p>Failed to load agent analytics</p>
        <button onClick={onBack} className="back-btn">
          <FiArrowLeft /> Back to Team
        </button>
      </div>
    );
  }

  const { agent, analytics } = data;

  const sourceColors: Record<string, string> = {
    manual: "#667eea",
    website: "#3b82f6",
    facebook: "#1877f2",
    linkedin: "#0a66c2",
    referral: "#10b981",
    call: "#f59e0b",
    whatsapp: "#25d366",
    other: "#64748b",
  };

  return (
    <div className="agent-lead-analytics">
      <div className="analytics-header">
        <button onClick={onBack} className="back-btn">
          <FiArrowLeft /> Back to Team
        </button>
        <div className="agent-header-info">
          <div className="agent-avatar-large">
            {agent.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1>{agent.name}</h1>
            <p className="agent-email">{agent.email}</p>
            <p className="agent-phone">{agent.phone}</p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analytics-cards">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="analytics-card total"
        >
          <div className="card-icon">
            <FiBriefcase />
          </div>
          <div className="card-content">
            <h3>Total Leads</h3>
            <p className="card-value">{analytics.totalLeads}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="analytics-card converted"
        >
          <div className="card-icon">
            <FiTrendingUp />
          </div>
          <div className="card-content">
            <h3>Converted</h3>
            <p className="card-value">{analytics.convertedLeads}</p>
            <span className="card-rate">{analytics.conversionRate.toFixed(1)}% rate</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="analytics-card pending"
        >
          <div className="card-icon">
            <FiClock />
          </div>
          <div className="card-content">
            <h3>Pending</h3>
            <p className="card-value">{analytics.pendingLeads}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="analytics-card revenue"
        >
          <div className="card-icon">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <h3>Revenue</h3>
            <p className="card-value">${analytics.revenueGenerated.toLocaleString()}</p>
          </div>
        </motion.div>
      </div>

      {/* Lead Source Analytics */}
      <div className="source-analytics">
        <h2>
          <FiPieChart /> Lead Source Distribution
        </h2>
        <div className="source-grid">
          {Object.entries(analytics.leadsBySource).map(([source, count]) => (
            <motion.div
              key={source}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="source-item"
            >
              <div
                className="source-bar"
                style={{
                  backgroundColor: sourceColors[source] || sourceColors.other,
                  width: `${(count / analytics.totalLeads) * 100}%`,
                }}
              ></div>
              <div className="source-info">
                <span className="source-name">{source}</span>
                <span className="source-count">{count}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Follow-up Analytics */}
      <div className="followup-analytics">
        <h2>
          <FiClock /> Follow-up Status
        </h2>
        <div className="followup-cards">
          <div className="followup-card today">
            <div className="followup-icon">
              <FiClock />
            </div>
            <div className="followup-content">
              <h3>Today's Follow-ups</h3>
              <p className="followup-value">{analytics.todayFollowUps}</p>
            </div>
          </div>
          <div className="followup-card missed">
            <div className="followup-icon">
              <FiClock />
            </div>
            <div className="followup-content">
              <h3>Missed Follow-ups</h3>
              <p className="followup-value">{analytics.missedFollowUps}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="recent-leads">
        <h2>Recent Leads</h2>
        <div className="leads-list">
          {data.recentLeads.slice(0, 5).map((lead) => (
            <motion.div
              key={lead._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lead-item"
            >
              <div className="lead-info">
                <div className="lead-name">{lead.name}</div>
                <div className="lead-contact">
                  {lead.email && <span>{lead.email}</span>}
                  {lead.phone && <span>{lead.phone}</span>}
                </div>
              </div>
              <div className="lead-status">
                <span className={`status-badge ${lead.status}`}>{lead.status}</span>
              </div>
              <div className="lead-date">
                {new Date(lead.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentLeadAnalytics;
