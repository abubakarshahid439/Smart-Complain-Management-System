import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight, Sparkles, Leaf, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortalChoice = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 pt-20 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/40 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-100/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-50/20 rounded-full blur-3xl"></div>
                
                {/* Floating Orbs */}
                <div className="absolute top-[20%] left-[15%] w-4 h-4 bg-emerald-300/30 rounded-full blur-sm animate-float"></div>
                <div className="absolute bottom-[30%] right-[20%] w-5 h-5 bg-teal-300/25 rounded-full blur-sm animate-float delay-700"></div>
                <div className="absolute top-[60%] left-[10%] w-3 h-3 bg-green-300/30 rounded-full blur-sm animate-float delay-1400"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 rounded-2xl border border-emerald-100/50 shadow-sm mb-6"
                    >
                        <Leaf className="text-emerald-500" size={20} />
                        <span className="text-emerald-700 font-bold text-sm uppercase tracking-wider">Welcome to CMS Pro</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-6xl font-black text-slate-900 font-outfit tracking-tight mb-4"
                    >
                        Choose Your <br className="sm:hidden" />
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                            Access Portal
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-base sm:text-lg font-medium max-w-md mx-auto"
                    >
                        Select your role to access the appropriate dashboard
                    </motion.p>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 w-20 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto"
                    />
                </div>

                {/* Portal Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* User Portal Card */}
                    <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                        className="h-full"
                    >
                        <Link to="/login" className="block h-full">
                            <div className="premium-card p-8 h-full group relative overflow-hidden">
                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Decorative Circle */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-emerald-200/50">
                                        <Users className="text-emerald-600" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit mb-3 flex items-center gap-2">
                                        User Portal
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                            Client
                                        </span>
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                                        Submit complaints, track resolutions, and manage your tickets in a clean, intuitive interface.
                                    </p>
                                    <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs group-hover:gap-3 transition-all">
                                        Enter Portal 
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Admin Portal Card */}
                    <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                        className="h-full"
                    >
                        <Link to="/admin/login" className="block h-full">
                            <div className="premium-card p-8 h-full group relative overflow-hidden border-emerald-100/30 hover:border-emerald-300/60">
                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Decorative Circle */}
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-teal-400/10 to-emerald-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-slate-800/30">
                                        <Shield className="text-white" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 font-outfit mb-3 flex items-center gap-2">
                                        Admin Portal
                                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                            Admin
                                        </span>
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                                        Oversee system statistics, manage all complaints, update status, and provide official resolutions.
                                    </p>
                                    <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-xs group-hover:gap-3 transition-all">
                                        Management Entry 
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center"
                >
                    <div className="flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            Secure
                        </span>
                        <span className="w-px h-4 bg-slate-200"></span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-300"></span>
                            Smart
                        </span>
                        <span className="w-px h-4 bg-slate-200"></span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-700"></span>
                            Professional
                        </span>
                    </div>
                    
                    <p className="mt-4 text-slate-400 text-xs font-medium">
                        © 2026 CMS Pro. All rights reserved.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PortalChoice;