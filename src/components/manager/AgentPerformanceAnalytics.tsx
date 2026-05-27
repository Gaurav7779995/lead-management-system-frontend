import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../../api/axiosInstance";
import "./AgentPerformanceAnalytics.css";

interface AgentPerformance {
  _id: string;
  name: string;
  totalLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  conversionRate: number;
}

interface MonthlyData {
  month: string;
  leads: number;
  converted: number;
}

interface StatusData {
  status: string;
  count: number;
}

const AgentPerformanceAnalytics = () => {
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<"bar" | "line" | "pie">("bar");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch agents for performance data
      const agentsResponse = await axiosInstance.get("/manager/agents");
      setAgents(agentsResponse.data.data);

      // For demo, generate monthly data (in real app, this would come from API)
      const demoMonthlyData = [
        { month: "Jan", leads: 45, converted: 12 },
        { month: "Feb", leads: 52, converted: 18 },
        { month: "Mar", leads: 38, converted: 15 },
        { month: "Apr", leads: 65, converted: 22 },
        { month: "May", leads: 58, converted: 25 },
        { month: "Jun", leads: 72, converted: 28 },
      ];
      setMonthlyData(demoMonthlyData);

      // Generate status distribution data
      const demoStatusData = [
        { status: "New", count: 45 },
        { status: "Contacted", count: 32 },
        { status: "Interested", count: 28 },
        { status: "Qualified", count: 18 },
        { status: "Won", count: 22 },
        { status: "Lost", count: 15 },
      ];
      setStatusData(demoStatusData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#667eea", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const chartTabs = [
    { id: "bar", label: "Agent Performance", icon: "📊" },
    { id: "line", label: "Monthly Trends", icon: "📈" },
    { id: "pie", label: "Lead Status", icon: "🥧" },
  ];

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="agent-performance-analytics">
      <div className="analytics-header">
        <h2>Performance Analytics</h2>
        <div className="chart-tabs">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              className={`chart-tab ${selectedChart === tab.id ? "active" : ""}`}
              onClick={() => setSelectedChart(tab.id as any)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={selectedChart}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="chart-container"
      >
        {selectedChart === "bar" && (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={agents.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis 
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "none",
                }}
              />
              <Legend />
              <Bar 
                dataKey="totalLeads" 
                name="Total Leads" 
                fill="#667eea" 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="convertedLeads" 
                name="Converted" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="pendingLeads" 
                name="Pending" 
                fill="#f59e0b" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {selectedChart === "line" && (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis 
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "none",
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="leads" 
                name="Total Leads" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: "#667eea", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="converted" 
                name="Converted" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {selectedChart === "pie" && (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  border: "none",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="summary-item">
          <span className="summary-label">Top Performer</span>
          <span className="summary-value">
            {agents.length > 0 ? agents[0].name : "N/A"}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Conversions</span>
          <span className="summary-value">
            {agents.reduce((acc, agent) => acc + agent.convertedLeads, 0)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Avg Conversion Rate</span>
          <span className="summary-value">
            {agents.length > 0
              ? (
                  agents.reduce((acc, agent) => acc + agent.conversionRate, 0) /
                  agents.length
                ).toFixed(1)
              : "0"}%
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Active Agents</span>
          <span className="summary-value">{agents.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentPerformanceAnalytics;
