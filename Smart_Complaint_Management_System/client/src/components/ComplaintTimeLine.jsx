import React from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, AlertCircle, CheckCheck, XCircle, 
    Users, MessageSquare, Calendar, FileText
} from 'lucide-react';
import { clsx } from 'clsx';

const ComplaintTimeline = ({ complaint, className }) => {
    if (!complaint) return null;

    // Build timeline events from complaint data
    const buildTimeline = () => {
        const events = [];

        // 1. Created event
        events.push({
            id: 'created',
            type: 'created',
            date: complaint.createdAt,
            title: 'Complaint Submitted',
            description: 'Complaint was created successfully',
            icon: FileText,
            color: 'emerald'
        });

        // 2. Status changes based on current status
        if (complaint.status === 'In Progress' || complaint.status === 'Resolved' || complaint.status === 'Rejected') {
            events.push({
                id: 'in-progress',
                type: 'in-progress',
                date: complaint.updatedAt || complaint.createdAt,
                title: 'Status Updated',
                description: `Complaint moved to ${complaint.status}`,
                icon: AlertCircle,
                color: 'blue'
            });
        }

        // 3. Resolved
        if (complaint.status === 'Resolved') {
            events.push({
                id: 'resolved',
                type: 'resolved',
                date: complaint.updatedAt || complaint.createdAt,
                title: 'Complaint Resolved',
                description: complaint.resolution || 'Complaint has been resolved',
                icon: CheckCheck,
                color: 'green'
            });
        }

        // 4. Rejected
        if (complaint.status === 'Rejected') {
            events.push({
                id: 'rejected',
                type: 'rejected',
                date: complaint.updatedAt || complaint.createdAt,
                title: 'Complaint Rejected',
                description: complaint.resolution || 'Complaint was rejected',
                icon: XCircle,
                color: 'red'
            });
        }

        // 5. Admin Assignment (if available)
        if (complaint.assignedTo) {
            events.push({
                id: 'assigned',
                type: 'assigned',
                date: complaint.assignedAt || complaint.updatedAt,
                title: 'Admin Assigned',
                description: `Assigned to ${complaint.assignedTo.name || 'an administrator'}`,
                icon: Users,
                color: 'purple'
            });
        }

        // 6. Rating (if available)
        if (complaint.rating) {
            events.push({
                id: 'rated',
                type: 'rated',
                date: complaint.ratedAt || complaint.updatedAt,
                title: 'Satisfaction Rating',
                description: `Rated ${complaint.rating} stars - ${complaint.feedback || 'No additional feedback'}`,
                icon: MessageSquare,
                color: 'amber'
            });
        }

        // Sort by date (newest first)
        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const events = buildTimeline();

    const getColorClasses = (color) => {
        const colors = {
            emerald: {
                bg: 'bg-emerald-100 dark:bg-emerald-900/30',
                text: 'text-emerald-600 dark:text-emerald-400',
                border: 'border-emerald-200 dark:border-emerald-800',
                ring: 'ring-emerald-500 dark:ring-emerald-400'
            },
            blue: {
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                text: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800',
                ring: 'ring-blue-500 dark:ring-blue-400'
            },
            green: {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-600 dark:text-green-400',
                border: 'border-green-200 dark:border-green-800',
                ring: 'ring-green-500 dark:ring-green-400'
            },
            red: {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-600 dark:text-red-400',
                border: 'border-red-200 dark:border-red-800',
                ring: 'ring-red-500 dark:ring-red-400'
            },
            purple: {
                bg: 'bg-purple-100 dark:bg-purple-900/30',
                text: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-200 dark:border-purple-800',
                ring: 'ring-purple-500 dark:ring-purple-400'
            },
            amber: {
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                text: 'text-amber-600 dark:text-amber-400',
                border: 'border-amber-200 dark:border-amber-800',
                ring: 'ring-amber-500 dark:ring-amber-400'
            }
        };
        return colors[color] || colors.emerald;
    };

    return (
        <div className={clsx("relative", className)}>
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-200 to-transparent dark:from-emerald-600 dark:via-emerald-400" />

            <div className="space-y-6 relative">
                {events.map((event, index) => {
                    const Icon = event.icon;
                    const colors = getColorClasses(event.color);

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-4 relative"
                        >
                            {/* Timeline dot */}
                            <div className="relative z-10">
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2",
                                    colors.bg,
                                    colors.text,
                                    colors.border
                                )}>
                                    <Icon size={16} />
                                </div>
                            </div>

                            {/* Event content */}
                            <div className="flex-1 pt-1 pb-4">
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                        {event.title}
                                    </h4>
                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <Calendar size={10} />
                                        {new Date(event.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                        {new Date(event.date).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {event.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {events.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <Clock size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No timeline events yet</p>
                </div>
            )}
        </div>
    );
};

export default ComplaintTimeline;