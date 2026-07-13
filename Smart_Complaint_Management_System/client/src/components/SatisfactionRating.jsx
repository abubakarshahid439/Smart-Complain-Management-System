import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, X, ThumbsUp } from 'lucide-react';
import { clsx } from 'clsx';
import axios from 'axios';
import toast from 'react-hot-toast';

const SatisfactionRating = ({ complaintId, onClose, onRatingSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const ratings = [
        { value: 1, label: 'Terrible', emoji: '😡' },
        { value: 2, label: 'Poor', emoji: '😕' },
        { value: 3, label: 'Average', emoji: '😐' },
        { value: 4, label: 'Good', emoji: '😊' },
        { value: 5, label: 'Excellent', emoji: '🤩' }
    ];

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        console.log('=== SUBMITTING RATING ===');
        console.log('Complaint ID:', complaintId);
        console.log('Rating:', rating);
        console.log('Feedback:', feedback);

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            console.log('Token:', token ? 'Present' : 'Missing');
            
            const response = await axios.post(
                `http://localhost:5000/api/complaints/${complaintId}/rate`,
                { rating, feedback },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            console.log('Rating response:', response.data);
            setSubmitted(true);
            toast.success('Thank you for your feedback! 🎉');
            if (onRatingSubmitted) onRatingSubmitted();
        } catch (error) {
            console.error('Rating error - Full:', error);
            console.error('Rating error - Response:', error.response);
            console.error('Rating error - Message:', error.response?.data?.message);
            toast.error(error.response?.data?.message || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-3 sm:right-4 top-3 sm:top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                        <X size={20} />
                    </button>

                    {!submitted ? (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ThumbsUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-outfit">
                                    How was your experience?
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Rate your complaint resolution process
                                </p>
                            </div>

                            <div className="flex justify-center gap-1 sm:gap-2 mb-6 flex-wrap">
                                {ratings.map((r) => (
                                    <motion.button
                                        key={r.value}
                                        whileHover={{ scale: 1.2, y: -4 }}
                                        whileTap={{ scale: 0.9 }}
                                        onMouseEnter={() => setHoveredRating(r.value)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(r.value)}
                                        className="flex flex-col items-center gap-1 p-1 sm:p-2 rounded-2xl transition-all"
                                    >
                                        <div className={clsx(
                                            "text-2xl sm:text-3xl transition-all duration-200",
                                            rating >= r.value || hoveredRating >= r.value
                                                ? "scale-110"
                                                : "scale-90 opacity-50"
                                        )}>
                                            {r.emoji}
                                        </div>
                                        <span className={clsx(
                                            "text-[8px] sm:text-[10px] font-bold transition-colors",
                                            rating >= r.value || hoveredRating >= r.value
                                                ? "text-slate-900 dark:text-white"
                                                : "text-slate-400 dark:text-slate-500"
                                        )}>
                                            {r.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Additional Feedback (Optional)
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl p-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 transition-all resize-none h-24"
                                    placeholder="Tell us more about your experience..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={loading}
                                className={clsx(
                                    "w-full mt-6 py-3 sm:py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all",
                                    rating > 0
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                                        : "bg-slate-300 dark:bg-slate-600 cursor-not-allowed"
                                )}
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Rating <Send size={16} />
                                    </>
                                )}
                            </motion.button>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="text-emerald-600 dark:text-emerald-400" size={40} fill="currentColor" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-outfit">
                                Thank You! 🙏
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                Your feedback helps us improve our service.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                            >
                                Close
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SatisfactionRating;