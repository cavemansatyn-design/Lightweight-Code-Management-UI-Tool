import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import PlaceholderModule from './pages/PlaceholderModule';
import AttendancePage from './pages/Attendance';
import AdminPanel from './pages/AdminPanel';
import AIModule from './pages/AIModule';
import PersonalProgress from './pages/PersonalProgress';
import { AuthProvider, useAuth } from './context/AuthContext';

import ChatPanel from './components/ChatPanel';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', position: 'relative' }}>
        {children}
      </div>
      <ChatPanel />
    </div>
  ) : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/workspace/:projectId" element={
            <PrivateRoute>
              <Workspace />
            </PrivateRoute>
          } />

          <Route path="/ai" element={<PrivateRoute><AIModule /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute><PlaceholderModule title="System Log" /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><PersonalProgress /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
