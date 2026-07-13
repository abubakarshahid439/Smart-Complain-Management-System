import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, X, Loader2, BellOff } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Link } from 'react-router-dom';

const NotificationDropdown = ({ onClose }) => {
    const { notifications, unreadCount, markAllAsRead, loading, fetchNotifications } = useNotifications();
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                await fetchNotifications();
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setError(err.message || 'Failed to load notifications');
            }
        };
        loadNotifications();
    }, [fetchNotifications]);

    // Safe checks
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const safeUnreadCount = typeof unreadCount === 'number' ? unreadCount : 0;
    const hasUnread = safeNotifications.some(n => n && !n.isRead);
    const hasNotifications = safeNotifications.length > 0;

    if (error) {
        return (
            <div className="w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden p-4">
                <div className="text-center">
                    <BellOff size={32} className="text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-600 dark:text-red-400">Failed to load notifications</p>
                    <button 
                        onClick={() => { setError(null); fetchNotifications(); }}
                        className="mt-2 text-xs text-emerald-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 max-h-[80vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-emerald-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        Notifications
                        {safeUnreadCount > 0 && (
                            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {safeUnreadCount}
                            </span>
                        )}
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    {hasUnread && (
                        <button
                            onClick={markAllAsRead}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
                        >
                            <CheckCheck size={14} />
                            Mark all
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-emerald-500" />
                    </div>
                ) : !hasNotifications ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <BellOff size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            No notifications yet
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            We'll notify you when there are updates.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {safeNotifications.slice(0, 10).map((notification) => (
                            <NotificationItem
                                key={notification?._id || Math.random()}
                                notification={notification}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {hasNotifications && (
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="block text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                        View All Notifications
                    </Link>
                </div>
            )}
        </motion.div>
    );
};

export default NotificationDropdown;