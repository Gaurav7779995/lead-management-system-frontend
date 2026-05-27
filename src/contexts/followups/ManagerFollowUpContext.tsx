import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import {
  FollowUpFilters,
  ManagerFollowUp,
  getManagerFollowUpCenter,
  createManagerFollowUp,
  updateManagerFollowUp,
  addManagerFollowUpNote,
  runManagerFollowUpBulkAction,
  deleteManagerFollowUp,
} from "../../services/managerFollowUpService";

type ViewMode = "table" | "kanban" | "calendar";
type CalendarView = "daily" | "weekly" | "monthly" | "agenda";

interface FollowUpState {
  followUps: ManagerFollowUp[];
  summary: any[];
  analytics: any;
  upcoming: ManagerFollowUp[];
  missed: ManagerFollowUp[];
  agents: any[];
  leads: any[];
  notifications: any[];
  timeline: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters: FollowUpFilters;
  selectedIds: string[];
  viewMode: ViewMode;
  calendarView: CalendarView;
  loading: boolean;
  error: string;
}

type FollowUpAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: any }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "SET_FILTERS"; payload: FollowUpFilters }
  | { type: "SET_VIEW"; payload: ViewMode }
  | { type: "SET_CALENDAR_VIEW"; payload: CalendarView }
  | { type: "TOGGLE_SELECTED"; payload: string }
  | { type: "SET_SELECTED"; payload: string[] }
  | { type: "CLEAR_SELECTED" };

const initialState: FollowUpState = {
  followUps: [],
  summary: [],
  analytics: null,
  upcoming: [],
  missed: [],
  agents: [],
  leads: [],
  notifications: [],
  timeline: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  filters: {
    search: "",
    status: "all",
    type: "all",
    priority: "all",
    agent: "all",
    dateFilter: "all",
    page: 1,
    limit: 10,
    sortBy: "scheduledDate",
    sortOrder: "asc",
  },
  selectedIds: [],
  viewMode: "table",
  calendarView: "weekly",
  loading: false,
  error: "",
};

const reducer = (state: FollowUpState, action: FollowUpAction): FollowUpState => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: "" };
    case "LOAD_SUCCESS":
      return {
        ...state,
        loading: false,
        followUps: action.payload.followUps || [],
        summary: action.payload.summary || [],
        analytics: action.payload.analytics || null,
        upcoming: action.payload.upcoming || [],
        missed: action.payload.missed || [],
        agents: action.payload.agents || [],
        leads: action.payload.leads || [],
        notifications: action.payload.notifications || [],
        timeline: action.payload.timeline || [],
        pagination: action.payload.pagination || initialState.pagination,
      };
    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_VIEW":
      return { ...state, viewMode: action.payload };
    case "SET_CALENDAR_VIEW":
      return { ...state, calendarView: action.payload };
    case "TOGGLE_SELECTED":
      return {
        ...state,
        selectedIds: state.selectedIds.includes(action.payload)
          ? state.selectedIds.filter((id) => id !== action.payload)
          : [...state.selectedIds, action.payload],
      };
    case "SET_SELECTED":
      return { ...state, selectedIds: action.payload };
    case "CLEAR_SELECTED":
      return { ...state, selectedIds: [] };
    default:
      return state;
  }
};

interface ContextValue extends FollowUpState {
  loadFollowUps: (filters?: FollowUpFilters) => Promise<void>;
  setFilters: (filters: FollowUpFilters) => void;
  setViewMode: (view: ViewMode) => void;
  setCalendarView: (view: CalendarView) => void;
  toggleSelected: (id: string) => void;
  selectAllVisible: () => void;
  clearSelected: () => void;
  createFollowUp: (payload: Record<string, any>) => Promise<void>;
  updateFollowUp: (id: string, payload: Record<string, any>) => Promise<void>;
  addNote: (id: string, text: string) => Promise<void>;
  bulkAction: (
    action: "assign" | "status" | "reschedule" | "delete" | "reminder",
    payload?: Record<string, any>
  ) => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;
}

const ManagerFollowUpContext = createContext<ContextValue | null>(null);

export const ManagerFollowUpProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadFollowUps = useCallback(
    async (filters: FollowUpFilters = {}) => {
      const nextFilters = { ...state.filters, ...filters };
      dispatch({ type: "LOAD_START" });
      try {
        const res = await getManagerFollowUpCenter(nextFilters);
        dispatch({ type: "LOAD_SUCCESS", payload: res.data });
      } catch (error: any) {
        dispatch({
          type: "LOAD_ERROR",
          payload: error?.message || "Unable to load follow-ups",
        });
      }
    },
    [state.filters]
  );

  const setFilters = useCallback((filters: FollowUpFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setViewMode = useCallback((view: ViewMode) => {
    dispatch({ type: "SET_VIEW", payload: view });
  }, []);

  const setCalendarView = useCallback((view: CalendarView) => {
    dispatch({ type: "SET_CALENDAR_VIEW", payload: view });
  }, []);

  const toggleSelected = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_SELECTED", payload: id });
  }, []);

  const selectAllVisible = useCallback(() => {
    dispatch({
      type: "SET_SELECTED",
      payload: state.followUps.map((followUp) => followUp._id),
    });
  }, [state.followUps]);

  const clearSelected = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTED" });
  }, []);

  const reloadAfterAction = useCallback(async () => {
    dispatch({ type: "CLEAR_SELECTED" });
    await loadFollowUps();
  }, [loadFollowUps]);

  const createFollowUp = useCallback(
    async (payload: Record<string, any>) => {
      await createManagerFollowUp(payload);
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const updateFollowUp = useCallback(
    async (id: string, payload: Record<string, any>) => {
      await updateManagerFollowUp(id, payload);
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const addNote = useCallback(
    async (id: string, text: string) => {
      await addManagerFollowUpNote(id, text);
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const bulkAction = useCallback(
    async (
      action: "assign" | "status" | "reschedule" | "delete" | "reminder",
      payload: Record<string, any> = {}
    ) => {
      await runManagerFollowUpBulkAction({
        followUpIds: state.selectedIds,
        action,
        payload,
      });
      await reloadAfterAction();
    },
    [reloadAfterAction, state.selectedIds]
  );

  const deleteFollowUp = useCallback(
    async (id: string) => {
      await deleteManagerFollowUp(id);
      await reloadAfterAction();
    },
    [reloadAfterAction]
  );

  const value = useMemo(
    () => ({
      ...state,
      loadFollowUps,
      setFilters,
      setViewMode,
      setCalendarView,
      toggleSelected,
      selectAllVisible,
      clearSelected,
      createFollowUp,
      updateFollowUp,
      addNote,
      bulkAction,
      deleteFollowUp,
    }),
    [
      state,
      loadFollowUps,
      setFilters,
      setViewMode,
      setCalendarView,
      toggleSelected,
      selectAllVisible,
      clearSelected,
      createFollowUp,
      updateFollowUp,
      addNote,
      bulkAction,
      deleteFollowUp,
    ]
  );

  return (
    <ManagerFollowUpContext.Provider value={value}>
      {children}
    </ManagerFollowUpContext.Provider>
  );
};

export const useManagerFollowUps = () => {
  const context = useContext(ManagerFollowUpContext);
  if (!context) {
    throw new Error(
      "useManagerFollowUps must be used inside ManagerFollowUpProvider"
    );
  }
  return context;
};
