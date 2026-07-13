const Chat = require('../models/Chat');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// ===== Get or Create Chat =====
const getOrCreateChat = async (req, res) => {
    try {
        const { complaintId } = req.params;
        
        console.log('📩 Get/Create chat for complaint:', complaintId);
        console.log('👤 User:', req.user.email, 'Role:', req.user.role);
        
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check authorization
        if (complaint.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this chat'
            });
        }

        let chat = await Chat.findOne({ complaintId })
            .populate('participants', 'name email role')
            .populate('messages.sender', 'name email role');

        if (!chat) {
            const participants = [complaint.user];
            // Always add admin if the user is admin
            if (req.user.role === 'admin' && !participants.includes(req.user.id)) {
                participants.push(req.user.id);
            }
            
            chat = await Chat.create({
                complaintId,
                participants: participants,
                messages: []
            });

            await chat.populate('participants', 'name email role');
            console.log('📩 New chat created:', chat._id);
        } else {
            // Check if admin is in participants, if not add them
            if (req.user.role === 'admin' && !chat.participants.some(p => p._id.toString() === req.user.id)) {
                chat.participants.push(req.user.id);
                await chat.save();
                console.log('📩 Admin added to participants');
            }
        }

        // Mark messages as read
        if (req.user.role === 'admin') {
            let updated = false;
            chat.messages.forEach(msg => {
                if (!msg.isRead && msg.sender.toString() !== req.user.id) {
                    msg.isRead = true;
                    msg.readAt = new Date();
                    updated = true;
                }
            });
            if (updated) {
                await chat.save();
            }
        }

        res.status(200).json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Get or create chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Error accessing chat: ' + error.message
        });
    }
};

// ===== Send Message =====
const sendMessage = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { message } = req.body;

        console.log('📩 Sending message from:', req.user.email, 'Role:', req.user.role);
        console.log('📩 Message:', message);
        console.log('📩 Complaint ID:', complaintId);

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Find or create chat
        let chat = await Chat.findOne({ complaintId });
        if (!chat) {
            console.log('📩 Chat not found, creating new...');
            const complaint = await Complaint.findById(complaintId);
            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            const participants = [complaint.user];
            // Always add admin if the user is admin
            if (req.user.role === 'admin' && !participants.includes(req.user.id)) {
                participants.push(req.user.id);
            }
            
            chat = await Chat.create({
                complaintId,
                participants: participants,
                messages: []
            });
            console.log('📩 Chat created:', chat._id);
        }

        // Check if user is participant, if not add them
        const isParticipant = chat.participants.some(p => p.toString() === req.user.id);
        if (!isParticipant) {
            console.log('📩 Adding user to participants');
            chat.participants.push(req.user.id);
            await chat.save();
        }

        // Create message
        const newMessage = {
            sender: req.user.id,
            senderName: req.user.name,
            senderRole: req.user.role,
            message: message,
            attachments: [],
            isRead: false,
            createdAt: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();
        await chat.save();

        await chat.populate('messages.sender', 'name email role');

        const latestMessage = chat.messages[chat.messages.length - 1];

        // Emit socket events
        const io = req.app.get('io');
        if (io) {
            console.log('📡 Emitting new message via socket...');
            chat.participants.forEach(participantId => {
                const roomName = `user-${participantId.toString()}`;
                console.log(`📡 Emitting to room: ${roomName}`);
                io.to(roomName).emit('new-message', {
                    chatId: chat._id,
                    complaintId: complaintId,
                    message: latestMessage
                });
            });

            if (req.user.role === 'user') {
                io.to('admin-channel').emit('new-user-message', {
                    chatId: chat._id,
                    complaintId: complaintId,
                    user: {
                        id: req.user.id,
                        name: req.user.name,
                        email: req.user.email
                    },
                    message: latestMessage
                });
            }
        } else {
            console.log('⚠️ io not available');
        }

        console.log('📩 Message sent successfully');

        res.status(200).json({
            success: true,
            data: latestMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message: ' + error.message
        });
    }
};

// ===== Get Chat Messages =====
const getChatMessages = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { limit = 50 } = req.query;

        const chat = await Chat.findOne({ complaintId })
            .populate('messages.sender', 'name email role');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        let updated = false;
        chat.messages.forEach(msg => {
            if (!msg.isRead && msg.sender.toString() !== req.user.id) {
                msg.isRead = true;
                msg.readAt = new Date();
                updated = true;
            }
        });
        if (updated) {
            await chat.save();
        }

        const messages = chat.messages.slice(-parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                messages,
                total: chat.messages.length,
                unreadCount: chat.messages.filter(m => !m.isRead && m.sender.toString() !== req.user.id).length
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
};

// ===== Mark Messages as Read =====
const markAsRead = async (req, res) => {
    try {
        const { complaintId } = req.params;

        const chat = await Chat.findOne({ complaintId });
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        let updated = false;
        chat.messages.forEach(msg => {
            if (!msg.isRead && msg.sender.toString() !== req.user.id) {
                msg.isRead = true;
                msg.readAt = new Date();
                updated = true;
            }
        });
        if (updated) {
            await chat.save();
        }

        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking messages as read'
        });
    }
};

// ===== Get Unread Chat Count =====
const getUnreadCount = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user.id });
        
        let totalUnread = 0;
        const chatUnread = [];

        for (const chat of chats) {
            const unreadCount = chat.messages.filter(
                m => !m.isRead && m.sender.toString() !== req.user.id
            ).length;
            
            if (unreadCount > 0) {
                totalUnread += unreadCount;
                chatUnread.push({
                    chatId: chat._id,
                    complaintId: chat.complaintId,
                    unreadCount
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                totalUnread,
                chats: chatUnread
            }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting unread count'
        });
    }
};

module.exports = {
    getOrCreateChat,
    sendMessage,
    getChatMessages,
    markAsRead,
    getUnreadCount
};