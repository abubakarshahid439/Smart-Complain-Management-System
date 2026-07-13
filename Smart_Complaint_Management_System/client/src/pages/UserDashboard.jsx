import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, List, Clock, CheckCircle, XCircle, FileText, Send, Filter, AlertTriangle, Shield, Menu, X, Trash2, Pencil, Star, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import UserSidebar from '../components/UserSidebar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import CustomDropdown from '../components/CustomDropdown';
import SatisfactionRating from '../components/SatisfactionRating';
import ComplaintTimeline from '../components/ComplaintTimeline';
import ChatWindow from '../components/ChatWindow';
import { useTheme } from '../context/ThemeContext';

const UserDashboard = () => {
    const { isSystemOnline } = useAuth();
    const { isDark } = useTheme();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [filter, setFilter] = useState('All');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedComplaintForRating, setSelectedComplaintForRating] = useState(null);
    const [showTimelineFor, setShowTimelineFor] = useState(null);
    const [showChatFor, setShowChatFor] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        priority: 'Medium',
        description: ''
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(data.data);
        } catch (error) {
            console.error('Error fetching complaints', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            if (editingComplaint) {
                await axios.put(`http://localhost:5000/api/complaints/${editingComplaint._id}/update`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Complaint updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/complaints', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Complaint submitted successfully');
            }
            setIsFormOpen(false);
            setEditingComplaint(null);
            setFormData({ title: '', category: 'General', priority: 'Medium', description: '' });
            fetchComplaints();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    // FIX: Allow deletion for all complaints (removed pending-only restriction)
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this complaint?')) return;
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/complaints/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Complaint deleted successfully');
            fetchComplaints();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete complaint');
        }
    };

    const handleEdit = (complaint) => {
        if (complaint.status !== 'Pending') {
            toast.error('Only pending complaints can be edited');
            return;
        }
        setEditingComplaint(complaint);
        setFormData({
            title: complaint.title,
            category: complaint.category,
            priority: complaint.priority,
            description: complaint.description
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingComplaint(null);
        setFormData({ title: '', category: 'General', priority: 'Medium', description: '' });
        setIsFormOpen(false);
    };

    const statusIcons = {
        'Pending': <Clock className="text-amber-500" size={16} />,
        'In Progress': <AlertTriangle className="text-emerald-500" size={16} />,
        'Resolved': <CheckCircle className="text-green-500" size={16} />,
        'Rejected': <XCircle className="text-red-500" size={16} />
    };

    const filteredComplaints = filter === 'All'
        ? complaints
        : complaints.filter(c => c.status === filter);

    const handleNavigate = (section) => {
        setActiveSection(section);

        let targetId = section;
        if (section === 'submit') {
            setIsFormOpen(true);
            targetId = 'new-complaint';
        } else if (section === 'complaints') {
            targetId = 'my-complaints';
        }

        setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Render stars for rating display
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

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20">
            {/* Sidebar */}
            <UserSidebar
                complaints={complaints}
                activeSection={activeSection}
                onNavigate={handleNavigate}
                isMobileOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 w-full lg:ml-72 lg:pl-8 px-4 pb-8">
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

                <div className="w-full space-y-10 pr-4 lg:pr-8 py-10 pt-24">
                    {!isSystemOnline && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4 flex items-center gap-4 text-red-600 dark:text-red-400 font-bold animate-pulse">
                            <AlertTriangle size={20} />
                            <span>System is currently OFFLINE. Some features may be restricted.</span>
                        </div>
                    )}
                    <div id="dashboard" className="flex flex-col md:flex-row md:items-center justify-between gap-6 scroll-mt-24">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-outfit">
                                Your <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Complaints</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Submit new complaints and track their resolution status in real-time.</p>
                            <div className="mt-2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                        </div>
                        <button
                            onClick={() => isSystemOnline ? setIsFormOpen(!isFormOpen) : toast.error('System is currently offline for maintenance')}
                            disabled={!isSystemOnline}
                            className={clsx(
                                "flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white text-sm shadow-lg transition-all",
                                isSystemOnline
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-100 dark:shadow-emerald-900/30 hover:scale-[1.02] active:scale-95"
                                    : "bg-slate-300 dark:bg-slate-600 cursor-not-allowed opacity-70 shadow-none"
                            )}
                        >
                            <PlusCircle size={16} />
                            {isSystemOnline ? 'Submit Complaint' : 'System Offline'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {isFormOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <form id="new-complaint" onSubmit={handleSubmit} className="premium-card p-6 sm:p-10 grid md:grid-cols-2 gap-8 mb-10 scroll-mt-24 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-3xl">
                                    <div className="md:col-span-2 flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                                                {editingComplaint ? <Pencil className="text-emerald-600 dark:text-emerald-400" size={24} /> : <FileText className="text-emerald-600 dark:text-emerald-400" size={24} />}
                                            </div>
                                            {editingComplaint ? 'Update Complaint' : 'New Complaint Details'}
                                        </h2>
                                        <button type="button" onClick={handleCancelEdit} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 font-bold transition-colors">Cancel</button>
                                    </div>

                                    {/* Form fields - same as before */}
                                    <div className="space-y-2.5">
                                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Complaint Title</label>
                                        <div className="relative group">
                                            <input
                                                type="text" required
                                                className="w-full bg-slate-50/50 dark:bg-slate-700/50 border-2 border-slate-200/50 dark:border-slate-600/50 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/20 dark:focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all duration-300"
                                                placeholder="e.g. WiFi issue in Hostel Wing B"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                            <CustomDropdown
                                                options={['General', 'Technical', 'Hostel', 'Academic', 'Other']}
                                                value={formData.category}
                                                onChange={(val) => setFormData({ ...formData, category: val })}
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                                            <CustomDropdown
                                                options={['Low', 'Medium', 'High']}
                                                value={formData.priority}
                                                onChange={(val) => setFormData({ ...formData, priority: val })}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2.5">
                                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            required rows="5"
                                            className="w-full bg-slate-50/50 dark:bg-slate-700/50 border-2 border-slate-200/50 dark:border-slate-600/50 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/20 dark:focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all duration-300 resize-none h-40"
                                            placeholder="Provide detailed information about your issue..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="md:col-span-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!isSystemOnline}
                                            className={clsx(
                                                "px-6 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95",
                                                isSystemOnline
                                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-100 dark:shadow-emerald-900/30 hover:scale-[1.02]"
                                                    : "bg-slate-300 dark:bg-slate-600 cursor-not-allowed opacity-70"
                                            )}
                                        >
                                            {editingComplaint ? <CheckCircle size={18} /> : <Send size={18} />}
                                            {editingComplaint ? 'Update Ticket' : 'Submit Ticket'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div id="my-complaints" className="space-y-8 scroll-mt-24">
                        <div className="flex items-center gap-4 border-b border-emerald-100/30 dark:border-emerald-900/30 pb-5 overflow-x-auto scrollbar-hide">
                            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-2 rounded-xl">
                                <Filter size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            </div>
                            {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={clsx(
                                        "px-6 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all",
                                        filter === status
                                            ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm shadow-emerald-100/50 dark:shadow-emerald-900/30 scale-105"
                                            : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 dark:border-emerald-900/30 border-t-emerald-600 dark:border-t-emerald-400 border-b-teal-600 dark:border-b-teal-400"></div>
                                </div>
                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] animate-pulse">Loading Complaints...</p>
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="premium-card p-20 flex flex-col items-center justify-center text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-3xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-800">
                                    <List className="text-emerald-300 dark:text-emerald-600" size={40} />
                                </div>
                                <h3 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">No complaints found</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs font-medium">You haven't submitted any complaints matching this filter yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredComplaints.map((complaint) => (
                                    <motion.div
                                        layout
                                        key={complaint._id}
                                        className="premium-card p-5 group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-slate-700/50 rounded-3xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <Shield size={60} className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest border",
                                                complaint.priority === 'High' ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800" :
                                                    complaint.priority === 'Medium' ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800" : 
                                                    "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                                            )}>
                                                {complaint.priority}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {complaint.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleEdit(complaint)}
                                                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                                                        title="Edit Complaint"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                )}
                                                {/* FIX: Delete button always visible for all complaints */}
                                                <button
                                                    onClick={() => handleDelete(complaint._id)}
                                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                    title="Delete Complaint"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-emerald-100 dark:border-emerald-800 shadow-sm shadow-emerald-100/50 dark:shadow-emerald-900/30">
                                                    {statusIcons[complaint.status]}
                                                    <span className="text-slate-700 dark:text-slate-300 uppercase tracking-tighter whitespace-nowrap">{complaint.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-extrabold mb-2 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight font-outfit text-slate-900 dark:text-white">{complaint.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-4 line-clamp-2 leading-relaxed font-medium">{complaint.description}</p>
                                        {complaint.status === 'In Progress' && (
                                            <div className="mb-4 flex justify-center scale-90 origin-center">
                                                {complaint.estimatedCompletionDate ? (
                                                    <CountdownTimer targetDate={complaint.estimatedCompletionDate} />
                                                ) : (
                                                    <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-1.5">
                                                        <Clock size={12} className="text-emerald-400 dark:text-emerald-500" />
                                                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Resolution Time Pending</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-4 border-t border-emerald-50 dark:border-emerald-800/50">
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-bold">
                                                <Clock size={12} />
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </div>
                                            <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest">{complaint.category}</span>
                                        </div>

                                        {/* Show Rating if exists */}
                                        {complaint.rating && (
                                            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(complaint.rating)}
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {complaint.rating}/5
                                                        </span>
                                                    </div>
                                                    {complaint.feedback && (
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                                            "{complaint.feedback}"
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rating Button - Only for resolved complaints without rating */}
                                        {complaint.status === 'Resolved' && !complaint.rating && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedComplaintForRating(complaint);
                                                    setShowRatingModal(true);
                                                }}
                                                className="mt-3 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                                            >
                                                Rate Your Experience ⭐
                                            </motion.button>
                                        )}

                                        {complaint.resolution && (
                                            <div className="mt-4 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-inner">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em]">Response</p>
                                                </div>
                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed italic">"{complaint.resolution}"</p>
                                            </div>
                                        )}

                                        {/* Timeline Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowTimelineFor(complaint);
                                            }}
                                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-2 flex items-center gap-1"
                                        >
                                            📋 View Timeline
                                        </button>

                                        {/* Chat Button - NEW */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowChatFor(complaint);
                                            }}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 flex items-center gap-1"
                                        >
                                            💬 Chat with Admin
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Satisfaction Rating Modal */}
            {showRatingModal && (
                <SatisfactionRating
                    complaintId={selectedComplaintForRating?._id}
                    onClose={() => {
                        setShowRatingModal(false);
                        setSelectedComplaintForRating(null);
                    }}
                    onRatingSubmitted={() => {
                        fetchComplaints();
                    }}
                />
            )}

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
                        className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
                    >
                        <button
                            onClick={() => setShowTimelineFor(null)}
                            className="absolute right-4 top-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit mb-6">
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
        </div>
    );
};

export default UserDashboard;