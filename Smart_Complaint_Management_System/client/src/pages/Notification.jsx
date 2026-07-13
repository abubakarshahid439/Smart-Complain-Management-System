import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Bell, BellOff, CheckCheck, Loader2, 
    Filter, X, Clock, AlertCircle 
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/NotificationItem';
import { clsx } from 'clsx';

const Notifications = () => {
    const { 
        notifications, 
        unreadCount, 
        loading, 
        fetchNotifications, 
        markAllAsRead,
        deleteNotification 
    } = useNotifications();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20 pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-3 text-sm bg-red-500 text-white px-3 py-1 rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Stay updated with your complaint activity
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {notifications.length > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                            >
                                <CheckCheck size={16} />
                                Mark All Read
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            filter === 'all' 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            filter === 'unread' 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                    >
                        Unread
                        {unreadCount > 0 && (
                            <span className="ml-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                            filter === 'read' 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                    >
                        Read
                    </button>
                </div>

                {/* Notification List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-emerald-500" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-12 text-center"
                    >
                        <BellOff size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No notifications</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {filter === 'all' 
                                ? "You don't have any notifications yet."
                                : filter === 'unread' 
                                    ? "You have no unread notifications."
                                    : "You have no read notifications."
                            }
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden"
                    >
                        {filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onClose={() => {}}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Notifications;