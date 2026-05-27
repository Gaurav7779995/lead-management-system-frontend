import API from "../api/axiosInstance";

export type LeadViewMode = "table" | "kanban";

export interface ManagerLeadFilters {
  search?: string;
  status?: string;
  source?: string;
  priority?: string;
  agent?: string;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ManagerLead {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  priority?: "high" | "medium" | "low";
  leadScore?: "hot" | "warm" | "cold";
  assignedAgent?: { _id: string; name: string; email?: string };
  assignedManager?: { _id: string; name: string; email?: string };
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
  followUps?: Array<{ _id: string; date: string; note?: string; status: string }>;
}

const extractManagerLead = (payload: any): ManagerLead | null => {
  if (payload?.data?.lead) return payload.data.lead;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.lead) return payload.lead;
  if (payload?._id || payload?.id) return payload;
  return null;
};

export const getManagerLeadsCenter = async (filters: ManagerLeadFilters) => {
  const res = await API.get("/manager/leads", { params: filters });
  return res.data;
};

export const getManagerLeadById = async (leadId: string) => {
  const res = await API.get(`/manager/leads/${leadId}`);
  const lead = extractManagerLead(res.data);
  if (!lead) {
    throw new Error(res.data?.message || "Lead details not found");
  }
  return lead;
};

export const updateManagerLead = async (
  leadId: string,
  payload: Partial<ManagerLead>
) => {
  const res = await API.put(`/manager/leads/${leadId}`, payload);
  return res.data;
};

export const assignManagerLead = async (leadId: string, agentId: string) => {
  const res = await API.put(`/manager/leads/${leadId}/assign`, { agentId });
  return res.data;
};

export const addManagerLeadNote = async (leadId: string, text: string) => {
  const res = await API.post(`/manager/leads/${leadId}/notes`, { text });
  return res.data;
};

export const addManagerLeadFollowUp = async (
  leadId: string,
  payload: { date: string; note?: string; followUpType?: string }
) => {
  const res = await API.post(`/manager/leads/${leadId}/followups`, payload);
  return res.data;
};

export const runManagerLeadBulkAction = async (payload: {
  leadIds: string[];
  action: "assign" | "status" | "delete";
  payload?: Record<string, any>;
}) => {
  const res = await API.post("/manager/leads/bulk", payload);
  return res.data;
};

export const deleteManagerLead = async (leadId: string) => {
  const res = await API.delete(`/manager/leads/${leadId}`);
  return res.data;
};
