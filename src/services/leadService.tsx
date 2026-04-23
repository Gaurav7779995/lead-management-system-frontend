import axiosInstance from "../api/axiosInstance";

// ================= TYPES ================= //

export interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  search?: string;
  isClosed?: boolean;
}

export interface LeadResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Lead[];
}

// ================= API FUNCTIONS ================= //

// ✅ GET LEADS (FILTER + PAGINATION + SEARCH)
export const getLeads = async (
  params: LeadQueryParams = {}
): Promise<LeadResponse> => {
  try {
    const response = await axiosInstance.get("/leads", {
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

// ✅ GET SINGLE LEAD
export const getLeadById = async (id: string): Promise<Lead> => {
  try {
    const response = await axiosInstance.get(`/leads/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    throw error;
  }
};

// ✅ CREATE LEAD
export const createLead = async (leadData: Partial<Lead>): Promise<Lead> => {
  try {
    const response = await axiosInstance.post("/leads", leadData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating lead:", error);
    throw error;
  }
};

// ✅ UPDATE LEAD
export const updateLead = async (
  id: string,
  leadData: Partial<Lead>
): Promise<Lead> => {
  try {
    const response = await axiosInstance.put(`/leads/${id}`, leadData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

// ✅ DELETE LEAD
export const deleteLead = async (id: string): Promise<string> => {
  try {
    const response = await axiosInstance.delete(`/leads/${id}`);
    return response.data.message;
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

// ✅ ADD NOTE TO LEAD
export const addNoteToLead = async (
  id: string,
  text: string
): Promise<Lead> => {
  try {
    const response = await axiosInstance.post(`/leads/${id}/notes`, {
      text,
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Error adding note:", error);
    throw error;
  }
};