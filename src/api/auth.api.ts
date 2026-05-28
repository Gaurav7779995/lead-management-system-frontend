import API from "./axiosInstance";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  try {
     const res = await API.post("/auth/login", data);
  return res.data;
  } catch (error: any) {
    throw {
      ...(error.response?.data || {}),
      status: error.response?.status,
      code: error.code,
      message: error.response?.data?.message || error.message || "Login failed",
    };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await API.post("/auth/forgot-password", { email });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Could not send reset link" };
  }
};

export const resetPassword = async (
  token: string,
  data: {
    newPassword: string;
    confirmPassword: string;
  }
) => {
  try {
    const res = await API.post(`/auth/reset-password/${token}`, data);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Password reset failed" };
  }
};


// import API from "./axiosInstance";

// export const loginUser = async (data: {
//   email: string;
//   password: string;
//   role: string;
// }) => {
//   const response = await API.post("/auth/login", data);
//   return response.data;
// };
