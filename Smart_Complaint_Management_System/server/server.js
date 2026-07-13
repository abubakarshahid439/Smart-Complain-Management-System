const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const systemRoutes = require('./routes/systemRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'CMS Pro API Running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            complaints: '/api/complaints',
            notifications: '/api/notifications',
            system: '/api/system',
            chat: '/api/chat'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        socketio: 'ready'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('📚 Stack:', err.stack);
    
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO Configuration
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    console.log('📡 Total clients connected:', io.engine.clientsCount);

    socket.on('join-room', (userId) => {
        if (userId) {
            socket.join(`user-${userId}`);
            console.log(`👤 User ${userId} joined room: user-${userId}`);
        }
    });

    socket.on('join-admin-channel', () => {
        socket.join('admin-channel');
        console.log('👑 Admin joined admin-channel');
    });

    socket.on('join-chat', (chatId) => {
        if (chatId) {
            socket.join(`chat-${chatId}`);
            console.log(`💬 Joined chat room: chat-${chatId}`);
        }
    });

    socket.on('typing', (data) => {
        const { chatId, userId, isTyping } = data;
        if (chatId) {
            socket.broadcast.to(`chat-${chatId}`).emit('typing', {
                chatId,
                userId,
                isTyping
            });
        }
    });

    socket.on('new-message', (data) => {
        const { chatId, complaintId, message } = data;
        
        io.to(`chat-${chatId}`).emit('message-received', {
            chatId,
            complaintId,
            message
        });

        if (message.senderRole === 'user') {
            io.to('admin-channel').emit('new-user-message', {
                chatId,
                complaintId,
                user: message.sender,
                message
            });
        }
    });

    socket.on('mark-read', (data) => {
        const { chatId, userId } = data;
        io.to(`chat-${chatId}`).emit('messages-read', {
            chatId,
            userId
        });
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        console.log('📡 Total clients connected:', io.engine.clientsCount);
    });

    socket.on('error', (error) => {
        console.error('❌ Socket error:', error.message);
    });
});

app.set('io', io);
global.io = io;

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`🔌 Socket.IO ready on port ${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
                process.exit(1);
            } else {
                console.error('❌ Server error:', error.message);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('Please check your MONGODB_URI in .env file');
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    console.error('📚 Stack:', err.stack);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error('📚 Stack:', err.stack);
    server.close(() => {
        process.exit(1);
    });
});

const gracefulShutdown = () => {
    console.log('🛑 Received shutdown signal. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ HTTP server closed');
        mongoose.connection.close(() => {
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, server, io };