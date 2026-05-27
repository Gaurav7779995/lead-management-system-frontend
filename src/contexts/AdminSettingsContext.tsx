import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { adminSettingsService } from "../services/adminSettingsService";

type Toast = { type: "success" | "error" | "info"; message: string } | null;

type AdminSettingsContextValue = {
  data: any;
  loading: boolean;
  toast: Toast;
  reload: () => Promise<void>;
  notify: (type: "success" | "error" | "info", message: string) => void;
  clearToast: () => void;
};

const AdminSettingsContext = createContext<AdminSettingsContextValue | null>(null);

export const AdminSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const notify = useCallback((type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminSettingsService.overview();
      setData(res.data);
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const value = useMemo(() => ({ data, loading, toast, reload, notify, clearToast: () => setToast(null) }), [data, loading, toast, reload, notify]);

  return <AdminSettingsContext.Provider value={value}>{children}</AdminSettingsContext.Provider>;
};

export const useAdminSettings = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) throw new Error("useAdminSettings must be used inside AdminSettingsProvider");
  return ctx;
};
