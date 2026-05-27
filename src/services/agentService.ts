import axiosInstance from "../api/axiosInstance";

export const getAgentDashboard = async () => {
  const response = await axiosInstance.get("/agent/dashboard");
  return response.data;
};

export const getAgentLeads = async (params = {}) => {
  const response = await axiosInstance.get("/agent/leads", { params });
  return response.data;
};

export const getAgentLeadDetails = async (leadId: string) => {
  const response = await axiosInstance.get(`/agent/leads/${leadId}`);
  return response.data;
};

export const getAgentLeadExport = async (params = {}) => {
  const response = await axiosInstance.get("/agent/leads/export/all", { params });
  return response.data;
};

export const updateAgentLeadStatus = async (leadId: string, status: string) => {
  const response = await axiosInstance.patch(`/agent/leads/${leadId}/status`, { status });
  return response.data;
};

export const addAgentLeadNote = async (leadId: string, text: string) => {
  const response = await axiosInstance.post(`/agent/leads/${leadId}/notes`, { text });
  return response.data;
};

export const scheduleAgentLeadFollowup = async (leadId: string, payload: any) => {
  const response = await axiosInstance.post(`/agent/leads/${leadId}/followups`, payload);
  return response.data;
};

export const addAgentCallSummary = async (leadId: string, payload: any) => {
  const response = await axiosInstance.post(`/agent/leads/${leadId}/calls`, payload);
  return response.data;
};

export const addAgentLeadDocument = async (leadId: string, payload: any) => {
  const response = await axiosInstance.post(`/agent/leads/${leadId}/documents`, payload);
  return response.data;
};

export const getAgentFollowups = async (params = {}) => {
  const response = await axiosInstance.get("/agent/followups", { params });
  return response.data;
};

export const createAgentFollowup = async (payload: any) => {
  const response = await axiosInstance.post("/agent/followups", payload);
  return response.data;
};

export const updateAgentFollowup = async (followupId: string, payload: any) => {
  const response = await axiosInstance.put(`/agent/followups/${followupId}`, payload);
  return response.data;
};

export const deleteAgentFollowup = async (followupId: string) => {
  const response = await axiosInstance.delete(`/agent/followups/${followupId}`);
  return response.data;
};

export const getAgentTasks = async () => {
  const response = await axiosInstance.get("/agent/tasks");
  return response.data;
};

export const updateAgentTaskStatus = async (taskId: string, status: string) => {
  const response = await axiosInstance.patch(`/agent/tasks/${taskId}/status`, { status });
  return response.data;
};

export const addAgentTaskNote = async (taskId: string, text: string) => {
  const response = await axiosInstance.post(`/agent/tasks/${taskId}/notes`, { text });
  return response.data;
};

export const addAgentTaskFile = async (taskId: string, payload: any) => {
  const response = await axiosInstance.post(`/agent/tasks/${taskId}/files`, payload);
  return response.data;
};

export const getAgentReports = async () => {
  const response = await axiosInstance.get("/agent/reports");
  return response.data;
};

export const getAgentNotifications = async (params = {}) => {
  const response = await axiosInstance.get("/agent/notifications", { params });
  return response.data;
};

export const markAgentNotificationRead = async (notificationId: string) => {
  const response = await axiosInstance.put(`/agent/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAgentNotificationsRead = async () => {
  const response = await axiosInstance.put("/agent/notifications/read-all");
  return response.data;
};

export const deleteAgentNotification = async (notificationId: string) => {
  const response = await axiosInstance.delete(`/agent/notifications/${notificationId}`);
  return response.data;
};
