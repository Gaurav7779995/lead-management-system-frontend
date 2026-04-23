import API from "../api/axiosInstance";

export const getDashboardData = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};

export const getAgentPerformance = async () => {
  const res = await API.get("/agents/performance");
  return res.data;
};