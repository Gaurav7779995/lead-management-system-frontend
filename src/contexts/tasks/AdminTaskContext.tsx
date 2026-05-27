import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  AdminTaskFilters,
  createAdminTask,
  deleteAdminTask,
  getAdminTasks,
  updateAdminTask,
} from "../../services/adminTaskService";

type AdminTaskContextValue = {
  tasks: any[];
  users: any[];
  summary: any;
  charts: any;
  filters: AdminTaskFilters;
  loading: boolean;
  loadTasks: (nextFilters?: AdminTaskFilters) => Promise<void>;
  setFilters: (filters: AdminTaskFilters) => void;
  createTask: (payload: any) => Promise<void>;
  updateTask: (taskId: string, payload: any) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
};

const AdminTaskContext = createContext<AdminTaskContextValue | null>(null);

export const AdminTaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [charts, setCharts] = useState<any>({});
  const [filters, setFilters] = useState<AdminTaskFilters>({ status: "all", priority: "all", assignedUser: "all", department: "all" });
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async (nextFilters: AdminTaskFilters = filters) => {
    setLoading(true);
    try {
      const res = await getAdminTasks(nextFilters);
      setTasks(res.data.tasks || []);
      setUsers(res.data.users || []);
      setSummary(res.data.summary || {});
      setCharts(res.data.charts || {});
      setFilters(nextFilters);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (payload: any) => {
    await createAdminTask(payload);
    await loadTasks(filters);
  };

  const updateTask = async (taskId: string, payload: any) => {
    await updateAdminTask(taskId, payload);
    await loadTasks(filters);
  };

  const removeTask = async (taskId: string) => {
    await deleteAdminTask(taskId);
    await loadTasks(filters);
  };

  const value = useMemo(() => ({ tasks, users, summary, charts, filters, loading, loadTasks, setFilters, createTask, updateTask, deleteTask: removeTask }), [tasks, users, summary, charts, filters, loading, loadTasks]);
  return <AdminTaskContext.Provider value={value}>{children}</AdminTaskContext.Provider>;
};

export const useAdminTasks = () => {
  const context = useContext(AdminTaskContext);
  if (!context) throw new Error("useAdminTasks must be used inside AdminTaskProvider");
  return context;
};
