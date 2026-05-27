import API from "../api/axiosInstance";

export const adminSettingsService = {
  overview: async () => (await API.get("/admin/settings")).data,
  updateProfile: async (payload: Record<string, any>) => (await API.put("/admin/settings/profile", payload)).data,
  changePassword: async (payload: Record<string, any>) => (await API.put("/admin/settings/password", payload)).data,
  uploadAsset: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return (await API.post("/admin/settings/assets", form, { headers: { "Content-Type": "multipart/form-data" } })).data;
  },
  updateSection: async (section: string, payload: Record<string, any>) =>
    (await API.put(`/admin/settings/sections/${section}`, payload)).data,
  createRole: async (payload: Record<string, any>) => (await API.post("/admin/settings/roles", payload)).data,
  createAdmin: async (payload: Record<string, any>) => (await API.post("/auth/register", { ...payload, role: "admin" })).data,
  updateRole: async (id: string, payload: Record<string, any>) => (await API.put(`/admin/settings/roles/${id}`, payload)).data,
  deleteRole: async (id: string) => (await API.delete(`/admin/settings/roles/${id}`)).data,
  updateUserStatus: async (id: string, status: string) => (await API.put(`/admin/settings/users/${id}/status`, { status })).data,
  resetUserPassword: async (id: string) => (await API.post(`/admin/settings/users/${id}/reset-password`)).data,
  createPipeline: async (payload: Record<string, any>) => (await API.post("/admin/settings/pipelines", payload)).data,
  updatePipeline: async (id: string, payload: Record<string, any>) => (await API.put(`/admin/settings/pipelines/${id}`, payload)).data,
  deletePipeline: async (id: string) => (await API.delete(`/admin/settings/pipelines/${id}`)).data,
  upsertIntegration: async (provider: string, payload: Record<string, any>) =>
    (await API.put(`/admin/settings/integrations/${provider}`, payload)).data,
  testEmail: async (to: string) => (await API.post("/admin/settings/email/test", { to })).data,
  importCsv: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return (await API.post("/admin/settings/data/import", form, { headers: { "Content-Type": "multipart/form-data" } })).data;
  },
  exportData: async () => (await API.get("/admin/settings/data/export")).data,
  createBackup: async (payload: Record<string, any>) => (await API.post("/admin/settings/backups", payload)).data,
  logs: async (params: Record<string, any>) => (await API.get("/admin/settings/logs", { params })).data,
};
