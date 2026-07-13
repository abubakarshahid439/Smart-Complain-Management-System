import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, Mail, MessageSquare, Tag, AlertCircle, Clock, 
    Calendar, Shield, Hash, FileText, UserCheck, Flag,
    Layers, ExternalLink, Copy, CheckCircle2, Timer,
    AlertTriangle, Info, Briefcase, Building2
} from 'lucide-react';
import { clsx } from 'clsx';
import CountdownTimer from './CountdownTimer';

// Animation Variants
const modalVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
        x: 0, 
        opacity: 1,
        transition: { 
            type: 'spring', 
            damping: 30, 
            stiffness: 200,
            when: 'beforeChildren',
            staggerChildren: 0.05
        }
    },
    exit: { 
        x: '100%', 
        opacity: 0,
        transition: { 
            type: 'spring', 
            damping: 25, 
            stiffness: 180 
        }
    }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

const ComplaintDetailsModal = ({ isOpen, onClose, complaint }) => {
    if (!complaint) return null;

    const getPriorityConfig = (priority) => {
        const configs = {
            High: {
                bg: 'from-rose-50 to-rose-100/50',
                border: 'border-rose-200',
                icon: AlertTriangle,
                color: 'text-rose-600',
                glow: 'shadow-rose-100/50',
                dot: 'bg-rose-500'
            },
            Medium: {
                bg: 'from-amber-50 to-amber-100/50',
                border: 'border-amber-200',
                icon: Clock,
                color: 'text-amber-600',
                glow: 'shadow-amber-100/50',
                dot: 'bg-amber-500'
            },
            Low: {
                bg: 'from-emerald-50 to-emerald-100/50',
                border: 'border-emerald-200',
                icon: CheckCircle2,
                color: 'text-emerald-600',
                glow: 'shadow-emerald-100/50',
                dot: 'bg-emerald-500'
            }
        };
        return configs[priority] || configs.Low;
    };

    const getStatusConfig = (status) => {
        const configs = {
            Resolved: {
                bg: 'from-emerald-100 to-emerald-50',
                border: 'border-emerald-200',
                icon: CheckCircle2,
                color: 'text-emerald-700',
                dot: 'bg-emerald-500',
                label: 'Resolved'
            },
            'In Progress': {
                bg: 'from-blue-100 to-blue-50',
                border: 'border-blue-200',
                icon: Timer,
                color: 'text-blue-700',
                dot: 'bg-blue-500',
                label: 'In Progress'
            },
            Pending: {
                bg: 'from-amber-100 to-amber-50',
                border: 'border-amber-200',
                icon: AlertCircle,
                color: 'text-amber-700',
                dot: 'bg-amber-500',
                label: 'Pending'
            }
        };
        return configs[status] || configs.Pending;
    };

    const priorityConfig = getPriorityConfig(complaint.priority);
    const statusConfig = getStatusConfig(complaint.status);
    const PriorityIcon = priorityConfig.icon;
    const StatusIcon = statusConfig.icon;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Technical': Building2,
            'Billing': Briefcase,
            'Support': Layers,
            'General': Info
        };
        return icons[category] || Info;
    };

    const CategoryIcon = getCategoryIcon(complaint.category);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative bg-gradient-to-br from-white via-white to-slate-50/80 w-full max-w-2xl h-full shadow-2xl shadow-slate-200/60 flex flex-col"
                    >
                        {/* Decorative Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x z-10" />

                        {/* Header */}
                        <div className="relative flex-shrink-0 p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50/80 border-b border-slate-200/60">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 min-w-0">
                                    {/* Icon Container */}
                                    <motion.div
                                        initial={{ scale: 0.8, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className={clsx(
                                            "relative p-3 rounded-2xl shadow-lg flex-shrink-0",
                                            `bg-gradient-to-br ${priorityConfig.bg}`,
                                            `border ${priorityConfig.border}`,
                                            priorityConfig.glow
                                        )}
                                    >
                                        <PriorityIcon size={24} className={priorityConfig.color} />
                                        <div className={clsx(
                                            "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                                            priorityConfig.dot,
                                            "ring-2 ring-white animate-pulse"
                                        )} />
                                    </motion.div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <motion.h3 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-xl font-black text-slate-900 font-outfit truncate"
                                            >
                                                Complaint #{complaint._id?.slice(-6).toUpperCase()}
                                            </motion.h3>
                                            <motion.button
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(complaint._id);
                                                }}
                                            >
                                                <Copy size={14} />
                                            </motion.button>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className={clsx(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    `bg-gradient-to-r ${statusConfig.bg}`,
                                                    `border ${statusConfig.border}`,
                                                    statusConfig.color
                                                )}
                                            >
                                                <StatusIcon size={12} />
                                                {statusConfig.label}
                                            </motion.span>
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.15 }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Tag size={12} />
                                                {complaint.category}
                                            </motion.span>
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200/50 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Flag size={12} />
                                                {complaint.priority} Priority
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <motion.button
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="flex-shrink-0 p-2.5 rounded-full bg-white hover:bg-slate-100 transition-all shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            {/* Countdown Timer (if In Progress) */}
                            {complaint.status === 'In Progress' && complaint.estimatedCompletionDate && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-4"
                                >
                                    <CountdownTimer targetDate={complaint.estimatedCompletionDate} />
                                </motion.div>
                            )}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                            <div className="space-y-8">
                                {/* Complainant Info */}
                                <motion.section
                                    variants={sectionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <User size={14} />
                                            Complainant Details
                                        </h4>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <motion.div
                                            variants={itemVariants}
                                            className="group relative p-4 rounded-xl bg-white border border-slate-200/60 hover:border-indigo-200/60 hover:shadow-lg hover:shadow-indigo-100/30 transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/50 group-hover:to-transparent transition-all duration-500" />
                                            <div className="relative flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                                                    <User size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">
                                                        Full Name
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {complaint.user?.name || 'Unknown User'}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="group relative p-4 rounded-xl bg-white border border-slate-200/60 hover:border-indigo-200/60 hover:shadow-lg hover:shadow-indigo-100/30 transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/50 group-hover:to-transparent transition-all duration-500" />
                                            <div className="relative flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                                                    <Mail size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">
                                                        Email Address
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {complaint.user?.email || 'No Email'}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.section>

                                {/* Tracking Details */}
                                <motion.section
                                    variants={sectionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Layers size={14} />
                                            Tracking Information
                                        </h4>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <motion.div
                                            variants={itemVariants}
                                            className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60"
                                        >
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Calendar size={12} className="text-slate-400" />
                                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                                    Filed
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-900">
                                                {formatDate(complaint.createdAt)}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60"
                                        >
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Hash size={12} className="text-slate-400" />
                                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                                    Priority
                                                </span>
                                            </div>
                                            <p className={clsx(
                                                "text-[11px] font-black uppercase tracking-tight",
                                                complaint.priority === 'High' ? "text-rose-600" :
                                                complaint.priority === 'Medium' ? "text-amber-600" : 
                                                "text-emerald-600"
                                            )}>
                                                {complaint.priority}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60"
                                        >
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <FileText size={12} className="text-slate-400" />
                                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                                    Category
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-900 truncate">
                                                {complaint.category}
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            variants={itemVariants}
                                            className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60"
                                        >
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Clock size={12} className="text-slate-400" />
                                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                                    Status
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className={clsx(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    complaint.status === 'Resolved' ? "bg-emerald-500" :
                                                    complaint.status === 'In Progress' ? "bg-blue-500" : 
                                                    "bg-amber-500"
                                                )} />
                                                <span className="text-[11px] font-bold text-slate-900">
                                                    {complaint.status}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.section>

                                {/* Subject & Description */}
                                <motion.section
                                    variants={sectionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <MessageSquare size={14} />
                                            Complaint Details
                                        </h4>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                                    </div>

                                    {/* Subject / Title */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="relative p-5 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/60 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
                                        <div className="relative flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                                <MessageSquare size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600/60 mb-1">
                                                    Subject
                                                </p>
                                                <h5 className="text-base font-extrabold text-slate-900 leading-tight">
                                                    {complaint.title}
                                                </h5>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Description */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="p-5 rounded-xl bg-white border border-slate-200/60 hover:border-slate-300/60 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText size={14} className="text-slate-400" />
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                                Description
                                            </span>
                                        </div>
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                                {complaint.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.section>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="relative flex-shrink-0 p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50/80 border-t border-slate-200/60">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Active</span>
                                    </div>
                                    <span className="text-slate-300">|</span>
                                    <span>ID: {complaint._id?.slice(-8).toUpperCase()}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            // Add your action handler here
                                        }}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 font-bold text-sm hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            <ExternalLink size={16} />
                                            View Full
                                        </span>
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-sm hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200/50"
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ComplaintDetailsModal;