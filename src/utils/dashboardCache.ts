export const DASHBOARD_CACHE_TTL = 2 * 60 * 1000;

export const getDashboardCacheKey = (role?: string, id?: string) =>
  `dashboard-cache:${role || "unknown"}:${id || "current"}`;

export const getCurrentUserDashboardCacheKey = (role = "manager") => {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    return getDashboardCacheKey(role, user?.id || user?._id);
  } catch {
    return getDashboardCacheKey(role);
  }
};

export const clearDashboardCache = (role = "manager") => {
  const currentKey = getCurrentUserDashboardCacheKey(role);
  sessionStorage.removeItem(currentKey);

  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(`dashboard-cache:${role}:`))
    .forEach((key) => sessionStorage.removeItem(key));
};
