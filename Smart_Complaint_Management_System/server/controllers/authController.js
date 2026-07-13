const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        // Create user - role will default to 'user' from schema
        // status will default to 'pending' from schema
        const user = await User.create({
            name,
            email,
            password
        });

        // Send token response
        sendTokenResponse(user, 201, res);

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered'
            });
        }
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is approved
        if (user.status === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval. Please wait for admin approval.'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Approve user registration
// @route   GET /api/auth/approve/:token
// @access  Public (Secure via token)
exports.approveUser = async (req, res) => {
    try {
        // Find user by token and check if token is not expired
        const user = await User.findOne({
            approvalToken: req.params.token,
            approvalTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired approval token'
            });
        }

        // Set status to approved and clear token
        user.status = 'approved';
        user.approvalToken = undefined;
        user.approvalTokenExpire = undefined;

        await user.save();

        res.status(200).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4f46e5;">✅ Account Approved!</h1>
                <p style="font-size: 18px; color: #333;">The account for <strong>${user.name}</strong> (${user.email}) has been successfully activated.</p>
                <p style="font-size: 16px; color: #666;">The user can now log in to the portal.</p>
                <a href="http://localhost:5173/login" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Login</a>
            </div>
        `);
    } catch (err) {
        console.error('Approval error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update user profile (name only)
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a name'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.name = name;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Approve user by admin (Admin only)
// @route   PUT /api/auth/approve-user/:id
// @access  Private/Admin
exports.approveUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already approved
        if (user.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'User is already approved'
            });
        }

        // Approve user
        user.status = 'approved';
        user.approvalToken = undefined;
        user.approvalTokenExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.email} has been approved successfully!`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (err) {
        console.error('Approve user error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Reject user by admin (Admin only)
// @route   DELETE /api/auth/reject-user/:id
// @access  Private/Admin
exports.rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete the user
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: `User ${user.email} has been rejected and removed.`
        });
    } catch (err) {
        console.error('Reject user error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Promote user to admin (Admin only)
// @route   PUT /api/auth/promote-admin/:id
// @access  Private/Admin
exports.promoteToAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already admin
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'User is already an admin'
            });
        }

        // Promote to admin
        user.role = 'admin';
        user.status = 'approved'; // Auto-approve if pending
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.email} has been promoted to admin!`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (err) {
        console.error('Promote to admin error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get pending users (Admin only)
// @route   GET /api/auth/pending-users
// @access  Private/Admin
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ 
            status: 'pending',
            role: 'user' 
        });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error('Get pending users error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all admins (Admin only)
// @route   GET /api/auth/admins
// @access  Private/Admin
exports.getAdmins = async (req, res) => {
    try {
        const users = await User.find({ 
            role: 'admin' 
        });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error('Get admins error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign(
        { 
            id: user._id,
            email: user.email,
            role: user.role 
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d'
        }
    );

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
};