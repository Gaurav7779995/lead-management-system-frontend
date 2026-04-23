import API from "./axiosInstance";

export const loginUser = async (data: {
  email: string;
  password: string;
  role: string;
}) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};