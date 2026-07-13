import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Search, Filter, Menu, X, Users, BarChart3, TrendingUp,
    Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import CustomDropdown from '../components/CustomDropdown';

const UserAnalytics = () => {
    const { isSystemOnline } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sortBy, setSortBy] = useState('total'); // 'total', 'resolved', 'name'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [complaintsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/complaints', config),
                axios.get('http://localhost:5000/api/auth/users', config)
            ]);

            setComplaints(complaintsRes.data.data);
            setAllUsers(usersRes.data.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const userAnalytics = useMemo(() => {
        const usersMap = {};

        // Pre-fill with all users to ensure 0-complaint users are included
        allUsers.forEach(u => {
            usersMap[u._id] = {
                id: u._id,
                name: u.name,
                email: u.email,
                total: 0,
                pending: 0,
                inProgress: 0,
                resolved: 0,
                rejected: 0
            };
        });

        // Fill in complaint stats
        complaints.forEach(c => {
            const userId = c.user?._id || c.user; // Handle both populated and unpopulated
            if (!userId || !usersMap[userId]) return;

            usersMap[userId].total += 1;
            if (c.status === 'Pending') usersMap[userId].pending += 1;
            if (c.status === 'In Progress') usersMap[userId].inProgress += 1;
            if (c.status === 'Resolved') usersMap[userId].resolved += 1;
            if (c.status === 'Rejected') usersMap[userId].rejected += 1;
        });

        let result = Object.values(usersMap).filter(u =>
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (sortBy) {
            case 'total':
                result.sort((a, b) => b.total - a.total);
                break;
            case 'resolved':
                result.sort((a, b) => b.resolved - a.resolved);
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return result;
    }, [complaints, searchTerm, sortBy]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-100 border-t-emerald-600 border-b-teal-600"></div>
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] animate-pulse">Analyzing Data...</p>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden">
            <AdminSidebar
                complaints={complaints}
                isMobileOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 h-full overflow-y-auto lg:ml-72 lg:pl-8 px-4"
            >
                <div className="lg:hidden sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-emerald-100/30 -mx-4 px-4 py-3 mb-6">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        <span className="text-sm">{isSidebarOpen ? 'Close Menu' : 'Open Menu'}</span>
                    </button>
                </div>

                <div className="w-full space-y-10 pr-4 lg:pr-8 py-10 pt-24">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">
                                User <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Analytics</span>
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium">Detailed breakdown of complaint status per registered user.</p>
                            <div className="mt-2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                        </div>
                        <div
                            className={clsx(
                                "flex items-center gap-3 p-1.5 rounded-2xl border shadow-sm transition-all",
                                isSystemOnline ? "bg-white border-emerald-100 shadow-emerald-100/50" : "bg-red-50 border-red-100 shadow-red-100/50"
                            )}
                        >
                            <div className={clsx(
                                "w-2.5 h-2.5 rounded-full ml-2",
                                isSystemOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                            )}></div>
                            <span className={clsx(
                                "text-[11px] font-black uppercase tracking-widest mr-3",
                                isSystemOnline ? "text-emerald-600" : "text-red-600"
                            )}>
                                System {isSystemOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </header>

                    <div className="premium-card overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl">
                        <div className="p-6 sm:p-10 border-b border-emerald-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">User Breakdown</h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">Complaint distribution across your user base.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative group w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50/50 border-2 border-slate-200/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:bg-white transition-all duration-300"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none group-focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.1)] transition-shadow"></div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Filter className="text-emerald-400" size={18} />
                                    <CustomDropdown
                                        className="min-w-[170px]"
                                        options={[
                                            { label: 'Sort by Activity', value: 'total' },
                                            { label: 'Sort by Success', value: 'resolved' },
                                            { label: 'Sort by Name', value: 'name' }
                                        ]}
                                        value={sortBy}
                                        onChange={(val) => setSortBy(val)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-emerald-50/30 to-teal-50/30 text-emerald-600 text-[10px] uppercase font-black tracking-[0.2em]">
                                        <th className="px-10 py-6">User Identity</th>
                                        <th className="px-10 py-6 text-center">Total</th>
                                        <th className="px-10 py-6 text-center">Pending</th>
                                        <th className="px-10 py-6 text-center">In Progress</th>
                                        <th className="px-10 py-6 text-center">Resolved</th>
                                        <th className="px-10 py-6 text-center text-red-500">Rejected</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-50/50">
                                    {userAnalytics.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-10 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full border border-emerald-100">
                                                        <Users className="text-emerald-300" size={40} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-extrabold text-slate-900 font-outfit">No Users Found</p>
                                                        <p className="text-sm text-slate-500 font-medium">No users match your search criteria.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        userAnalytics.map((u) => (
                                            <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors group">
                                                <td className="px-4 sm:px-10 py-4 sm:py-6">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 font-black text-xs sm:text-sm border border-emerald-200 group-hover:bg-white transition-colors">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{u.name}</p>
                                                            <p className="hidden md:block text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-1">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-10 py-4 sm:py-6 text-center">
                                                    <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-[10px] sm:text-xs font-black">
                                                        {u.total}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-10 py-4 sm:py-6 text-center">
                                                    <span className="text-xs sm:text-sm font-bold text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {u.pending > 0 ? u.pending : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-10 py-4 sm:py-6 text-center">
                                                    <span className="text-xs sm:text-sm font-bold text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {u.inProgress > 0 ? u.inProgress : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-10 py-4 sm:py-6 text-center">
                                                    <span className="text-xs sm:text-sm font-bold text-green-500 group-hover:scale-110 inline-block transition-transform">
                                                        {u.resolved > 0 ? u.resolved : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-10 py-4 sm:py-6 text-center">
                                                    <span className="text-xs sm:text-sm font-bold text-red-500 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {u.rejected > 0 ? u.rejected : '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserAnalytics;