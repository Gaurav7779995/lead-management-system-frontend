import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// ================= REQUEST INTERCEPTOR =================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error.message);
    return Promise.reject(error);
  }
);

// ================= RESPONSE INTERCEPTOR =================
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const originalRequest: any = error.config;

    if (status === 401) {
      // ✅ Don't retry if already retried
      if (originalRequest?._retry) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("refreshToken");

      // ✅ Only attempt refresh if we actually have a refresh token
      if (refreshToken) {
        originalRequest._retry = true;

        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const newAccessToken = res.data.accessToken;
          localStorage.setItem("token", newAccessToken);
          localStorage.setItem("accessToken", newAccessToken);

          if (originalRequest.headers) {
            (originalRequest.headers as AxiosHeaders).set(
              "Authorization",
              `Bearer ${newAccessToken}`
            );
          }

          return axiosInstance(originalRequest);
        } catch {
          console.error("❌ Refresh token failed");
          localStorage.clear();
          window.location.href = "/login";
        }
      }

      // ✅ No refresh token = not logged in yet, just reject silently
      // DON'T clear localStorage or redirect here
      return Promise.reject(error);
    }

    if (status === 403) console.error("⛔ Access denied");
    if (status === 500) console.error("🔥 Server error");

    return Promise.reject(error);
  }
);

export default axiosInstance;














// import axios, {
//   AxiosError,
//   InternalAxiosRequestConfig,
//   AxiosHeaders,
// } from "axios";

// // ================= BASE URL =================
// const BASE_URL =
//   process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// // ================= AXIOS INSTANCE =================
// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
//   timeout: 10000,
// });

// // ================= REQUEST INTERCEPTOR =================
// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem("token");

//     if (token && config.headers) {
//       const headers = config.headers as AxiosHeaders;
//       headers.set("Authorization", `Bearer ${token}`);
//     }

//     return config;
//   },
//   (error: AxiosError) => {
//     console.error("❌ Request Error:", error.message);
//     return Promise.reject(error);
//   }
// );

// // ================= RESPONSE INTERCEPTOR =================
// axiosInstance.interceptors.response.use(
//   (response) => response,

//   async (error: AxiosError<any>) => {
//     const status = error.response?.status;
//     const message =
//       error.response?.data?.message || error.message;

//     const originalRequest: any = error.config;

//     // 🔥 IMPORTANT: Skip auth endpoints
//     const isAuthRoute =
//       originalRequest?.url?.includes("/auth/login") ||
//       originalRequest?.url?.includes("/auth/refresh-token");

//     // 🔐 HANDLE 401 (TOKEN EXPIRED)
//     if (status === 401 && !isAuthRoute) {
//       console.warn("⚠️ Unauthorized:", message);

//       const refreshToken = localStorage.getItem("refreshToken");

//       // ❌ Prevent infinite retry loop
//       if (originalRequest?._retry) {
//         localStorage.clear();
//         window.location.href = "/login";
//         return Promise.reject(error);
//       }

//       originalRequest._retry = true;

//       if (refreshToken) {
//         try {
//           const res = await axios.post(
//             `${BASE_URL}/auth/refresh-token`,
//             { refreshToken }
//           );

//           const newAccessToken = res.data.accessToken;

//           // ✅ STORE NEW TOKEN
//           localStorage.setItem("token", newAccessToken);

//           // ✅ UPDATE HEADER
//           if (originalRequest.headers) {
//             const headers = originalRequest.headers as AxiosHeaders;
//             headers.set("Authorization", `Bearer ${newAccessToken}`);
//           }

//           // ✅ RETRY ORIGINAL REQUEST
//           return axiosInstance(originalRequest);

//         } catch (refreshError) {
//           console.error("❌ Refresh token failed");

//           localStorage.clear();
//           window.location.href = "/login";
//         }
//       } else {
//         localStorage.clear();
//         window.location.href = "/login";
//       }
//     }

//     // ⛔ 403
//     if (status === 403) {
//       console.error("⛔ Access denied:", message);
//     }

//     // 🔥 500
//     if (status === 500) {
//       console.error("🔥 Server error:", message);
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;











// import axios, {
//   AxiosError,
//   InternalAxiosRequestConfig,
// } from "axios";

// // ✅ Base URL
// const BASE_URL =
//   process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// // ================= AXIOS INSTANCE =================
// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
//   timeout: 10000,
// });

// // ================= REQUEST INTERCEPTOR =================
// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem("token"); // ✅ MUST match login

//     if (token && config.headers) {
//       // ✅ CORRECT WAY (Axios v1+)
//       config.headers.set("Authorization", `Bearer ${token}`);
//     }

//     return config;
//   },
//   (error: AxiosError) => {
//     console.error("❌ Request Error:", error.message);
//     return Promise.reject(error);
//   }
// );

// // ================= RESPONSE INTERCEPTOR =================
// axiosInstance.interceptors.response.use(
//   (response) => response,

//   async (error: AxiosError<any>) => {
//     const status = error.response?.status;
//     const message =
//       error.response?.data?.message || error.message;

//     // 🔐 401 HANDLING
//     if (status === 401) {
//       console.warn("⚠️ Unauthorized:", message);

//       const refreshToken = localStorage.getItem("refreshToken");

//       // ✅ TRY REFRESH TOKEN
//       if (refreshToken) {
//         try {
//           const res = await axios.post(
//             `${BASE_URL}/auth/refresh-token`,
//             { refreshToken }
//           );

//           const newAccessToken = res.data.accessToken;

//           // ✅ STORE NEW TOKEN
//           localStorage.setItem("token", newAccessToken);

//           // ✅ RETRY ORIGINAL REQUEST
//           if (error.config && error.config.headers) {
//             error.config.headers.set(
//               "Authorization",
//               `Bearer ${newAccessToken}`
//             );
//           }

//           return axiosInstance(error.config!);
//         } catch (refreshError) {
//           console.error("❌ Refresh token failed");

//           localStorage.clear();
//           window.location.href = "/login";
//         }
//       } else {
//         // ❌ NO REFRESH TOKEN
//         localStorage.clear();
//         window.location.href = "/login";
//       }
//     }

//     if (status === 403) {
//       console.error("⛔ Access denied:", message);
//     }

//     if (status === 500) {
//       console.error("🔥 Server error:", message);
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
