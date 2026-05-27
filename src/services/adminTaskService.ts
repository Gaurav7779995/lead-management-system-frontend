import API from "../api/axiosInstance";

export type AdminTaskFilters = {
  search?: string;
  status?: string;
  priority?: string;
  assignedUser?: string;
  dueDate?: string;
  department?: string;
};

export const getAdminTasks = async (filters: AdminTaskFilters = {}) => {
  const res = await API.get("/admin/tasks", { params: filters });
  return res.data;
};

export const createAdminTask = async (payload: Record<string, any>) => {
  const res = await API.post("/admin/tasks", payload);
  return res.data;
};

export const updateAdminTask = async (taskId: string, payload: Record<string, any>) => {
  const res = await API.put(`/admin/tasks/${taskId}`, payload);
  return res.data;
};

export const deleteAdminTask = async (taskId: string) => {
  const res = await API.delete(`/admin/tasks/${taskId}`);
  return res.data;
};

export const addAdminTaskComment = async (taskId: string, text: string) => {
  const res = await API.post(`/admin/tasks/${taskId}/comments`, { text });
  return res.data;
};

export const uploadAdminTaskAttachment = async (taskId: string, file: File, voiceNote = false) => {
  const form = new FormData();
  form.append("attachment", file);
  form.append("voiceNote", String(voiceNote));
  const res = await API.post(`/admin/tasks/${taskId}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const exportAdminTasks = async (filters: AdminTaskFilters = {}) => {
  const res = await API.get("/admin/tasks/export", { params: filters, responseType: "blob" });
  const url = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `admin-task-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
