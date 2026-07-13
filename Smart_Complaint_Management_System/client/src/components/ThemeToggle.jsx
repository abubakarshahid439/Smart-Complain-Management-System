import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';

const ThemeToggle = ({ className }) => {
    const { isDark, toggleTheme } = useTheme();

    // Debug - check if values are being received
    console.log('ThemeToggle rendered - isDark:', isDark, 'toggleTheme:', typeof toggleTheme);

    const handleClick = () => {
        console.log('Toggle clicked! Current theme:', isDark ? 'dark' : 'light');
        toggleTheme();
        // Check after toggle
        setTimeout(() => {
            console.log('After toggle - isDark:', isDark);
            console.log('HTML classes:', document.documentElement.classList);
            console.log('LocalStorage theme:', localStorage.getItem('theme'));
        }, 100);
    };

    return (
        <motion.button
            onClick={handleClick}
            className={clsx(
                "relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0",
                isDark 
                    ? "bg-gradient-to-r from-slate-700 to-slate-900 shadow-inner shadow-slate-800 border border-slate-600" 
                    : "bg-gradient-to-r from-amber-400 to-amber-200 shadow-inner shadow-amber-300/50 border border-amber-300/50",
                className
            )}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            aria-label="Toggle theme"
        >
            <motion.div
                className={clsx(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg flex items-center justify-center transition-all",
                    isDark ? "left-6" : "left-0.5"
                )}
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
                {isDark ? (
                    <Moon size={12} className="text-slate-700" />
                ) : (
                    <Sun size={12} className="text-amber-500" />
                )}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;