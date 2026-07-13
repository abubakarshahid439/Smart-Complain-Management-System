import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Users, MessageSquare, AlertCircle, CheckCircle2,
    BarChart3, PieChart as PieChartIcon, ArrowRight, TrendingUp,
    Search, Filter, MoreHorizontal, Edit3, XCircle, Menu, X,
    ChevronDown, Star, Clock, Calendar, ThumbsUp
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AdminSidebar from '../components/AdminSidebar';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import ComplaintTimeline from '../components/ComplaintTimeline';
import ChatWindow from '../components/ChatWindow';

const AdminDashboard = () => {
    const { user, isSystemOnline, toggleSystemStatus } = useAuth();
    const { isDark } = useTheme();
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [updateForm, setUpdateForm] = useState({ status: '', resolution: '' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('latest');
    const [showTimelineFor, setShowTimelineFor] = useState(null);
    const [showChatFor, setShowChatFor] = useState(null);

    // Process complaints data for the weekly analytics sparkline
    const processAnalyticsData = (allComplaints) => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date();

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            last7Days.push({
                fullDate: d.toDateString(),
                day: days[d.getDay()],
                value: 0
            });
        }

        allComplaints.forEach(complaint => {
            const complaintDate = new Date(complaint.createdAt).toDateString();
            const dayIndex = last7Days.findIndex(d => d.fullDate === complaintDate);
            if (dayIndex !== -1) {
                last7Days[dayIndex].value += 1;
            }
        });

        return last7Days;
    };

    const analyticsData = useMemo(() => processAnalyticsData(complaints), [complaints]);

    // Calculate rating statistics
    const ratingStats = useMemo(() => {
        const ratedComplaints = complaints.filter(c => c.rating);
        const totalRated = ratedComplaints.length;
        const averageRating = totalRated > 0 
            ? ratedComplaints.reduce((acc, c) => acc + c.rating, 0) / totalRated 
            : 0;
        
        const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
        const ratingRate = resolvedCount > 0 ? Math.round((totalRated / resolvedCount) * 100) : 0;

        return { totalRated, averageRating, ratingRate };
    }, [complaints]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            console.log('Fetching admin data...');
            const [complaintsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/complaints', config),
                axios.get('http://localhost:5000/api/complaints/stats', config)
            ]);

            console.log('Complaints response:', complaintsRes.data.data);
            console.log('Ratings in complaints:', complaintsRes.data.data.map(c => ({ 
                id: c._id, 
                title: c.title, 
                rating: c.rating,
                feedback: c.feedback,
                status: c.status
            })));

            setComplaints(complaintsRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/complaints/${id}`, updateForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            fetchAdminData();
        } catch (error) {
            alert('Update failed');
        }
    };

    const statusColors = {
        'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-400/20',
        'In Progress': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-400/20',
        'Resolved': 'bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-400/20',
        'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-400/20'
    };

    const COLORS = isDark 
        ? ['#34d399', '#2dd4bf', '#fbbf24', '#f87171', '#a78bfa']
        : ['#10b981', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const filteredComplaints = useMemo(() => {
        let result = (complaints || []).filter(c =>
            (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const priorityWeights = { 'High': 3, 'Medium': 2, 'Low': 1 };

        switch (sortBy) {
            case 'latest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'priority-desc':
                result.sort((a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0));
                break;
            case 'priority-asc':
                result.sort((a, b) => (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0));
                break;
            default:
                break;
        }

        return result;
    }, [complaints, searchTerm, sortBy]);

    // Render stars for rating
    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-600"}
                    />
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-100 dark:border-emerald-900/30 border-t-emerald-600 dark:border-t-emerald-400 border-b-teal-600 dark:border-b-teal-400"></div>
            </div>
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] animate-pulse">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20 overflow-hidden">
            <AdminSidebar
                complaints={complaints}
                isMobileOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 h-full overflow-y-auto lg:ml-72 lg:pl-8 px-4 pb-8"
            >
                {/* Mobile Menu Toggle */}
                <div className="lg:hidden sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-emerald-100/30 dark:border-emerald-900/30 -mx-4 px-4 py-3 mb-6">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        <span className="text-sm">{isSidebarOpen ? 'Close Menu' : 'Open Menu'}</span>
                    </button>
                </div>

                <div className="w-full space-y-6 sm:space-y-10 pr-2 sm:pr-4 lg:pr-8 py-6 sm:py-10 pt-20 sm:pt-24">
                    {/* Header */}
                    <header id="dashboard" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 scroll-mt-24">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit">
                                Admin <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{user?.name}</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium text-sm sm:text-base">Comprehensive system overview and analytics.</p>
                            <div className="mt-2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                        </div>
                        <button
                            onClick={toggleSystemStatus}
                            className={clsx(
                                "flex items-center gap-1.5 p-1 rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95",
                                isSystemOnline 
                                    ? "bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-800 shadow-emerald-100/50 dark:shadow-emerald-900/30" 
                                    : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 shadow-red-100/50 dark:shadow-red-900/30"
                            )}
                        >
                            <div className={clsx(
                                "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ml-1.5",
                                isSystemOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                            )}></div>
                            <span className={clsx(
                                "text-[10px] sm:text-[11px] font-black uppercase tracking-widest mr-2",
                                isSystemOnline ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            )}>
                                System {isSystemOnline ? 'Online' : 'Offline'}
                            </span>
                        </button>
                    </header>

                    {/* Main Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {[
                            { label: 'Total Complaints', val: complaints.length, icon: MessageSquare, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                            { label: 'Pending Review', val: complaints.filter(c => c.status === 'Pending').length, icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                            { label: 'In Progress', val: complaints.filter(c => c.status === 'In Progress').length, icon: Edit3, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                            { label: 'Resolved', val: complaints.filter(c => c.status === 'Resolved').length, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="premium-card p-3 sm:p-4 lg:p-6 flex items-center gap-3 sm:gap-4 group hover:scale-[1.02] sm:hover:scale-[1.03] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl"
                            >
                                <div className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:rotate-6 shrink-0`}>
                                    <stat.icon size={16} className="sm:w-6 sm:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 leading-tight">{stat.label}</p>
                                    <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-outfit">{stat.val}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Rating Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="premium-card p-4 sm:p-6 bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl sm:rounded-3xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                                    <Star className="text-amber-600 dark:text-amber-400" size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Average Rating</p>
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                        {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="premium-card p-4 sm:p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl sm:rounded-3xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                                    <ThumbsUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Ratings</p>
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                        {ratingStats.totalRated}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="premium-card p-4 sm:p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl sm:rounded-3xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                                    <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Rating Rate</p>
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                        {ratingStats.ratingRate}%
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Category Distribution Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="premium-card p-4 sm:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl"
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                                        <BarChart3 className="text-emerald-600 dark:text-emerald-400" size={14} sm:size={18} />
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tighter text-xs sm:text-sm">Category Distribution</h3>
                                </div>
                            </div>
                            <div className="w-full h-[220px] sm:h-[250px] lg:h-[280px] min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.category || []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
                                        <XAxis dataKey="_id" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                                        <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ 
                                                backgroundColor: isDark ? '#1e293b' : '#fff', 
                                                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', 
                                                borderRadius: '12px', 
                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                                color: isDark ? '#f1f5f9' : '#0f172a'
                                            }}
                                            itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: 'bold' }}
                                            cursor={{ fill: isDark ? '#334155' : '#f8fafc' }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                            animationBegin={300}
                                        >
                                            {(stats?.category || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Priority Status Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="premium-card p-4 sm:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl"
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                                        <PieChartIcon className="text-emerald-600 dark:text-emerald-400" size={14} sm:size={18} />
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tighter text-xs sm:text-sm">Priority Status</h3>
                                </div>
                            </div>
                            <div className="w-full h-[220px] sm:h-[250px] lg:h-[280px] min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.priority || []}
                                            cx="50%" cy="50%"
                                            innerRadius={40}
                                            outerRadius={65}
                                            paddingAngle={4}
                                            dataKey="count"
                                            nameKey="_id"
                                            stroke="none"
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                            animationBegin={500}
                                        >
                                            {stats?.priority.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ 
                                                backgroundColor: isDark ? '#1e293b' : '#fff', 
                                                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', 
                                                borderRadius: '12px',
                                                color: isDark ? '#f1f5f9' : '#0f172a'
                                            }}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={36} 
                                            iconType="circle" 
                                            wrapperStyle={{ 
                                                fontSize: '8px',
                                                color: isDark ? '#94a3b8' : '#475569'
                                            }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Complaint Analytics Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="premium-card p-4 sm:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl relative"
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                                        <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={14} sm:size={18} />
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white font-outfit uppercase tracking-tighter text-xs sm:text-sm">Complaint Analytics</h3>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 mt-2 sm:mt-4">
                                <span className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">{complaints.filter(c => c.status === 'Resolved').length}</span>
                                <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-500">/ {complaints.length}</span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mt-1">Resolved</p>

                            <div className="absolute top-16 sm:top-20 right-4 sm:right-8 bg-white dark:bg-slate-700 border-2 border-emerald-500 dark:border-emerald-400 rounded-lg px-2 py-1 text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 shadow-lg z-10">
                                {complaints.length > 0 ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100) : 0}%
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rotate-45"></div>
                            </div>

                            <div className="w-full h-[80px] sm:h-[100px] lg:h-[120px] min-h-[60px] mt-2 sm:mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analyticsData}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            stroke={isDark ? "#34d399" : "#10b981"}
                                            fontSize={8}
                                            fontWeight={900}
                                            padding={{ left: 10, right: 10 }}
                                        />
                                        <Tooltip 
                                            headerStyle={{ display: 'none' }} 
                                            contentStyle={{ 
                                                borderRadius: '12px', 
                                                border: 'none', 
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                backgroundColor: isDark ? '#1e293b' : '#fff',
                                                color: isDark ? '#f1f5f9' : '#0f172a'
                                            }} 
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={isDark ? "#34d399" : "#10b981"}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorVal)"
                                            isAnimationActive={true}
                                            animationDuration={1500}
                                            animationBegin={700}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Complaints Table with Chat and Rating */}
                    <div className="premium-card p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">
                                    Recent Complaints
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                                    Latest activity across the system
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        className="w-full sm:w-48 lg:w-64 bg-slate-50/50 dark:bg-slate-700/50 border-2 border-slate-200/50 dark:border-slate-600/50 rounded-xl py-2 pl-9 pr-3 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:bg-white dark:focus:bg-slate-700 transition-all duration-300"
                                        placeholder="Search complaints..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="w-full sm:w-auto px-3 py-2 bg-slate-50/50 dark:bg-slate-700/50 border-2 border-slate-200/50 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="latest">Latest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="priority-desc">High Priority</option>
                                    <option value="priority-asc">Low Priority</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-700/30 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">User</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Title</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">Priority</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">Rating</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {filteredComplaints.slice(0, 10).map((c) => (
                                        <tr
                                            key={c._id}
                                            onClick={() => {
                                                setSelectedComplaint(c);
                                                setIsDetailsModalOpen(true);
                                            }}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-200 dark:border-emerald-800 group-hover:bg-white transition-colors">
                                                        {c.user?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">{c.user?.name}</p>
                                                        <p className="hidden xs:block text-[10px] text-slate-500 dark:text-slate-400">{c.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {c.title}
                                                </p>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <span className={clsx(
                                                    "text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest",
                                                    c.priority === 'High' ? "text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" :
                                                        c.priority === 'Medium' ? "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" : 
                                                        "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                                )}>
                                                    {c.priority}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <span className={clsx(
                                                    "text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest whitespace-nowrap",
                                                    c.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                                        c.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                            c.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                                'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                                )}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                {c.rating ? (
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(c.rating)}
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {c.rating}/5
                                                        </span>
                                                        {c.feedback && (
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500" title={c.feedback}>
                                                                💬
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                                                        {c.status === 'Resolved' ? 'Not rated' : '—'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowTimelineFor(c);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                                                        title="View Timeline"
                                                    >
                                                        <ChevronDown size={14} className="rotate-90" />
                                                    </button>
                                                    {/* Chat Button - NEW */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowChatFor(c);
                                                        }}
                                                        className="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                        title="Chat with User"
                                                    >
                                                        <MessageSquare size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedComplaint(c);
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                        className="text-[8px] sm:text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Timeline Modal */}
            {showTimelineFor && (
                <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTimelineFor(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
                    >
                        <button
                            onClick={() => setShowTimelineFor(null)}
                            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-outfit mb-4 sm:mb-6">
                            Complaint Timeline
                        </h3>
                        <ComplaintTimeline complaint={showTimelineFor} />
                    </motion.div>
                </div>
            )}

            {/* Chat Window Modal */}
            {showChatFor && (
                <ChatWindow
                    complaintId={showChatFor._id}
                    complaintTitle={showChatFor.title}
                    isOpen={!!showChatFor}
                    onClose={() => setShowChatFor(null)}
                />
            )}

            <ComplaintDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                complaint={selectedComplaint}
            />
        </div>
    );
};

export default AdminDashboard;