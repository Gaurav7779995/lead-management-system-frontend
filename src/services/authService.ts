import { loginUser } from "../api/auth.api";

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  role: string;
}

export const login = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const res = await loginUser({
      email: data.email,
      password: data.password,
    });

    console.log("✅ LOGIN RESPONSE:", res);

    // ✅ STRICT VALIDATION
    if (!res?.accessToken || !res?.role) {
      throw new Error("Invalid response from server");
    }

    const token = res.accessToken;
    const refreshToken = res.refreshToken || "";

    const user = {
      email: data.email,
      role: res.role,
    };

    // ✅ CLEAR OLD DATA (IMPORTANT)
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // ✅ STORE NEW DATA
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    // 🔍 DEBUG
    console.log("🔥 STORED TOKEN:", localStorage.getItem("token"));
    console.log("👤 STORED USER:", user);

    return res;

  } catch (error: any) {
    console.error(
      "❌ Login error:",
      error?.response?.data || error.message
    );

    throw error?.response?.data || { message: "Login failed" };
  }
};






// import { loginUser } from "../api/auth.api";

// export const login = async (data: {
//   email: string;
//   password: string;
// }) => {
//   try {
//     const res = await loginUser({
//       email: data.email,
//       password: data.password,
//     });

//     console.log("LOGIN RESPONSE:", res); // 🔍 DEBUG

//     // ✅ FIX: correct fields
//     // const token = res.accessToken;
//     // const refreshToken = res.refreshToken;

//     const token = res.accessToken || res.adminToken; // 🔥 FIX
//     const refreshToken = res.refreshToken || null;

//     const user = {
//       email: data.email,
//       role: res.role,
//     };

//     if (!token) {
//       throw new Error("Token not received from server");
//     }

//     // ✅ STORE CORRECTLY
//     localStorage.setItem("token", token);
//     localStorage.setItem("refreshToken", refreshToken);
//     localStorage.setItem("user", JSON.stringify(user));

//     return res;
//   } catch (error: any) {
//     console.error("Login error:", error.response?.data || error.message);
//     throw error;
//   }
// };


// import { loginUser } from "../api/auth.api";

// export const login = async (data: {
//   email: string;
//   password: string;
// }) => {
//   try {
//     const res = await loginUser({
//       email: data.email,
//       password: data.password,
//     });

//     const token = res?.data?.token;
//     const user = res?.data?.user;

//     if (!token || !user) {
//       throw new Error("Invalid response from server");
//     }

//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(user));

//     return res;
//   } catch (error: any) {
//     console.error("Login error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // LOGIN
// export const login = async (data: {
//   email: string;
//   password: string;
//   role: string;
// }) => {
//   try {
//     const res = await loginUser(data);

//     // handle different response formats safely
//     const token = res.token || res.data?.token;
//     const user = res.user || res.data?.user;

//     if (token && user) {
//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));
//     } else {
//       throw new Error("Invalid response from server");
//     }

//     return res;
//   } catch (error: any) {
//     console.error("Login error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // LOGOUT
// export const logout = () => {
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");
// };

// // GET CURRENT USER
// export const getCurrentUser = () => {
//   try {
//     const user = localStorage.getItem("user");
//     return user ? JSON.parse(user) : null;
//   } catch {
//     return null;
//   }
// };





// import { loginUser } from "../api/auth.api";

// // LOGIN
// export const login = async (data: {
//   email: string;
//   password: string;
//   role: string;
// }) => {
//   const res = await loginUser(data);

//   // store token + user
//   if (res.token) {
//     localStorage.setItem("token", res.token);
//     localStorage.setItem("user", JSON.stringify(res.user));
//   }

//   return res;
// };

// // LOGOUT
// export const logout = () => {
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");
// };

// // GET CURRENT USER
// export const getCurrentUser = () => {
//   const user = localStorage.getItem("user");
//   return user ? JSON.parse(user) : null;
// };