import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, User, Menu, X, ChevronDown, Edit2, UserCircle, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import ProfileModal from './ProfileModal';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileModal, setProfileModal] = useState({ isOpen: false, view: 'view' });

    const handleLogout = () => {
        logout();
        setIsLogoutConfirmOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const isGateway = location.pathname === '/';
    const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');
    const isAdminPortal = location.pathname.includes('/admin');
    const isUserPortal = !isGateway && !isAdminPortal;

    useEffect(() => {
        if (!user) return;

        const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/admin-dashboard';

        if (isDashboardPage) {
            window.history.pushState(null, '', window.location.href);

            const handlePopState = (event) => {
                setIsLogoutConfirmOpen(true);
                window.history.pushState(null, '', window.location.href);
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [user, location.pathname]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const NavLinks = () => (
        <>
            {user && !isGateway && !isAuthPage ? (
                <>
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 md:bg-transparent rounded-xl transition-all group w-full md:w-auto justify-center md:justify-start"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800 group-hover:border-emerald-200 transition-colors shrink-0">
                                <User size={16} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                                <span className="text-sm font-bold leading-none mb-0.5 dark:text-white truncate">{user.name}</span>
                                <span className="text-[10px] w-fit px-1.5 py-0 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800 leading-tight">
                                    {user.role}
                                </span>
                            </div>
                            <ChevronDown size={14} className={clsx("text-slate-400 dark:text-slate-500 transition-transform shrink-0", isProfileOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl premium-shadow border border-slate-100 dark:border-slate-700 overflow-hidden z-[60]"
                                >
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setProfileModal({ isOpen: true, view: 'view' });
                                                setIsProfileOpen(false);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all"
                                        >
                                            <UserCircle size={18} /> View Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProfileModal({ isOpen: true, view: 'edit' });
                                                setIsProfileOpen(false);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all"
                                        >
                                            <Edit2 size={18} /> Edit Name
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2 !my-1" />
                                        <button
                                            onClick={() => {
                                                setIsLogoutConfirmOpen(true);
                                                setIsProfileOpen(false);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            ) : (
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <Link
                        to={isAdminPortal ? "/admin/login" : "/login"}
                        className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-[13px] sm:text-sm font-bold transition-all px-2 py-2 w-full md:w-auto text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Login
                    </Link>
                    <Link
                        to={isAdminPortal ? "/admin/register" : "/register"}
                        className="premium-gradient px-4 sm:px-6 py-2 md:py-1.5 rounded-xl sm:rounded-2xl text-[13px] sm:text-sm font-bold text-white premium-shadow hover:opacity-90 transition-all active:scale-95 text-center whitespace-nowrap w-full md:w-auto"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </>
    );

    return (
        <>
            <nav className="glass fixed top-0 left-0 right-0 z-50 dark:bg-slate-900/90 dark:border-slate-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-transform active:scale-95 shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
                            <Shield className="text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-900/30 w-6 h-6 sm:w-8 sm:h-8 relative" strokeWidth={2.5} />
                        </div>
                        <span className="font-outfit flex items-baseline gap-1.5 sm:gap-2">
                            <span>CMS <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Pro</span></span>
                            {isUserPortal && <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] font-sans">User</span>}
                            {isAdminPortal && <span className="text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] font-sans">Admin</span>}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle className="flex" />
                        <NotificationBell className="flex" />
                        <NavLinks />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle className="flex" />
                        <NotificationBell className="flex" />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="md:hidden overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg"
                        >
                            <div className="container mx-auto px-4 py-4 space-y-3">
                                <NavLinks />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {isLogoutConfirmOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLogoutConfirmOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 premium-shadow max-w-[320px] w-full text-center"
                        >
                            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <LogOut className="text-red-500" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-outfit mb-1.5">Sign Out?</h3>
                            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-6 px-2">Are you sure you want to log out of your account?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsLogoutConfirmOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-[13px] text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-[13px] text-white font-bold premium-shadow hover:from-red-600 hover:to-red-700 transition-all active:scale-95"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={profileModal.isOpen}
                onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
                initialView={profileModal.view}
            />
        </>
    );
};

export default Navbar;