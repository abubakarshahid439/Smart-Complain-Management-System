import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext();

const SOCKET_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSystemOnline, setIsSystemOnline] = useState(true);
    const [socket, setSocket] = useState(null);

    // Axios interceptor for security
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const isAuthPage = window.location.pathname.includes('/login') || 
                                  window.location.pathname.includes('/register') ||
                                  window.location.pathname.includes('/admin/login') ||
                                  window.location.pathname.includes('/admin/register');
                
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    if (!isAuthPage) {
                        console.log('Auth error, logging out...');
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                if (!e.newValue) {
                    logout();
                } else {
                    fetchUser(e.newValue);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            axios.interceptors.response.eject(interceptor);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        fetchSystemStatus();

        newSocket.on('systemStatusUpdate', (status) => {
            console.log('System status updated via socket:', status);
            setIsSystemOnline(status);
        });

        return () => newSocket.close();
    }, []);

    const fetchSystemStatus = async () => {
        try {
            const { data } = await axios.get(`${SOCKET_URL}/api/system/status`);
            setIsSystemOnline(data.data.isSystemOnline);
        } catch (error) {
            console.error('Error fetching system status', error);
        }
    };

    const toggleSystemStatus = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.put(`${SOCKET_URL}/api/system/toggle`, {}, config);
            setIsSystemOnline(data.data.isSystemOnline);
        } catch (error) {
            console.error('Error toggling system status', error);
            throw error;
        }
    };

    const fetchUser = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get('http://localhost:5000/api/auth/me', config);
            console.log('User fetched:', data.data);
            setUser(data.data);
        } catch (error) {
            console.error('Fetch user error:', error);
            sessionStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // ===== GET TOKEN - ADD THIS =====
    const getToken = () => {
        return sessionStorage.getItem('token');
    };

    // ===== LOGIN =====
    const login = async (email, password) => {
        try {
            console.log('Login attempt for:', email);
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            console.log('Login response:', data);
            
            if (data.token) {
                sessionStorage.setItem('token', data.token);
                setUser(data.data || data.user);
                return data;
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // ===== REGISTER =====
    const register = async (name, email, password, role = 'user') => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', { 
                name, 
                email, 
                password, 
                role 
            });

            if (data.token) {
                sessionStorage.setItem('token', data.token);
                setUser(data.data || data.user);
            }
            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    // ===== UPDATE PROFILE =====
    const updateProfile = async (name) => {
        try {
            const token = sessionStorage.getItem('token');
            const { data } = await axios.put('http://localhost:5000/api/auth/update-profile',
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(data.data);
            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    // ===== LOGOUT =====
    const logout = () => {
        console.log('Logging out...');
        sessionStorage.removeItem('token');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        getToken, // ADD THIS
        isSystemOnline,
        toggleSystemStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;