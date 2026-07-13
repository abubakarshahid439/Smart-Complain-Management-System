import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Shield, Check, Edit2, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileModal = ({ isOpen, onClose, initialView = 'view' }) => {
    const { user, updateProfile } = useAuth();
    const [view, setView] = useState(initialView); // 'view' or 'edit'
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Name cannot be empty');
        if (name === user.name) return setView('view');

        setLoading(true);
        try {
            await updateProfile(name);
            toast.success('Profile updated successfully');
            setView('view');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 premium-shadow max-w-sm w-full border border-white/50"
                    >
                        {/* Decorative gradient circle */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-3xl pointer-events-none"></div>

                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8 relative z-10">
                            <div className="relative inline-block mb-4">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 text-3xl font-black shadow-lg border-2 border-emerald-200">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    <Leaf size={12} className="text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 font-outfit">
                                {view === 'view' ? 'Your Profile' : 'Edit Profile'}
                            </h3>
                            <p className="text-slate-500 font-medium text-sm">Manage your account details</p>
                            <div className="mt-2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto"></div>
                        </div>

                        {view === 'view' ? (
                            <div className="space-y-4 relative z-10">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-emerald-100/50 space-y-3">
                                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center text-emerald-500 shadow-sm">
                                            <User size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">Full Name</p>
                                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center text-emerald-500 shadow-sm">
                                            <Mail size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">Email Address</p>
                                            <p className="text-sm font-bold text-slate-900">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center text-emerald-500 shadow-sm">
                                            <Shield size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">Account Role</p>
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                                                <span className="bg-gradient-to-r from-emerald-100 to-teal-100 px-2 py-0.5 rounded-full text-emerald-700 text-xs">
                                                    {user?.role}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setView('edit')}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold premium-shadow hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-[0.98] group"
                                >
                                    <Edit2 size={18} className="group-hover:rotate-12 transition-transform" /> Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">New Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            className="input-field pl-12 focus:border-emerald-400 focus:ring-emerald-400/20"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                        />
                                        <div className="absolute inset-0 rounded-2xl pointer-events-none group-focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.1)] transition-shadow"></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium ml-1">Update your display name</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setView('view')}
                                        className="py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold premium-shadow hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <><Check size={18} className="group-hover:scale-110 transition-transform" /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;