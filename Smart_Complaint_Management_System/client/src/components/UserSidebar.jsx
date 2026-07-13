import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FileText, PlusCircle, User, Mail, BarChart3, Clock, CheckCircle, ChevronDown, UserCircle, Edit2, Leaf } from 'lucide-react';
import { clsx } from 'clsx';
import ProfileModal from './ProfileModal';

const UserSidebar = ({ complaints, activeSection, onNavigate, isMobileOpen, onClose }) => {
    const { user } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileModal, setProfileModal] = useState({ isOpen: false, view: 'view' });

    // Calculate stats
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'In Progress').length;

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'complaints', label: 'My Complaints', icon: FileText },
        { id: 'submit', label: 'Submit New', icon: PlusCircle }
    ];

    const stats = [
        { label: 'Total', value: totalComplaints, icon: BarChart3, color: 'emerald' },
        { label: 'Pending', value: pendingComplaints, icon: Clock, color: 'amber' },
        { label: 'In Progress', value: inProgressComplaints, icon: Clock, color: 'blue' },
        { label: 'Resolved', value: resolvedComplaints, icon: CheckCircle, color: 'green' }
    ];

    const getStatColors = (color) => {
        const colors = {
            emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
            amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
            blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
            green: { bg: 'bg-green-100', text: 'text-green-600' }
        };
        return colors[color] || colors.emerald;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white/95 backdrop-blur-xl z-40 border-r border-emerald-100/30",
                    "transition-transform duration-300 ease-in-out overflow-y-auto",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="space-y-8 p-6">
                    {/* User Profile Section */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-full premium-card p-6 text-center bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-100/50 hover:border-emerald-300 transition-all group relative overflow-hidden"
                        >
                            {/* Decorative glow */}
                            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <div className="relative inline-block mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                    <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 text-2xl font-black shadow-lg border-2 border-emerald-200 group-hover:scale-105 transition-transform">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        <Leaf size={12} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <h3 className="text-lg font-extrabold text-slate-900 font-outfit">{user?.name}</h3>
                                    <ChevronDown size={14} className={clsx("text-emerald-400 transition-transform", isProfileOpen && "rotate-180")} />
                                </div>
                                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-3">
                                    <Mail size={14} className="text-emerald-400" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200">
                                    {user?.role}
                                </span>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute left-0 right-0 mt-2 bg-white rounded-2xl premium-shadow border border-emerald-100 overflow-hidden z-[50]"
                                >
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setProfileModal({ isOpen: true, view: 'view' });
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-left"
                                        >
                                            <UserCircle size={18} /> View Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProfileModal({ isOpen: true, view: 'edit' });
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-left"
                                        >
                                            <Edit2 size={18} /> Edit Name
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-2">
                        <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 px-3">Menu</h4>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        if (isMobileOpen) onClose();
                                    }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left relative group",
                                        isActive
                                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm shadow-emerald-100/50 border border-emerald-200"
                                            : "text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full"></div>
                                    )}
                                    <Icon size={18} className={isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Quick Stats */}
                    <div className="space-y-3 pb-6">
                        <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 px-3">Quick Stats</h4>
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            const colors = getStatColors(stat.color);
                            return (
                                <motion.div
                                    key={stat.label}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-emerald-100/30 hover:border-emerald-200 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-lg flex items-center justify-center",
                                            colors.bg,
                                            colors.text
                                        )}>
                                            <Icon size={16} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                                    </div>
                                    <span className="text-lg font-black text-emerald-700">{stat.value}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={profileModal.isOpen}
                onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
                initialView={profileModal.view}
            />
        </>
    );
};

export default UserSidebar;