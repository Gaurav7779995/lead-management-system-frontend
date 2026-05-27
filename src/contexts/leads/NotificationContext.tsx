import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

// Types
interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  lead?: any;
  relatedId?: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: { notifications: Notification[]; unreadCount: number } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_UNREAD_COUNT'; payload: number };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        loading: false,
        error: null,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif._id === action.payload
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((notif) => notif._id !== action.payload),
        unreadCount: state.notifications.find((n) => n._id === action.payload)?.isRead
          ? state.unreadCount
          : Math.max(0, state.unreadCount - 1),
      };
    case 'UPDATE_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    default:
      return state;
  }
};

interface NotificationContextType {
  state: NotificationState;
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axiosInstance.get(`/manager/notifications?page=${page}&limit=20`);
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: {
          notifications: response.data.data.notifications,
          unreadCount: response.data.data.unreadCount,
        },
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch notifications' });
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/manager/notifications/unread-count');
      dispatch({
        type: 'UPDATE_UNREAD_COUNT',
        payload: response.data.data.unreadCount,
      });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await axiosInstance.put(`/manager/notifications/${id}/read`);
      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axiosInstance.put('/manager/notifications/read-all');
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await axiosInstance.delete(`/manager/notifications/${id}`);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    } catch (error: any) {
      throw error;
    }
  }, []);

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        state,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
