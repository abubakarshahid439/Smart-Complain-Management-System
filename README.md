# CMS Pro - Complaint Management System

A comprehensive complaint management system with real-time chat, notifications, and advanced analytics.

## 🚀 Features

### Core Features
- 🔐 **Authentication & Authorization** - User and Admin roles with JWT authentication
- 📝 **Complaint Management** - Create, read, update, and delete complaints
- 📊 **Status Tracking** - Track complaints through Pending → In Progress → Resolved/Rejected
- ⭐ **Satisfaction Rating** - Users can rate resolved complaints
- 📅 **Complaint Timeline** - View complete history of complaint updates
- 🔔 **Real-time Notifications** - In-app and email notifications
- 💬 **Live Chat** - Real-time chat between users and admins
- 🌓 **Dark/Light Theme** - Toggle between dark and light modes
- 📱 **Responsive Design** - Works on all devices

### Admin Features
- 📈 **Analytics Dashboard** - View complaint statistics and trends
- 👥 **User Analytics** - Track user complaint history
- 📋 **Manage Complaints** - Update status, add resolutions
- 📚 **Complaint History** - View resolved/rejected complaints
- 👤 **User Management** - View and manage users

### User Features
- 📝 **Submit Complaints** - Submit new complaints with priority and category
- 🔍 **Track Complaints** - View status and updates
- 💬 **Chat with Admin** - Real-time communication
- ⭐ **Rate Resolution** - Rate resolved complaints
- 📋 **View Timeline** - See complete complaint history

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Recharts** - Charts and analytics
- **Lucide React** - Icons
- **React Hot Toast** - Toast notifications
- **Date-fns** - Date formatting

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time WebSocket server
- **JWT** - Authentication
- **Nodemailer** - Email notifications
- **Bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/abubakarshahid439/cms-pro.git
cd cms-pro
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your values
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your API URL
# VITE_API_URL=http://localhost:5000

# Start frontend development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Socket.IO: http://localhost:5000

## 📁 Project Structure

```
cms-pro/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ComplaintDetailsModal.jsx
│   │   │   ├── ComplaintTimeline.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── CustomDropdown.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── NotificationItem.jsx
│   │   │   ├── ProfileModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SatisfactionRating.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── UserSidebar.jsx
│   │   ├── context/                # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminRegister.jsx
│   │   │   ├── ComplaintHistory.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ManageComplaints.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── PortalChoice.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserAnalytics.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                          # Backend Express application
│   ├── controllers/                 # Route controllers
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── complaintController.js
│   │   ├── notificationController.js
│   │   └── systemController.js
│   ├── middleware/                  # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/                      # MongoDB models
│   │   ├── Chat.js
│   │   ├── Complaint.js
│   │   ├── Notification.js
│   │   ├── SystemSettings.js
│   │   └── User.js
│   ├── routes/                      # API routes
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── systemRoutes.js
│   ├── utils/                       # Utility functions
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── .env
│
├── README.md
└── package.json
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cms-pro
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@cmspro.com
FROM_NAME=CMS Pro System
FRONTEND_URL=http://localhost:5173

# Admin Setup
SUPER_ADMIN_EMAIL=admin@example.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication Routes
| Method | Endpoint | Description | Access |
|--------|----------|--------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/me | Get current user | Private |
| PUT | /api/auth/update-profile | Update profile | Private |

### Complaint Routes
| Method | Endpoint | Description | Access |
|--------|----------|--------------|--------|
| GET | /api/complaints | Get all complaints | Private |
| POST | /api/complaints | Create complaint | Private |
| GET | /api/complaints/stats | Get statistics | Admin |
| GET | /api/complaints/:id | Get complaint | Private |
| PUT | /api/complaints/:id | Update status | Admin |
| DELETE | /api/complaints/:id | Delete complaint | Private |
| PUT | /api/complaints/:id/update | Update complaint | Private |
| POST | /api/complaints/:id/rate | Rate complaint | Private |

### Chat Routes
| Method | Endpoint | Description | Access |
|--------|----------|--------------|--------|
| GET | /api/chat/complaint/:complaintId | Get/Create chat | Private |
| POST | /api/chat/complaint/:complaintId/message | Send message | Private |
| GET | /api/chat/complaint/:complaintId/messages | Get messages | Private |
| PUT | /api/chat/complaint/:complaintId/read | Mark as read | Private |
| GET | /api/chat/unread | Get unread count | Private |

### Notification Routes
| Method | Endpoint | Description | Access |
|--------|----------|--------------|--------|
| GET | /api/notifications | Get notifications | Private |
| GET | /api/notifications/unread-count | Get unread count | Private |
| PUT | /api/notifications/:id/read | Mark as read | Private |
| PUT | /api/notifications/read-all | Mark all as read | Private |
| DELETE | /api/notifications/:id | Delete notification | Private |

## 🎯 Usage Guide

### For Users
1. **Register** - Create a new account
2. **Login** - Access your dashboard
3. **Submit Complaint** - Click "Submit Complaint" and fill in details
4. **Track Status** - View status of your complaints
5. **Rate Resolution** - Rate when complaint is resolved
6. **Chat with Admin** - Use the chat feature for communication
7. **View Timeline** - See complaint history

### For Admins
1. **Admin Login** - Access admin dashboard
2. **Manage Complaints** - Update status and add resolutions
3. **View Analytics** - Monitor system statistics
4. **Chat with Users** - Respond to user queries in real-time
5. **Manage Users** - View user activity

## 🚀 Deployment

### Deploy Backend to Render
```bash
# Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# Connect your GitHub repo to Render
# Add environment variables in Render dashboard
```

### Deploy Frontend to Vercel
```bash
cd client
npm run build

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to AWS EC2
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2

# Clone and deploy
git clone https://github.com/yourusername/cms-pro.git
cd cms-pro/server
npm install
pm2 start server.js --name cms-api

# Configure Nginx
sudo nano /etc/nginx/sites-available/cms-pro
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Abubakar Shahid** - *Initial work* - [YourGitHub](https://github.com/abubakarshahid439)

## 🙏 Acknowledgments

- React
- Node.js
- MongoDB
- Socket.IO
- Tailwind CSS
- Vite

## 🐛 Known Issues

- Socket.IO reconnection on network change
- Notification delivery on slow networks

## 🔮 Future Features

- Two-factor authentication (2FA)
- Bulk complaint operations
- Advanced search with filters
- AI-powered complaint categorization
- Mobile app with React Native
- Integration with Slack/Discord
- Video call support
- Knowledge base/FAQ section

---

Made with ❤️ 
