import axiosInstance from "./axiosInstance";

// ================= TYPES ================= //

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent";
  phone?: string;
  managerId?: string | {
    _id: string;
    name: string;
    email?: string;
    role?: string;
  };

  // ✅ Optional fields from backend aggregation
  agentsCount?: number;
  assignedLeadsCount?: number;
  wonLeads?: number;
  lostLeads?: number;
  activeLeadsCount?: number;
  inactiveLeadsCount?: number;
  status?: string;
  createdAt?: string;
}

export interface UserResponse {
  success: boolean;
  data: User[];
}

export interface SingleUserResponse {
  success: boolean;
  data: User;
}

// ================= MANAGERS ================= //

// ✅ GET ALL MANAGERS
export const getManagers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get<UserResponse>("/users/managers");

    if (!response.data?.success) {
      console.warn("⚠️ Invalid manager response");
      return [];
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error("❌ Error fetching managers:", error?.response?.data || error.message);
    return [];
  }
};

// ✅ GET SINGLE MANAGER (🔥 FIXED ROUTE)
export const getManagerById = async (id: string): Promise<User | null> => {
  try {
    const res = await axiosInstance.get<SingleUserResponse>(`/users/manager/${id}`);

    if (!res.data?.success) {
      console.warn("⚠️ Invalid manager data");
      return null;
    }

    return res.data.data;
  } catch (err: any) {
    console.error("❌ Error fetching manager:", err?.response?.data || err.message);
    return null;
  }
};

// ✅ UPDATE MANAGER (🔥 FIXED ROUTE)
export const updateManager = async (
  id: string,
  data: Partial<User>
): Promise<User | null> => {
  try {
    const res = await axiosInstance.put<SingleUserResponse>(
      `/users/manager/${id}`,
      data
    );

    if (!res.data?.success) {
      console.warn("⚠️ Update failed response");
      return null;
    }

    return res.data.data;
  } catch (err: any) {
    console.error("❌ Error updating manager:", err?.response?.data || err.message);
    throw err; // 🔥 important for UI error handling
  }
};

// ================= AGENTS ================= //

// ✅ GET AGENTS (OPTIONAL FILTER BY MANAGER)
export const getAgents = async (managerId?: string): Promise<User[]> => {
  try {
    const response = await axiosInstance.get<UserResponse>("/users/agents", {
      params: managerId ? { managerId } : {},
    });

    if (!response.data?.success) {
      console.warn("⚠️ Invalid agents response");
      return [];
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error("❌ Error fetching agents:", error?.response?.data || error.message);
    return [];
  }
};

// ================= OPTIONAL GENERIC ================= //

// ⚠️ ONLY USE IF YOU CREATE /users/:id ROUTE
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const res = await axiosInstance.get<SingleUserResponse>(`/users/${id}`);
    return res.data?.data || null;
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    return null;
  }
};
















// import axiosInstance from "./axiosInstance";

// // ================= TYPES ================= //

// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: "admin" | "manager" | "agent";
//   managerId?: string;

//   // ✅ Optional fields from backend aggregation
//   agentsCount?: number;
//   assignedLeadsCount?: number;
//   status?: string;
// }

// export interface UserResponse {
//   success: boolean;
//   data: User[];
// }

// // ================= MANAGERS ================= //

// export const getManagers = async (): Promise<User[]> => {
//   try {
//     const response = await axiosInstance.get<UserResponse>("/users/managers");

//     // ✅ Safe fallback
//     if (!response.data || !response.data.success) {
//       console.warn("⚠️ Invalid manager response");
//       return [];
//     }

//     return response.data.data || [];
//   } catch (error: any) {
//     console.error("❌ Error fetching managers:", error?.response?.data || error.message);

//     // ✅ Prevent UI crash
//     return [];
//   }
// };

// // ✅ GET SINGLE MANAGER
// export const getManagerById = async (id: string): Promise<User | null> => {
//   try {
//     const res = await axiosInstance.get(`/users/${id}`);
//     return res.data?.data || null;
//   } catch (err) {
//     console.error("❌ Error fetching manager:", err);
//     return null;
//   }
// };

// // ✅ UPDATE MANAGER
// export const updateManager = async (
//   id: string,
//   data: Partial<User>
// ): Promise<User | null> => {
//   try {
//     const res = await axiosInstance.put(`/users/${id}`, data);
//     return res.data?.data || null;
//   } catch (err) {
//     console.error("❌ Error updating manager:", err);
//     return null;
//   }
// };

// // ================= AGENTS ================= //

// export const getAgents = async (managerId?: string): Promise<User[]> => {
//   try {
//     const response = await axiosInstance.get<UserResponse>("/users/agents", {
//       params: managerId ? { managerId } : {},
//     });

//     // ✅ Safe response check
//     if (!response.data || !response.data.success) {
//       console.warn("⚠️ Invalid agents response");
//       return [];
//     }

//     return response.data.data || [];
//   } catch (error: any) {
//     console.error("❌ Error fetching agents:", error?.response?.data || error.message);

//     // ✅ Prevent UI crash
//     return [];
//   }
// };

// // ================= OPTIONAL: GET SINGLE USER ================= //

// export const getUserById = async (id: string): Promise<User | null> => {
//   try {
//     const res = await axiosInstance.get(`/users/${id}`);
//     return res.data?.data || null;
//   } catch (err) {
//     console.error("❌ Error fetching user:", err);
//     return null;
//   }
// };








