import API from "../api/axiosInstance";

export interface FollowUpFilters {
  search?: string;
  status?: string;
  type?: string;
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

export interface ManagerFollowUp {
  _id: string;
  lead?: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    company?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  scheduledDate: string;
  scheduledTime?: string;
  followUpType: string;
  priority: "high" | "medium" | "low";
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "missed"
    | "cancelled"
    | "rescheduled";
  reminderSent?: boolean;
  reminderTime?: string;
  reminderType?: string[];
  notes?: string;
  nextAction?: string;
  outcome?: string;
  missedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const getManagerFollowUpCenter = async (filters: FollowUpFilters) => {
  const res = await API.get("/manager/followups", { params: filters });
  return res.data;
};

export const getManagerFollowUpById = async (followUpId: string) => {
  const res = await API.get(`/manager/followups/${followUpId}`);
  return res.data;
};

export const createManagerFollowUp = async (payload: Record<string, any>) => {
  const res = await API.post("/manager/followups", payload);
  return res.data;
};

export const updateManagerFollowUp = async (
  followUpId: string,
  payload: Record<string, any>
) => {
  const res = await API.put(`/manager/followups/${followUpId}`, payload);
  return res.data;
};

export const addManagerFollowUpNote = async (
  followUpId: string,
  text: string
) => {
  const res = await API.post(`/manager/followups/${followUpId}/notes`, { text });
  return res.data;
};

export const runManagerFollowUpBulkAction = async (payload: {
  followUpIds: string[];
  action: "assign" | "status" | "reschedule" | "delete" | "reminder";
  payload?: Record<string, any>;
}) => {
  const res = await API.post("/manager/followups/bulk", payload);
  return res.data;
};

export const deleteManagerFollowUp = async (followUpId: string) => {
  const res = await API.delete(`/manager/followups/${followUpId}`);
  return res.data;
};
