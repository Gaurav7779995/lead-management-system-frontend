import { loginUser } from "../api/authApi";

// LOGIN
export const login = async (data: {
  email: string;
  password: string;
  role: string;
}) => {
  const res = await loginUser(data);

  // store token + user
  if (res.token) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
  }

  return res;
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// GET CURRENT USER
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};