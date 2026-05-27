import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import axiosInstance from '../../api/axiosInstance';

// Types
interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  source: string;
  priority: string;
  leadScore: string;
  assignedAgent?: any;
  assignedBy?: any;
  leadOwner?: any;
  nextFollowUpDate?: string;
  followUpNotes?: string;
  missedFollowUps: number;
  budget?: number;
  requirement?: string;
  interestedService?: string;
  expectedClosingDate?: string;
  dealValue?: number;
  tags?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    status: string;
    source: string;
    priority: string;
    agent: string;
    startDate: string;
    endDate: string;
  };
  selectedLeads: string[];
  viewMode: 'table' | 'kanban';
}

type LeadAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LEADS'; payload: { leads: Lead[]; pagination: any } }
  | { type: 'SET_FILTERS'; payload: Partial<LeadState['filters']> }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_LEAD_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_LEADS'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_VIEW_MODE'; payload: 'table' | 'kanban' }
  | { type: 'UPDATE_LEAD'; payload: Lead }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'ADD_LEAD'; payload: Lead };

const initialState: LeadState = {
  leads: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: 'all',
    source: 'all',
    priority: 'all',
    agent: 'all',
    startDate: '',
    endDate: '',
  },
  selectedLeads: [],
  viewMode: 'table',
};

const leadReducer = (state: LeadState, action: LeadAction): LeadState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_LEADS':
      return {
        ...state,
        leads: action.payload.leads,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 },
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        pagination: { ...state.pagination, page: 1 },
      };
    case 'TOGGLE_LEAD_SELECTION':
      return {
        ...state,
        selectedLeads: state.selectedLeads.includes(action.payload)
          ? state.selectedLeads.filter((id) => id !== action.payload)
          : [...state.selectedLeads, action.payload],
      };
    case 'SELECT_ALL_LEADS':
      return {
        ...state,
        selectedLeads: action.payload,
      };
    case 'CLEAR_SELECTION':
      return { ...state, selectedLeads: [] };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map((lead) =>
          lead._id === action.payload._id ? action.payload : lead
        ),
      };
    case 'DELETE_LEAD':
      return {
        ...state,
        leads: state.leads.filter((lead) => lead._id !== action.payload),
        selectedLeads: state.selectedLeads.filter((id) => id !== action.payload),
      };
    case 'ADD_LEAD':
      return {
        ...state,
        leads: [action.payload, ...state.leads],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
      };
    default:
      return state;
  }
};

interface LeadContextType {
  state: LeadState;
  fetchLeads: (page?: number) => Promise<void>;
  createLead: (leadData: Partial<Lead>) => Promise<Lead>;
  updateLead: (id: string, leadData: Partial<Lead>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  assignLead: (id: string, agentId: string) => Promise<Lead>;
  bulkUpdateLeads: (leadIds: string[], updates: Partial<Lead>) => Promise<void>;
  bulkDeleteLeads: (leadIds: string[]) => Promise<void>;
  setFilters: (filters: Partial<LeadState['filters']>) => void;
  resetFilters: () => void;
  toggleLeadSelection: (id: string) => void;
  selectAllLeads: () => void;
  clearSelection: () => void;
  setViewMode: (mode: 'table' | 'kanban') => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(leadReducer, initialState);

  const fetchLeads = useCallback(async (page = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const params = new URLSearchParams({
        page: String(page),
        limit: String(state.pagination.limit),
        ...(state.filters.search && { search: state.filters.search }),
        ...(state.filters.status !== 'all' && { status: state.filters.status }),
        ...(state.filters.source !== 'all' && { source: state.filters.source }),
        ...(state.filters.priority !== 'all' && { priority: state.filters.priority }),
        ...(state.filters.agent !== 'all' && { agent: state.filters.agent }),
        ...(state.filters.startDate && { startDate: state.filters.startDate }),
        ...(state.filters.endDate && { endDate: state.filters.endDate }),
      });

      const response = await axiosInstance.get(`/manager/leads?${params}`);
      
      dispatch({
        type: 'SET_LEADS',
        payload: {
          leads: response.data.data.leads,
          pagination: response.data.data.pagination,
        },
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch leads' });
    }
  }, [state.filters, state.pagination.limit]);

  const createLead = useCallback(async (leadData: Partial<Lead>) => {
    try {
      const response = await axiosInstance.post('/manager/leads', leadData);
      dispatch({ type: 'ADD_LEAD', payload: response.data.data });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const updateLead = useCallback(async (id: string, leadData: Partial<Lead>) => {
    try {
      const response = await axiosInstance.put(`/manager/leads/${id}`, leadData);
      dispatch({ type: 'UPDATE_LEAD', payload: response.data.data });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    try {
      await axiosInstance.delete(`/manager/leads/${id}`);
      dispatch({ type: 'DELETE_LEAD', payload: id });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const assignLead = useCallback(async (id: string, agentId: string) => {
    try {
      const response = await axiosInstance.put(`/manager/leads/${id}/assign`, { agentId });
      dispatch({ type: 'UPDATE_LEAD', payload: response.data.data });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const bulkUpdateLeads = useCallback(async (leadIds: string[], updates: Partial<Lead>) => {
    try {
      await axiosInstance.put('/manager/leads/bulk', { leadIds, updates });
      await fetchLeads(state.pagination.page);
    } catch (error: any) {
      throw error;
    }
  }, [fetchLeads, state.pagination.page]);

  const bulkDeleteLeads = useCallback(async (leadIds: string[]) => {
    try {
      await axiosInstance.delete('/manager/leads/bulk', { data: { leadIds } });
      await fetchLeads(state.pagination.page);
    } catch (error: any) {
      throw error;
    }
  }, [fetchLeads, state.pagination.page]);

  const setFilters = useCallback((filters: Partial<LeadState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const toggleLeadSelection = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_LEAD_SELECTION', payload: id });
  }, []);

  const selectAllLeads = useCallback(() => {
    const allIds = state.leads.map((lead) => lead._id);
    dispatch({ type: 'SELECT_ALL_LEADS', payload: allIds });
  }, [state.leads]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setViewMode = useCallback((mode: 'table' | 'kanban') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  return (
    <LeadContext.Provider
      value={{
        state,
        fetchLeads,
        createLead,
        updateLead,
        deleteLead,
        assignLead,
        bulkUpdateLeads,
        bulkDeleteLeads,
        setFilters,
        resetFilters,
        toggleLeadSelection,
        selectAllLeads,
        clearSelection,
        setViewMode,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeadContext = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeadContext must be used within a LeadProvider');
  }
  return context;
};
