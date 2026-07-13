import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Send, File, MessageSquare, Check, CheckCheck, User, Shield
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const ChatWindow = ({ complaintId, complaintTitle, isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const getToken = () => {
        return sessionStorage.getItem('token');
    };

    // Get current user ID from session or auth context
    const getCurrentUserId = () => {
        // Try to get from auth context first
        if (user?._id) return user._id;
        // Try to get from session storage if stored
        try {
            const userData = sessionStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                if (parsed._id) return parsed._id;
            }
        } catch (e) {}
        return null;
    };

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        if (!isOpen || !complaintId) return;

        const fetchChat = async () => {
            try {
                setLoading(true);
                const token = getToken();
                
                if (!token) {
                    toast.error('Please login again');
                    logout();
                    window.location.href = '/login';
                    return;
                }

                const response = await axios.get(
                    `http://localhost:5000/api/chat/complaint/${complaintId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const chatData = response.data.data;
                setChatId(chatData._id);
                setMessages(chatData.messages || []);
                setParticipants(chatData.participants || []);

                if (socket && isConnected) {
                    socket.emit('join-chat', chatData._id);
                }
            } catch (error) {
                console.error('Error fetching chat:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    logout();
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    toast.error('Failed to load chat');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchChat();

        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }, [complaintId, isOpen, socket, isConnected, logout]);

    // Socket events for real-time messages
    useEffect(() => {
        if (!socket || !isConnected || !chatId) return;

        const handleNewMessage = (data) => {
            if (data.chatId === chatId) {
                console.log('New message received:', data);
                setMessages(prev => {
                    const exists = prev.some(m => m._id === data.message._id);
                    if (exists) return prev;
                    return [...prev, data.message];
                });
                scrollToBottom();
            }
        };

        const handleTyping = (data) => {
            if (data.chatId === chatId) {
                setTypingUsers(prev => {
                    if (data.isTyping) {
                        if (!prev.includes(data.userId)) {
                            return [...prev, data.userId];
                        }
                        return prev;
                    } else {
                        return prev.filter(id => id !== data.userId);
                    }
                });
            }
        };

        socket.on('new-message', handleNewMessage);
        socket.on('typing', handleTyping);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.off('typing', handleTyping);
        };
    }, [socket, isConnected, chatId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const token = getToken();
            
            if (!token) {
                toast.error('Please login again');
                logout();
                window.location.href = '/login';
                return;
            }

            const response = await axios.post(
                `http://localhost:5000/api/chat/complaint/${complaintId}/message`,
                { message: newMessage },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            const sentMessage = response.data.data;
            
            // Add message to local state
            setMessages(prev => {
                const exists = prev.some(m => m._id === sentMessage._id);
                if (exists) return prev;
                return [...prev, sentMessage];
            });
            setNewMessage('');
            scrollToBottom();

            // Emit via socket for real-time
            if (socket && isConnected) {
                socket.emit('new-message', {
                    chatId,
                    complaintId,
                    message: sentMessage
                });
            }

            if (socket && isConnected) {
                socket.emit('typing', {
                    chatId,
                    userId: currentUserId || user?._id,
                    isTyping: false
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            console.error('Error response:', error.response);
            
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else if (error.response?.status === 403) {
                toast.error('You are not authorized to send messages in this chat');
            } else {
                toast.error(error.response?.data?.message || 'Failed to send message');
            }
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (socket && isConnected && chatId && (currentUserId || user?._id)) {
            const isCurrentlyTyping = e.target.value.length > 0;
            if (isCurrentlyTyping !== isTyping) {
                setIsTyping(isCurrentlyTyping);
                socket.emit('typing', {
                    chatId,
                    userId: currentUserId || user._id,
                    isTyping: isCurrentlyTyping
                });
            }
        }
    };

    const formatTime = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'Just now';
        }
    };

    // Check if message is from current user - FIXED
    const isOwnMessage = (msg) => {
        if (!msg || !currentUserId) return false;
        const senderId = msg.sender?._id || msg.sender;
        return senderId === currentUserId;
    };

    const getMessageStatus = (msg) => {
        if (isOwnMessage(msg)) {
            if (msg.isRead) {
                return <CheckCheck size={14} className="text-blue-500" />;
            }
            return <Check size={14} className="text-white/60" />;
        }
        return null;
    };

    const getSenderName = (msg) => {
        if (!msg) return 'Unknown';
        return msg.senderName || msg.sender?.name || 'User';
    };

    const isAdmin = (msg) => {
        return msg.senderRole === 'admin';
    };

    const renderMessage = (msg, index) => {
        const isOwn = isOwnMessage(msg);
        const isAdminMsg = isAdmin(msg);
        const senderName = getSenderName(msg);

        return (
            <motion.div
                key={msg._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
                className={clsx(
                    "flex items-end gap-2 mb-3 w-full",
                    isOwn ? "flex-row-reverse" : "flex-row"
                )}
            >
                {/* Avatar - Only show for others */}
                {!isOwn && (
                    <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isAdminMsg ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" :
                        "bg-gradient-to-r from-slate-400 to-slate-500 text-white"
                    )}>
                        {senderName.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Message Bubble */}
                <div className={clsx(
                    "max-w-[70%] px-4 py-2.5 rounded-2xl",
                    isOwn 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm"
                        : "bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white rounded-bl-sm border border-slate-100/50 dark:border-slate-700/50"
                )}>
                    {/* Sender Name - Only show for others */}
                    {!isOwn && (
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                            {senderName}
                            {isAdminMsg && (
                                <span className="text-[8px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                                    Admin
                                </span>
                            )}
                        </p>
                    )}
                    
                    {/* Message Text */}
                    <p className="text-sm leading-relaxed break-words">
                        {msg.message}
                    </p>

                    {/* Timestamp & Status */}
                    <div className={clsx(
                        "flex items-center gap-1 mt-1 text-[10px]",
                        isOwn ? "text-white/70" : "text-slate-400 dark:text-slate-500"
                    )}>
                        <span>{formatTime(msg.createdAt)}</span>
                        {getMessageStatus(msg)}
                    </div>
                </div>

                {/* Avatar - Only show for own messages (on the right) */}
                {isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {senderName.charAt(0).toUpperCase()}
                    </div>
                )}
            </motion.div>
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
                    className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col border border-white/20 dark:border-slate-700/50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                                <MessageSquare className="text-white" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {complaintTitle || 'Complaint Chat'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span>{participants.length} participants</span>
                                    {isConnected && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                            <span className="text-emerald-500">Online</span>
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 bg-slate-50/30 dark:bg-slate-900/20">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <MessageSquare size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    No messages yet
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Start the conversation by sending a message
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => renderMessage(msg, index))}
                                {typingUsers.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                                        </div>
                                        <span>Someone is typing...</span>
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="px-6 py-4 border-t border-slate-100/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Type your message..."
                                className="flex-1 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className={clsx(
                                    "p-2.5 rounded-xl font-bold text-white transition-all",
                                    (sending || !newMessage.trim())
                                        ? "bg-slate-300 dark:bg-slate-600 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                                )}
                            >
                                {sending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChatWindow;