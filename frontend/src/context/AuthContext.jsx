import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = authApi.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await authApi.login(email, password);
        // data.user already has role merged by api.js or backend
        // data.user + data.access_token is stored in localStorage by api.js
        // We just update state.
        const storedUser = authApi.getCurrentUser(); // Re-read to be sure or construct it
        setUser(storedUser);
        return data;
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    const register = async (name, email, password, role) => {
        await authApi.register(name, email, password, role);
    };

    return (
        <AuthContext.Provider value={{ user, role: user?.role, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
