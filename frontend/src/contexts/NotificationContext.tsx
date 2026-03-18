import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiGet, API_BASE_URL } from '../utils/api';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { accessToken } = useAuth();

  const fetchNotifications = async () => {
    if (!accessToken) return;
    try {
      const data = await apiGet<{ notifications: any[] }>(`/notifications`, accessToken);
      const list = data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n: any) => !n.read_status && !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!accessToken) return;
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_status: true, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}