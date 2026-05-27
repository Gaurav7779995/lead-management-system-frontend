import API from "../api/axiosInstance";

export type TaskFilters = {
  search?: string;
  status?: string;
  priority?: string;
  agent?: string;
  dueDate?: string;
  createdDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getManagerTasks = async (filters: TaskFilters) => {
  const res = await API.get("/manager/tasks", { params: filters });
  return res.data;
};

export const createManagerTask = async (payload: Record<string, any>) => {
  const res = await API.post("/manager/tasks", payload);
  return res.data;
};

export const updateManagerTask = async (taskId: string, payload: Record<string, any>) => {
  const res = await API.put(`/manager/tasks/${taskId}`, payload);
  return res.data;
};

export const deleteManagerTask = async (taskId: string) => {
  const res = await API.delete(`/manager/tasks/${taskId}`);
  return res.data;
};

export const addManagerTaskComment = async (taskId: string, text: string) => {
  const res = await API.post(`/manager/tasks/${taskId}/comments`, { text, isInternal: true });
  return res.data;
};

export const bulkManagerTaskAction = async (payload: {
  taskIds: string[];
  action: "delete" | "status" | "assign";
  payload?: Record<string, any>;
}) => {
  const res = await API.post("/manager/tasks/bulk", payload);
  return res.data;
};

export const exportManagerTasks = async (filters: TaskFilters) => {
  const res = await API.get("/manager/tasks/export", { params: filters, responseType: "blob" });
  const url = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
