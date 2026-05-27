import { createContext, useCallback, useContext, useState } from "react";
import {
  bulkManagerTaskAction,
  createManagerTask,
  deleteManagerTask,
  getManagerTasks,
  TaskFilters,
  updateManagerTask,
} from "../../services/managerTaskService";

const ManagerTaskContext = createContext<any>(null);

export const ManagerTaskProvider = ({ children }: { children: any }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [percentages, setPercentages] = useState<any>({});
  const [charts, setCharts] = useState<any>({});
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 10 });
  const [filters, setFilters] = useState<TaskFilters>({ status: "all", priority: "all", agent: "all", page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" });
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    try {
      const res = await getManagerTasks(nextFilters);
      setTasks(res.data.tasks || []);
      setAgents(res.data.agents || []);
      setLeads(res.data.leads || []);
      setSummary(res.data.summary || {});
      setPercentages(res.data.percentages || {});
      setCharts(res.data.charts || {});
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1, limit: 10 });
      setFilters(nextFilters);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (payload: any) => {
    await createManagerTask(payload);
    await loadTasks({ ...filters, page: 1 });
  };

  const updateTask = async (taskId: string, payload: any) => {
    await updateManagerTask(taskId, payload);
    await loadTasks(filters);
  };

  const deleteTask = async (taskId: string) => {
    await deleteManagerTask(taskId);
    await loadTasks(filters);
  };

  const bulkAction = async (payload: any) => {
    await bulkManagerTaskAction(payload);
    await loadTasks(filters);
  };

  return (
    <ManagerTaskContext.Provider value={{ tasks, agents, leads, summary, percentages, charts, pagination, filters, setFilters, loading, loadTasks, createTask, updateTask, deleteTask, bulkAction }}>
      {children}
    </ManagerTaskContext.Provider>
  );
};

export const useManagerTasks = () => useContext(ManagerTaskContext);
