import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Home, List, Mail, BarChart3, Clock, CheckCircle, 
    AlertTriangle, ChevronDown, UserCircle, Edit2, History,
    LayoutDashboard, Settings, LogOut, Shield, Award,
    TrendingUp, Users, Activity, Zap, Leaf
} from 'lucide-react';
import { clsx } from 'clsx';
import ProfileModal from './ProfileModal';

// Animation variants
const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: -320, opacity: 0, transition: { duration: 0.3 } }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

const menuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
        x: 0,
        opacity: 1,
        transition: { delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }
    })
};

const statsVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: (i) => ({
        scale: 1,
        opacity: 1,
        transition: { delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }
    })
};

const AdminSidebar = ({ complaints, isMobileOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileModal, setProfileModal] = useState({ isOpen: false, view: 'view' });

    // Calculate stats
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'In Progress').length;

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin-dashboard', color: 'emerald' },
        { id: 'complaints', label: 'Manage Complaints', icon: List, path: '/admin/complaints', color: 'teal' },
        { id: 'history', label: 'Complaint History', icon: History, path: '/admin/history', color: 'green' },
        { id: 'analytics', label: 'User Analytics', icon: TrendingUp, path: '/admin/analytics', color: 'emerald' },
    ];

    const stats = [
        { label: 'Total', value: totalComplaints, icon: BarChart3, color: 'emerald', gradient: 'from-emerald-50 to-teal-50' },
        { label: 'Pending', value: pendingComplaints, icon: Clock, color: 'amber', gradient: 'from-amber-50 to-amber-100' },
        { label: 'In Progress', value: inProgressComplaints, icon: Activity, color: 'emerald', gradient: 'from-emerald-50 to-teal-50' },
        { label: 'Resolved', value: resolvedComplaints, icon: CheckCircle, color: 'green', gradient: 'from-green-50 to-emerald-50' }
    ];

    const getStatusColor = (color) => {
        const colors = {
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            amber: 'bg-amber-50 text-amber-600 border-amber-100',
            teal: 'bg-teal-50 text-teal-600 border-teal-100',
            green: 'bg-green-50 text-green-600 border-green-100',
            purple: 'bg-purple-50 text-purple-600 border-purple-100',
            rose: 'bg-rose-50 text-rose-600 border-rose-100'
        };
        return colors[color] || colors.emerald;
    };

    const getMenuButtonColor = (color) => {
        const colors = {
            emerald: 'hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100',
            teal: 'hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100',
            green: 'hover:bg-green-50 hover:text-green-700 active:bg-green-100',
            purple: 'hover:bg-purple-50 hover:text-purple-700 active:bg-purple-100'
        };
        return colors[color] || 'hover:bg-slate-50 hover:text-slate-700';
    };

    const getActiveMenuColor = (color) => {
        const colors = {
            emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200/60',
            teal: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-200/60',
            green: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-200/60',
            purple: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-200/60'
        };
        return colors[color] || 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-lg shadow-emerald-200/60';
    };

    const getIconBgColor = (color) => {
        const colors = {
            emerald: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600',
            amber: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600',
            teal: 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600',
            green: 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600'
        };
        return colors[color] || 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600';
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={clsx(
                    "fixed top-16 left-0 h-[calc(100vh-4rem)] w-[280px] bg-white/95 backdrop-blur-xl z-40",
                    "transition-all duration-300 ease-in-out overflow-y-auto",
                    "border-r border-emerald-100/30 shadow-xl shadow-emerald-100/30",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="relative h-full">
                    {/* Decorative gradient line at top */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient-x" />

                    <div className="space-y-6 p-5">
                        {/* Admin Profile Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative"
                        >
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-full group relative overflow-hidden"
                            >
                                {/* Card Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className={clsx(
                                    "relative p-5 text-center rounded-2xl",
                                    "border-2 border-emerald-100/50",
                                    "bg-gradient-to-br from-white to-emerald-50/30",
                                    "hover:border-emerald-300/60 hover:shadow-xl hover:shadow-emerald-100/50",
                                    "transition-all duration-300 ease-in-out",
                                    "group-hover:scale-[1.02] active:scale-[0.98]"
                                )}>
                                    {/* Avatar with Ring */}
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 animate-spin-slow opacity-75" />
                                        <div className="absolute inset-[3px] rounded-full bg-white" />
                                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-2xl font-black">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Online Status Dot */}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-md">
                                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                                        </div>
                                        {/* Leaf Icon Badge */}
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            <Leaf size={12} className="text-white" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800 font-outfit line-clamp-1">
                                            {user?.name}
                                        </h3>
                                        <motion.div
                                            animate={{ rotate: isProfileOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown size={16} className="text-emerald-400" />
                                        </motion.div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-3">
                                        <Mail size={12} className="text-emerald-400" />
                                        <span className="truncate">{user?.email}</span>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                                        <Shield size={12} className="text-emerald-600" />
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                                            {user?.role} Portal
                                        </span>
                                        <Award size={12} className="text-emerald-400" />
                                    </div>
                                </div>
                            </button>

                            {/* Profile Dropdown */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-emerald-200/40 border border-emerald-100 overflow-hidden z-50"
                                    >
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => {
                                                    setProfileModal({ isOpen: true, view: 'view' });
                                                    setIsProfileOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-200"
                                            >
                                                <UserCircle size={18} className="text-emerald-500" />
                                                <span>View Profile</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProfileModal({ isOpen: true, view: 'edit' });
                                                    setIsProfileOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-700 transition-all duration-200"
                                            >
                                                <Edit2 size={18} className="text-emerald-500" />
                                                <span>Edit Name</span>
                                            </button>
                                            <div className="border-t border-emerald-100 my-1" />
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    navigate('/login');
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100 transition-all duration-200"
                                            >
                                                <LogOut size={18} className="text-rose-500" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Navigation Menu */}
                        <nav className="space-y-1">
                            <div className="flex items-center gap-2 px-3 mb-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-200" />
                                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">
                                    Main Menu
                                </h4>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-200" />
                            </div>
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <motion.button
                                        key={item.id}
                                        custom={index}
                                        variants={menuItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        onClick={() => {
                                            navigate(item.path);
                                            if (isMobileOpen) onClose();
                                        }}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative",
                                            isActive
                                                ? getActiveMenuColor(item.color)
                                                : `text-slate-600 ${getMenuButtonColor(item.color)}`
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                        <Icon size={18} className={clsx(
                                            "transition-colors duration-200",
                                            isActive ? "text-white" : "text-emerald-400 group-hover:text-current"
                                        )} />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <Zap size={12} className="ml-auto text-white/60" />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </nav>

                        {/* Quick Stats */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-3 mb-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-200" />
                                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">
                                    Live Stats
                                </h4>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {stats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <motion.div
                                            key={stat.label}
                                            custom={index}
                                            variants={statsVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className={clsx(
                                                "relative overflow-hidden px-3 py-3 rounded-xl",
                                                "bg-gradient-to-br border",
                                                stat.gradient,
                                                `border-${stat.color === 'emerald' ? 'emerald' : stat.color === 'teal' ? 'teal' : stat.color === 'green' ? 'green' : 'amber'}-200/50`
                                            )}
                                            whileHover={{ scale: 1.03 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {stat.label}
                                                    </p>
                                                    <motion.p 
                                                        key={stat.value}
                                                        initial={{ scale: 1.2, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="text-lg font-extrabold text-slate-800 leading-none"
                                                    >
                                                        {stat.value}
                                                    </motion.p>
                                                </div>
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                                    getIconBgColor(stat.color)
                                                )}>
                                                    <Icon size={14} />
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200/30">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${totalComplaints > 0 ? (stat.value / totalComplaints) * 100 : 0}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={clsx(
                                                        "h-full rounded-full",
                                                        stat.color === 'emerald' && "bg-emerald-500",
                                                        stat.color === 'amber' && "bg-amber-500",
                                                        stat.color === 'teal' && "bg-teal-500",
                                                        stat.color === 'green' && "bg-green-500"
                                                    )}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 mt-4 border-t border-emerald-100/50">
                            <div className="flex items-center justify-between px-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-medium text-emerald-600">System Online</span>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-300">v2.0.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={profileModal.isOpen}
                onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
                initialView={profileModal.view}
            />
        </>
    );
};

export default AdminSidebar;