import { motion } from "framer-motion";
import { FiUsers, FiBriefcase, FiCalendar, FiTrendingUp, FiActivity, FiClock } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { useEffect, useState } from "react";
import "./AgentSummaryCards.css";

interface SummaryData {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  totalLeads: number;
  activeLeads: number;
  inactiveLeads: number;
  totalFollowUps: number;
  totalNotifications: number;
}

interface GrowthData {
  leadsGrowth: number;
  agentsGrowth: number;
}

interface DashboardSummary {
  summary: SummaryData;
  growth: GrowthData;
}

const AgentSummaryCards = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      const response = await axiosInstance.get("/manager/dashboard/summary");
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      id: "total-agents",
      title: "Total Agents",
      value: data?.summary.totalAgents || 0,
      icon: FiUsers,
      color: "purple",
      growth: data?.growth.agentsGrowth || 0,
      subtitle: `${data?.summary.inactiveAgents || 0} inactive`
    },
    {
      id: "active-agents",
      title: "Active Agents",
      value: data?.summary.activeAgents || 0,
      icon: FiActivity,
      color: "blue",
      growth: null,
      subtitle: "Currently online"
    },
    {
      id: "total-leads",
      title: "Total Leads",
      value: data?.summary.totalLeads || 0,
      icon: FiBriefcase,
      color: "green",
      growth: data?.growth.leadsGrowth || 0,
      subtitle: "All time"
    },
    {
      id: "active-leads",
      title: "Active Leads",
      value: data?.summary.activeLeads || 0,
      icon: FiTrendingUp,
      color: "orange",
      growth: null,
      subtitle: `${data?.summary.inactiveLeads || 0} inactive`
    },
    {
      id: "follow-ups",
      title: "Today's Follow-ups",
      value: data?.summary.totalFollowUps || 0,
      icon: FiCalendar,
      color: "red",
      growth: null,
      subtitle: "Scheduled today"
    },
    {
      id: "notifications",
      title: "Notifications",
      value: data?.summary.totalNotifications || 0,
      icon: FiClock,
      color: "indigo",
      growth: null,
      subtitle: "Pending actions"
    }
  ];

  if (loading) {
    return (
      <div className="summary-cards-loading">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="summary-card-skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-value"></div>
              <div className="skeleton-subtitle"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="agent-summary-cards">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`summary-card ${card.color}`}
          whileHover={{ 
            y: -8,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)"
          }}
        >
          <div className={`card-icon ${card.color}`}>
            <card.icon />
          </div>
          <div className="card-content">
            <h3>{card.title}</h3>
            <p className="card-value">{card.value.toLocaleString()}</p>
            {card.growth !== null && (
              <span className={`card-growth ${card.growth >= 0 ? 'positive' : 'negative'}`}>
                {card.growth >= 0 ? '+' : ''}{card.growth.toFixed(1)}% this month
              </span>
            )}
            {card.subtitle && (
              <span className="card-subtitle">{card.subtitle}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AgentSummaryCards;
