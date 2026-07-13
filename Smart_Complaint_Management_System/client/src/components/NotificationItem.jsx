import React from 'react';
import { Link } from 'react-router-dom';
import { 
    CheckCircle, XCircle, Clock, AlertCircle, 
    Star, MessageSquare, User, Shield, X // ✅ X is now imported
} from 'lucide-react';
import { clsx } from 'clsx';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onClose }) => {
    const { markAsRead, deleteNotification } = useNotifications();

    if (!notification) return null;

    const getIcon = (type) => {
        const icons = {
            'status_update': AlertCircle,
            'new_complaint': MessageSquare,
            'complaint_resolved': CheckCircle,
            'complaint_rejected': XCircle,
            'admin_assigned': User,
            'rating_received': Star,
            'system_alert': Shield
        };
        return icons[type] || MessageSquare;
    };

    const getColor = (type) => {
        const colors = {
            'status_update': 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
            'new_complaint': 'text-purple-500 bg-purple-50 dark:bg-purple-900/30',
            'complaint_resolved': 'text-green-500 bg-green-50 dark:bg-green-900/30',
            'complaint_rejected': 'text-red-500 bg-red-50 dark:bg-red-900/30',
            'admin_assigned': 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30',
            'rating_received': 'text-amber-500 bg-amber-50 dark:bg-amber-900/30',
            'system_alert': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
        };
        return colors[type] || 'text-slate-500 bg-slate-50 dark:bg-slate-700/30';
    };

    const Icon = getIcon(notification.type);
    const colorClass = getColor(notification.type);
    
    let timeAgo = 'Just now';
    try {
        if (notification.createdAt) {
            timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
        }
    } catch (e) {
        timeAgo = 'Recently';
    }

    const handleClick = async () => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        if (notification.data?.url) {
            onClose();
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteNotification(notification._id);
    };

    const content = (
        <div
            className={clsx(
                "group relative flex items-start gap-3 px-4 py-3 transition-all cursor-pointer",
                "hover:bg-slate-50 dark:hover:bg-slate-700/50",
                !notification.isRead && "bg-emerald-50/30 dark:bg-emerald-900/10 border-l-2 border-emerald-500",
                notification.isRead && "opacity-70"
            )}
            onClick={handleClick}
        >
            {/* Icon */}
            <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                colorClass
            )}>
                <Icon size={16} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {notification.title || 'Notification'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {notification.message || ''}
                        </p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                        title="Delete notification"
                    >
                        <X size={12} /> {/* ✅ X is now defined */}
                    </button>
                </div>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                    {timeAgo}
                </p>
            </div>
        </div>
    );

    if (notification.data?.url) {
        return (
            <Link to={notification.data.url} onClick={onClose}>
                {content}
            </Link>
        );
    }

    return content;
};

export default NotificationItem;