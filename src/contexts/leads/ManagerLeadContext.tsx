import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import {
  ManagerLead,
  ManagerLeadFilters,
  getManagerLeadsCenter,
  updateManagerLead,
  assignManagerLead,
  addManagerLeadNote,
  addManagerLeadFollowUp,
  runManagerLeadBulkAction,
  deleteManagerLead,
} from "../../services/managerLeadService";
import { clearDashboardCache } from "../../utils/dashboardCache";

interface LeadCenterState {
  leads: ManagerLead[];
  summary: any[];
  analytics: any;
  agents: any[];
  notifications: any[];
  timeline: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters: ManagerLeadFilters;
  selectedIds: string[];
  viewMode: "table" | "kanban";
  loading: boolean;
  error: string;
}

type LeadCenterAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: any }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_FILTERS"; payload: ManagerLeadFilters }
  | { type: "SET_VIEW"; payload: "table" | "kanban" }
  | { type: "TOGGLE_SELECTED"; payload: string }
  | { type: "SET_SELECTED"; payload: string[] }
  | { type: "CLEAR_SELECTED" };

const initialState: LeadCenterState = {
  leads: [],
  summary: [],
  analytics: null,
  agents: [],
  notifications: [],
  timeline: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  filters: {
    search: "",
    status: "all",
    source: "all",
    priority: "all",
    agent: "all",
    dateFilter: "all",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  selectedIds: [],
  viewMode: "table",
  loading: false,
  error: "",
};

const reducer = (
  state: LeadCenterState,
  action: LeadCenterAction
): LeadCenterState => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: "" };
    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        leads: action.payload.leads || [],
        summary: action.payload.summary || [],
        analytics: action.payload.analytics || null,
        agents: action.payload.agents || [],
        notifications: action.payload.notifications || [],
        timeline: action.payload.timeline || [],
        pagination: action.payload.pagination || initialState.pagination,
      };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case "SET_VIEW":
      return { ...state, viewMode: action.payload };
    case "TOGGLE_SELECTED": {
      const exists = state.selectedIds.includes(action.payload);
      return {
        ...state,
        selectedIds: exists
          ? state.selectedIds.filter((id) => id !== action.payload)
          : [...state.selectedIds, action.payload],
      };
    }
    case "SET_SELECTED":
      return { ...state, selectedIds: action.payload };
    case "CLEAR_SELECTED":
      return { ...state, selectedIds: [] };
    default:
      return state;
  }
};

interface LeadCenterContextValue extends LeadCenterState {
  loadLeads: (filters?: ManagerLeadFilters) => Promise<void>;
  setFilters: (filters: ManagerLeadFilters) => void;
  setViewMode: (view: "table" | "kanban") => void;
  toggleSelected: (id: string) => void;
  selectAllVisible: () => void;
  clearSelected: () => void;
  updateStatus: (leadId: string, status: string) => Promise<void>;
  assignLead: (leadId: string, agentId: string) => Promise<void>;
  addNote: (leadId: string, text: string) => Promise<void>;
  addFollowUp: (leadId: string, payload: { date: string; note?: string; followUpType?: string }) => Promise<void>;
  bulkAction: (action: "assign" | "status" | "delete", payload?: Record<string, any>) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
}

const ManagerLeadContext = createContext<LeadCenterContextValue | null>(null);

export const ManagerLeadProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadLeads = useCallback(
    async (filters: ManagerLeadFilters = {}) => {
      const nextFilters = { ...state.filters, ...filters };
      dispatch({ type: "LOAD_START" });
      try {
        const res = await getManagerLeadsCenter(nextFilters);
        dispatch({ type: "LOAD_SUCCESS", payload: res.data });
      } catch (error: any) {
        dispatch({
          type: "LOAD_ERROR",
          payload: error?.message || "Unable to load manager leads",
        });
      }
    },
    [state.filters]
  );

  const setFilters = useCallback((filters: ManagerLeadFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setViewMode = useCallback((view: "table" | "kanban") => {
    dispatch({ type: "SET_VIEW", payload: view });
  }, []);

  const toggleSelected = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_SELECTED", payload: id });
  }, []);

  const selectAllVisible = useCallback(() => {
    dispatch({
      type: "SET_SELECTED",
      payload: state.leads.map((lead) => lead._id),
    });
  }, [state.leads]);

  const clearSelected = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTED" });
  }, []);

  const reloadAfterAction = useCallback(async () => {
    dispatch({ type: "CLEAR_SELECTED" });
    await loadLeads();
  }, [loadLeads]);

  const updateStatus = useCallback(
    async (leadId: string, status: string) => {
      await updateManagerLead(leadId, { status });
      clearDashboardCache("manager");
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const assignLead = useCallback(
    async (leadId: string, agentId: string) => {
      await assignManagerLead(leadId, agentId);
      clearDashboardCache("manager");
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const addNote = useCallback(
    async (leadId: string, text: string) => {
      await addManagerLeadNote(leadId, text);
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const addFollowUp = useCallback(
    async (leadId: string, payload: { date: string; note?: string; followUpType?: string }) => {
      await addManagerLeadFollowUp(leadId, payload);
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const bulkAction = useCallback(
    async (action: "assign" | "status" | "delete", payload: Record<string, any> = {}) => {
      await runManagerLeadBulkAction({
        leadIds: state.selectedIds,
        action,
        payload,
      });
      clearDashboardCache("manager");
      await reloadAfterAction();
    },
    [reloadAfterAction, state.selectedIds]
  );

  const deleteLead = useCallback(
    async (leadId: string) => {
      await deleteManagerLead(leadId);
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const value = useMemo(
    () => ({
      ...state,
      loadLeads,
      setFilters,
      setViewMode,
      toggleSelected,
      selectAllVisible,
      clearSelected,
      updateStatus,
      assignLead,
      addNote,
      addFollowUp,
      bulkAction,
      deleteLead,
    }),
    [
      state,
      loadLeads,
      setFilters,
      setViewMode,
      toggleSelected,
      selectAllVisible,
      clearSelected,
      updateStatus,
      assignLead,
      addNote,
      addFollowUp,
      bulkAction,
      deleteLead,
    ]
  );

  return (
    <ManagerLeadContext.Provider value={value}>
      {children}
    </ManagerLeadContext.Provider>
  );
};

export const useManagerLeads = () => {
  const context = useContext(ManagerLeadContext);
  if (!context) {
    throw new Error("useManagerLeads must be used inside ManagerLeadProvider");
  }
  return context;
};
