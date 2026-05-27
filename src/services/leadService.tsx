import axiosInstance from "../api/axiosInstance";

// ================= TYPES ================= //
export interface Lead {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  assignedManager?: any;
  assignedAgent?: any;

  notes?: { text: string }[];

  // ✅ ADD THIS
  note?: string;

  timeline?: {
    type: string;
    message: string;
    time: string;
    addedBy?: { name: string };
  }[];
  
  isClosed: boolean;
  reassignmentRequested?: boolean;
  reassignmentReason?: string;
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

// ✅ FIXED RESPONSE TYPE (MATCH BACKEND)
export interface LeadResponse {
  success: boolean;
  count: number;
  data: Lead[];
}

const extractLeadList = (payload: any): Lead[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.leads)) return payload.data.leads;
  if (Array.isArray(payload?.leads)) return payload.leads;
  if (Array.isArray(payload)) return payload;
  return [];
};

const extractLead = (payload: any): Lead | null => {
  if (payload?.data?.lead) return payload.data.lead;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.lead) return payload.lead;
  if (payload?._id || payload?.id) return payload;
  return null;
};

// ================= API FUNCTIONS ================= //

// ✅ GET LEADS
export const getLeads = async (
  params: LeadQueryParams = {}
): Promise<LeadResponse> => {
  try {
    const response = await axiosInstance.get("/leads", {
      params,
    });

    return {
      ...(response.data || {}),
      data: extractLeadList(response.data),
    };
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    throw error;
  }
};

// ✅ GET SINGLE LEAD
export const getLeadById = async (id: string): Promise<Lead> => {
  try {
    const response = await axiosInstance.get(`/leads/${id}`);
    const lead = extractLead(response.data);
    if (!lead) {
      throw new Error(response.data?.message || "Lead details not found");
    }
    return lead;
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

// ⚠️ DELETE (ONLY IF BACKEND EXISTS)
export const deleteLead = async (id: string): Promise<string> => {
  try {
    const response = await axiosInstance.delete(`/leads/${id}`);
    return response.data.message;
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

// ⚠️ ASSIGN (ONLY IF BACKEND EXISTS)
export const assignLead = async (
  id: string,
  assignData: { userId: string; role: string }
): Promise<Lead> => {
  try {
    const response = await axiosInstance.post(`/leads/${id}/assign`, assignData);
    return response.data.data;
  } catch (error: any) {
    console.error("Error assigning lead:", error);
    throw error;
  }
};

// ⚠️ ADD NOTE (ONLY IF BACKEND EXISTS)
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

// ✅ ADD CALL LOG
export const addCallLog = async (
  id: string,
  data: { callType: string; duration: number; status: string; note: string }
): Promise<Lead> => {
  try {
    const response = await axiosInstance.post(`/leads/${id}/call`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error adding call log:", error);
    throw error;
  }
};

// ✅ ADD FOLLOW-UP
export const addFollowUp = async (
  id: string,
  data: { date: string; note: string }
): Promise<Lead> => {
  try {
    const response = await axiosInstance.post(`/leads/${id}/followup`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error adding follow-up:", error);
    throw error;
  }
};

// ✅ ADD MEETING
export const addMeeting = async (
  id: string,
  data: { title: string; date: string; location: string; description: string }
): Promise<Lead> => {
  try {
    const response = await axiosInstance.post(`/leads/${id}/meeting`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error adding meeting:", error);
    throw error;
  }
};


// import axiosInstance from "../api/axiosInstance";

// // ================= TYPES ================= //

// export interface Lead {
//   _id: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   source: string;
//   status: string;
//   assignedManager?: string | null;
//   assignedAgent?: string | null;
//   notes?: { text: string }[];
//   isClosed: boolean;
//   reassignmentRequested?: boolean;
//   reassignmentReason?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface LeadQueryParams {
//   page?: number;
//   limit?: number;
//   status?: string;
//   source?: string;
//   search?: string;
//   isClosed?: boolean;
// }

// export interface LeadResponse {
//   success: boolean;
//   total: number;
//   page: number;
//   pages: number;
//   data: Lead[];
// }

// // ================= API FUNCTIONS ================= //

// // ✅ GET LEADS (FILTER + PAGINATION + SEARCH)
// export const getLeads = async (
//   params: LeadQueryParams = {}
// ): Promise<LeadResponse> => {
//   try {
//     const response = await axiosInstance.get("/leads", {
//       params,
//     });

//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching leads:", error);
//     throw error;
//   }
// };

// // ✅ GET SINGLE LEAD
// export const getLeadById = async (id: string): Promise<Lead> => {
//   try {
//     const response = await axiosInstance.get(`/leads/${id}`);
//     return response.data.data;
//   } catch (error: any) {
//     console.error("Error fetching lead:", error);
//     throw error;
//   }
// };

// // ✅ CREATE LEAD
// export const createLead = async (leadData: Partial<Lead>): Promise<Lead> => {
//   try {
//     const response = await axiosInstance.post("/leads", leadData);
//     return response.data.data;
//   } catch (error: any) {
//     console.error("Error creating lead:", error);
//     throw error;
//   }
// };

// // ✅ UPDATE LEAD
// export const updateLead = async (
//   id: string,
//   leadData: Partial<Lead>
// ): Promise<Lead> => {
//   try {
//     const response = await axiosInstance.put(`/leads/${id}`, leadData);
//     return response.data.data;
//   } catch (error: any) {
//     console.error("Error updating lead:", error);
//     throw error;
//   }
// };

// // ✅ DELETE LEAD
// export const deleteLead = async (id: string): Promise<string> => {
//   try {
//     const response = await axiosInstance.delete(`/leads/${id}`);
//     return response.data.message;
//   } catch (error: any) {
//     console.error("Error deleting lead:", error);
//     throw error;
//   }
// };

// // ✅ ASSIGN LEAD
// export const assignLead = async (
//   id: string,
//   assignData: { userId: string; role: string }
// ): Promise<Lead> => {
//   try {
//     const response = await axiosInstance.post(`/leads/${id}/assign`, assignData);
//     return response.data.data;
//   } catch (error: any) {
//     console.error("Error assigning lead:", error);
//     throw error;
//   }
// };

// // ✅ ADD NOTE TO LEAD
// export const addNoteToLead = async (
//   id: string,
//   text: string
// ): Promise<Lead> => {
//   try {
//     const response = await axiosInstance.post(`/leads/${id}/notes`, {
//       text,
//     });

//     return response.data.data;
//   } catch (error: any) {
//     console.error("Error adding note:", error);
//     throw error;
//   }
// };
