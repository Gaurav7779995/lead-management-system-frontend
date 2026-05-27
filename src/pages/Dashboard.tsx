import { useEffect, useState, useContext } from "react";
import { Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import { AuthContext } from "../components/context/AuthContext";
import Sidebar from "../organisms/DashboardSidebar/Sidebar";
import Navbar from "../organisms/DashboardNavbar/Navbar";
import AdminDashboard from "./admin/AdminDashboard";
import ManagerDashboard from "./manager/ManagerDashboard";
import AgentDashboard from "./agent/AgentDashboard";
import { getDashboardData } from "../services/dashboardService";
import { DASHBOARD_CACHE_TTL, getDashboardCacheKey } from "../utils/dashboardCache";
import "../assets/styles/Dashboard.css";

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const renderDashboardByRole = () => {
    if (loading) {
      return (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <Typography variant="h6">Loading dashboard...</Typography>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-error">
          <ErrorOutline className="error-icon" />
          <Typography variant="h6">Error loading dashboard</Typography>
          <Typography variant="body2">{error}</Typography>
          <button
            className="action-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <>
        {user?.role === "admin" && <AdminDashboard />}
        {user?.role === "manager" && (
          <ManagerDashboard data={dashboardData} user={user} />
        )}
        {user?.role === "agent" && (
          <AgentDashboard data={dashboardData} user={user} />
        )}
      </>
    );
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (user?.role === "agent") {
        setDashboardData(null);
        setLoading(false);
        return;
      }

      const cacheKey = getDashboardCacheKey(user?.role, user?.id);
      const cached = sessionStorage.getItem(cacheKey);
      let usedFreshCache = false;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < DASHBOARD_CACHE_TTL) {
            setDashboardData(parsed.data);
            setLoading(false);
            usedFreshCache = true;
          }
        } catch {
          sessionStorage.removeItem(cacheKey);
        }
      }

      try {
        const response = await getDashboardData();
        if (!isMounted) return;
        setError("");
        if (response.success) {
          setDashboardData(response.data);
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data: response.data, timestamp: Date.now() })
          );
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        if (!isMounted) return;
        if (!usedFreshCache) setError("Error connecting to server");
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const usesManagerPalette = user?.role === "manager" || user?.role === "admin";
  const usesAgentPalette = user?.role === "agent";

  return (
    <div className={`dashboard ${usesManagerPalette ? "manager-dashboard-shell" : ""} ${usesAgentPalette ? "agent-dashboard-shell" : ""}`}>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className={`dashboard-content ${usesManagerPalette ? "manager-dashboard-theme" : ""} ${usesAgentPalette ? "agent-dashboard-theme" : ""}`}>
          {renderDashboardByRole()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
