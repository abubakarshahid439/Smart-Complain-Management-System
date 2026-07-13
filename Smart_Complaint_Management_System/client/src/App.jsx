import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PortalChoice from './pages/PortalChoice';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import { Toaster } from 'react-hot-toast';
import ManageComplaints from './pages/ManageComplaints';
import ComplaintHistory from './pages/ComplaintHistory';
import UserAnalytics from './pages/UserAnalytics';
import Notifications from './pages/Notification';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <SocketProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'dark:bg-slate-800 dark:text-white',
                style: {
                  background: '#fff',
                  color: '#1a202c',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                },
              }}
            />
            <Router>
              <div className="min-h-screen bg-slate-50 dark:bg-slate-900 tracking-tight transition-colors duration-300">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<PortalChoice />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin-dashboard"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/complaints"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <ManageComplaints />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/history"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <ComplaintHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/analytics"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <UserAnalytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;