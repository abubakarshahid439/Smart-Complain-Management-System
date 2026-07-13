import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, User, AlertCircle, ArrowLeft, Shield, Sparkles, Leaf } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data.user.role === 'admin') {
                logout();
                setError('This is the User Portal. Administrators should login at the Admin Portal.');
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid login credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden pt-16">
            {/* Left Side: Brand Panel (Desktop Only) */}
            <div className="hidden lg:flex lg:w-[45%] h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 relative overflow-hidden items-center justify-center p-12 shrink-0">
                {/* Premium Glowing Accents */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-15%] left-[-5%] w-[80%] h-[70%] bg-emerald-400/30 rounded-full blur-[140px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[0%] w-[60%] h-[60%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                    <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-green-400/20 rounded-full blur-[100px]"></div>
                    {/* Premium Mesh Grid */}
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    
                    {/* Floating Orbs */}
                    <div className="absolute top-[20%] left-[10%] w-3 h-3 bg-emerald-300/40 rounded-full blur-sm animate-float"></div>
                    <div className="absolute bottom-[30%] right-[15%] w-4 h-4 bg-teal-300/30 rounded-full blur-sm animate-float delay-700"></div>
                    <div className="absolute top-[60%] left-[20%] w-2 h-2 bg-green-300/40 rounded-full blur-sm animate-float delay-1400"></div>

                    {/* Large Background Logo Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
                        <Shield size={600} className="text-white rotate-12" />
                    </div>
                </div>

                {/* Organic Wave Separator */}
                <div className="absolute top-0 bottom-0 -right-1 w-24 z-20 pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 100 1000" preserveAspectRatio="none" fill="currentColor">
                        <path
                            className="text-white"
                            d="M100,0 C100,0 20,150 20,300 C20,450 80,550 80,700 C80,850 0,1000 0,1000 L100,1000 Z"
                        />
                    </svg>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-30 text-center"
                >
                    <div className="relative inline-block mb-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative w-28 h-28 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/20 rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105">
                            <Shield className="text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]" size={56} strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <Leaf className="text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" size={24} fill="currentColor" />
                        </div>
                    </div>
                    <h2 className="text-6xl font-black text-white font-outfit mb-6 tracking-tight">
                        CMS <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Pro</span>
                    </h2>
                    <p className="text-emerald-100 text-xl font-medium max-w-sm mx-auto leading-relaxed">
                        The smarter way to manage <br /> enterprise complaints.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-emerald-400/50"></div>
                        <div className="w-2 h-2 bg-emerald-400/50 rounded-full"></div>
                        <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-emerald-400/50"></div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 h-full overflow-y-auto flex flex-col items-center py-12 p-4 sm:p-8 relative">
                {/* Background Decorations for Mobile/Context */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100 rounded-full blur-3xl opacity-40"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-100 rounded-full blur-3xl opacity-40"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full max-w-[340px] relative z-10"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-sm transition-all group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Portal
                        </Link>
                    </div>

                    <div className="premium-card p-5 sm:p-6 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 rounded-3xl">
                        <div className="flex flex-col items-center mb-8 sm:mb-10 lg:hidden">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Shield className="text-emerald-600" size={32} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent text-center">Welcome Back</h1>
                            <p className="text-slate-500 mt-1.5 font-medium text-xs sm:text-sm text-center">Enter your credentials to access CMS</p>
                            <div className="mt-3 w-12 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"></div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gradient-to-r from-red-50/80 to-red-50/40 border border-red-200/50 text-red-600 px-4 py-3.5 rounded-2xl flex items-center gap-3 mb-8"
                            >
                                <div className="p-1 bg-red-100 rounded-full">
                                    <AlertCircle size={16} />
                                </div>
                                <span className="text-sm font-semibold">{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50/50 border-2 border-slate-200/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:bg-white transition-all duration-300"
                                        placeholder="name@company.com"
                                        autoComplete="email"
                                        name="email"
                                        readOnly={!isEditable}
                                        onFocus={() => setIsEditable(true)}
                                    />
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none group-focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.1)] transition-shadow"></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border-2 border-slate-200/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:bg-white transition-all duration-300"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        name="password"
                                        readOnly={!isEditable}
                                        onFocus={() => setIsEditable(true)}
                                    />
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none group-focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.1)] transition-shadow"></div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full py-4 rounded-2xl font-extrabold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 group"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_auto] animate-gradient"></span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl group-hover:blur-2xl transition-all duration-500"></span>
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <p className="text-center text-slate-500 mt-8 text-sm font-medium">
                            Don't have an account? {' '}
                            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
                                Create one
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;