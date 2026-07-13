import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const { data } = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(data.data);
            setUnreadCount(data.unreadCount);
            return data;
        } catch (error) {
            console.error('Fetch notifications error:', error);
            return null;
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const { data } = await axios.get('http://localhost:5000/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => 
                prev.map(notification => 
                    notification._id === id 
                        ? { ...notification, isRead: true } 
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark as read error:', error);
            toast.error('Failed to mark as read');
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => 
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Mark all as read error:', error);
            toast.error('Failed to mark all as read');
        }
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.filter(n => n._id !== id));
            if (!notifications.find(n => n._id === id)?.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Delete notification error:', error);
            toast.error('Failed to delete notification');
        }
    }, []);

    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.isRead) {
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!sessionStorage.getItem('token')) return;

        fetchNotifications();
        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};