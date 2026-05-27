import API from "../api/axiosInstance";

const requestWithFallback = async (primary: string, fallback: string, config?: any) => {
  try {
    return await API.get(primary, config);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return API.get(fallback, config);
    }
    throw error;
  }
};

export const getProfileSettings = async () => {
  const res = await requestWithFallback("/profile-settings", "/manager/profile-settings");
  return res.data;
};

export const updateProfileSettings = async (payload: Record<string, any>) => {
  const res = await API.put("/profile-settings/profile", payload).catch((error) => {
    if (error?.response?.status === 404) return API.put("/manager/profile-settings/profile", payload);
    throw error;
  });
  return res.data;
};

export const updateProfilePreferences = async (payload: Record<string, any>) => {
  const res = await API.put("/profile-settings/preferences", payload).catch((error) => {
    if (error?.response?.status === 404) return API.put("/manager/profile-settings/preferences", payload);
    throw error;
  });
  return res.data;
};

export const updateProfilePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const res = await API.put("/profile-settings/password", payload).catch((error) => {
    if (error?.response?.status === 404) return API.put("/manager/profile-settings/password", payload);
    throw error;
  });
  return res.data;
};

export const uploadProfilePhoto = async (file: File) => {
  const form = new FormData();
  form.append("profilePhoto", file);
  const config = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  const res = await API.post("/profile-settings/photo", form, config).catch((error) => {
    if (error?.response?.status === 404) return API.post("/manager/profile-settings/photo", form, config);
    throw error;
  });
  return res.data;
};

export const removeProfilePhoto = async () => {
  const res = await API.delete("/profile-settings/photo").catch((error) => {
    if (error?.response?.status === 404) return API.delete("/manager/profile-settings/photo");
    throw error;
  });
  return res.data;
};

export const logoutAllProfileDevices = async () => {
  const res = await API.post("/profile-settings/logout-all-devices").catch((error) => {
    if (error?.response?.status === 404) return API.post("/manager/profile-settings/logout-all-devices");
    throw error;
  });
  return res.data;
};
