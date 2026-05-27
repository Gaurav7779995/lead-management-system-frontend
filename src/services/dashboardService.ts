import API from "../api/axiosInstance";

export const getDashboardData = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};

export const getAgentPerformance = async () => {
  const res = await API.get("/agents/performance");
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await API.get("/dashboard/stats");
  return res.data;
};

export const getDashboardCharts = async () => {
  const res = await API.get("/dashboard/charts");
  return res.data;
};

// New API endpoints for comprehensive dashboard
export const getTotalLeads = async () => {
  const res = await API.get("/dashboard/total-leads");
  return res.data;
};

export const getTotalManagers = async () => {
  const res = await API.get("/dashboard/total-managers");
  return res.data;
};

export const getTotalAgents = async () => {
  const res = await API.get("/dashboard/total-agents");
  return res.data;
};

export const getLeadPerformance = async () => {
  const res = await API.get("/dashboard/lead-performance");
  return res.data;
};

export const getManagerPerformance = async () => {
  const res = await API.get("/dashboard/manager-performance");
  return res.data;
};

export const getAgentPerformanceByManager = async (managerId: string) => {
  const res = await API.get(`/dashboard/manager/${managerId}/agents-performance`);
  return res.data;
};

export const getFollowupLeads = async () => {
  const res = await API.get("/dashboard/followup-leads");
  return res.data;
};

export const getRecentLeadsWithStatus = async () => {
  const res = await API.get("/dashboard/recent-leads");
  return res.data;
};

export const getManagers = async () => {
  try {
    const response = await API.get('/users/managers');
    return response.data;
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
};