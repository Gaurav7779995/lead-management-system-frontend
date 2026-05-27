import { createContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

const parseJwtPayload = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(window.atob(paddedBase64));
  } catch {
    return null;
  }
};

const parseStoredUser = (): any => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const normalizeUser = (storedUser: any, tokenPayload?: any): User | null => {
  const role = storedUser?.role || tokenPayload?.role || localStorage.getItem("role");
  const id = storedUser?.id || storedUser?._id || tokenPayload?.id || "";

  if (!role || !["admin", "manager", "agent"].includes(role)) {
    return null;
  }

  return {
    id,
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    role,
  };
};

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreAuth = async () => {
      let token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      let tokenPayload = token ? parseJwtPayload(token) : null;

      try {
        const parsedUser = parseStoredUser();

        if (tokenPayload?.exp && tokenPayload.exp * 1000 <= Date.now()) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("Refresh token missing");

          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
          token = response.data?.accessToken;
          tokenPayload = token ? parseJwtPayload(token) : null;
          if (!token || !tokenPayload) throw new Error("Unable to refresh access token");

          localStorage.setItem("token", token);
          localStorage.setItem("accessToken", token);
        }

        if (!token) {
          setUser(null);
          return;
        }

        const restoredUser = normalizeUser(parsedUser, tokenPayload);
        setUser(restoredUser);

        if (restoredUser) {
          localStorage.setItem("user", JSON.stringify(restoredUser));
          localStorage.setItem("role", restoredUser.role);
          localStorage.setItem("token", token);
          localStorage.setItem("accessToken", token);
        }
      } catch {
        clearStoredAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = (data: any) => {
    const accessToken = data?.accessToken;
    const refreshToken = data?.refreshToken || "";
    const loggedInUser = data?.user;

    if (!accessToken || !loggedInUser?.role) {
      console.error("Invalid login data:", data);
      return;
    }

    const userData: User = {
      id: loggedInUser.id || loggedInUser._id || "",
      name: loggedInUser.name || "",
      email: loggedInUser.email,
      role: loggedInUser.role,
    };

    localStorage.setItem("token", accessToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userData.role);

    setUser(userData);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
