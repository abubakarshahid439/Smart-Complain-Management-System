import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Search, Filter, Edit3, Menu, X, List
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import CustomDropdown from '../components/CustomDropdown';

const ManageComplaints = () => {
    const { user, isSystemOnline } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [updateForm, setUpdateForm] = useState({ status: '', resolution: '', estimatedCompletionDate: '' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('latest');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get('http://localhost:5000/api/complaints', config);
            setComplaints(res.data.data);
        } catch (error) {
            console.error('Error fetching complaints', error);
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
            fetchComplaints();
        } catch (error) {
            alert('Update failed');
        }
    };

    const { displayComplaints, allComplaints } = useMemo(() => {
        const fullList = complaints || [];
        const activeList = fullList.filter(c => c.status === 'Pending' || c.status === 'In Progress');

        let result = activeList.filter(c =>
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

        return { displayComplaints: result, allComplaints: fullList };
    }, [complaints, searchTerm, sortBy]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-100 border-t-emerald-600 border-b-teal-600"></div>
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] animate-pulse">Loading Complaints...</p>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden">
            <AdminSidebar
                complaints={allComplaints}
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
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 scroll-mt-24">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">
                                Manage <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Complaints</span>
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium">Handle and resolve user complaints across the system.</p>
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

                    <div id="complaints" className="premium-card overflow-hidden bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl">
                        <div className="p-6 sm:p-10 border-b border-emerald-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">Active Complaints</h3>
                                <p className="text-slate-500 text-sm font-medium mt-1">Update status and provide resolutions.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative group w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50/50 border-2 border-slate-200/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:bg-white transition-all duration-300"
                                        placeholder="Search user or title..."
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
                                            { label: 'Latest', value: 'latest' },
                                            { label: 'Oldest', value: 'oldest' },
                                            { label: 'High Priority', value: 'priority-desc' },
                                            { label: 'Low Priority', value: 'priority-asc' }
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
                                        <th className="px-10 py-6">Submitted By</th>
                                        <th className="px-10 py-6">Complaint Details</th>
                                        <th className="px-10 py-6">Priority</th>
                                        <th className="px-10 py-6">Status</th>
                                        <th className="px-10 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-50/50">
                                    {displayComplaints.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-10 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full border border-emerald-100">
                                                        <List className="text-emerald-300" size={40} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-extrabold text-slate-900 font-outfit">No Active Complaints</p>
                                                        <p className="text-sm text-slate-500 font-medium">All complaints have been resolved.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        displayComplaints.map((c) => (
                                            <tr
                                                key={c._id}
                                                onClick={() => {
                                                    setSelectedComplaint(c);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                                className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-4 sm:px-10 py-6 sm:py-8">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 font-black text-base sm:text-lg border border-emerald-200 group-hover:bg-white transition-colors">
                                                            {c.user?.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 leading-tight">{c.user?.name}</p>
                                                            <p className="hidden sm:block text-xs text-slate-500 mt-0.5">{c.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-10 py-6 sm:py-8">
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{c.title}</p>
                                                    <p className="hidden md:block text-xs text-slate-500 line-clamp-1 mt-1 font-medium">{c.description}</p>
                                                </td>
                                                <td className="px-4 sm:px-10 py-6 sm:py-8">
                                                    <span className={clsx(
                                                        "text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border uppercase tracking-widest",
                                                        c.priority === 'High' ? "text-red-600 bg-red-50 border-red-100" :
                                                            c.priority === 'Medium' ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                    )}>
                                                        {c.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-10 py-6 sm:py-8">
                                                    {editingId === c._id ? (
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <CustomDropdown
                                                                className="!px-2 py-2 text-xs font-bold w-[120px] sm:w-[140px]"
                                                                options={['Pending', 'In Progress', 'Resolved', 'Rejected']}
                                                                value={updateForm.status}
                                                                onChange={(val) => setUpdateForm({ ...updateForm, status: val })}
                                                            />
                                                            {updateForm.status === 'In Progress' && (
                                                                <div className="mt-2 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left ml-1">Est. Completion</label>
                                                                    <input
                                                                        type="datetime-local"
                                                                        className="w-full bg-slate-50/50 border-2 border-slate-200/50 rounded-xl py-1.5 px-2 text-[10px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:bg-white transition-all duration-300"
                                                                        value={updateForm.estimatedCompletionDate}
                                                                        min={new Date().toISOString().slice(0, 16)}
                                                                        onChange={(e) => setUpdateForm({ ...updateForm, estimatedCompletionDate: e.target.value })}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-1 items-center">
                                                            <span className={clsx(
                                                                "text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border uppercase tracking-widest shadow-sm shadow-slate-100/50 whitespace-nowrap",
                                                                c.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                    c.status === 'In Progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                        c.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                                            'bg-red-50 text-red-600 border-red-200'
                                                            )}>
                                                                {c.status}
                                                            </span>
                                                            {c.status === 'In Progress' && (
                                                                <span className="text-[8px] font-bold text-slate-400">
                                                                    {c.estimatedCompletionDate ? new Date(c.estimatedCompletionDate).toLocaleString() : 'No Timer Set'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-10 py-6 sm:py-8 text-right">
                                                    {!isSystemOnline ? (
                                                        <span className="text-[10px] font-bold text-slate-400 italic">Disabled</span>
                                                    ) : editingId === c._id ? (
                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => handleUpdate(c._id)}
                                                                className="px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-100"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="px-3 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs bg-slate-100 text-slate-600 rounded-lg sm:rounded-xl font-bold hover:bg-slate-200 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingId(c._id);
                                                                setUpdateForm({
                                                                    status: c.status,
                                                                    resolution: c.resolution || '',
                                                                    estimatedCompletionDate: c.estimatedCompletionDate ? new Date(c.estimatedCompletionDate).toISOString().slice(0, 16) : ''
                                                                });
                                                            }}
                                                            className="p-2 sm:p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-emerald-200"
                                                        >
                                                            <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                        </button>
                                                    )}
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

            <ComplaintDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                complaint={selectedComplaint}
            />
        </div>
    );
};

export default ManageComplaints;