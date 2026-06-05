import { SOCKET_URL } from './config';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

import { LanguageProvider } from './context/LanguageContext';
import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ComplaintDetail from './pages/ComplaintDetail';

const App = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);

  // Socket.IO configuration for real-time alerts
  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      return;
    }

    const socket = io(`${SOCKET_URL}`);
    
    // Join targeted notifications channel
    socket.emit('join', user.id);

    // Initial seed notification based on roles
    const seedNotifications = [
      {
        _id: 'seed-1',
        message: `Welcome to Namma Chennai, ${user.name}! You are logged in as a ${user.role}.`,
        createdAt: new Date().toISOString(),
        read: false,
      }
    ];
    setNotifications(seedNotifications);

    socket.on('new_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      // Play a subtle notification chime or alert
      console.log('Real-time notification received:', notif);
      alert(`⚠️ Alert: ${notif.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          
          {/* Main Top Header */}
          <AppHeader notifications={notifications} setNotifications={setNotifications} />
          
          {/* Main Routing Body */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/complaints/:id" element={<ComplaintDetail />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* Gov Portal Footer */}
          <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs font-semibold">
            <div className="max-w-7xl mx-auto px-4 space-y-2.5">
              <p className="text-slate-300 font-extrabold tracking-wider uppercase text-sm">Greater Chennai Corporation • Government of Tamil Nadu</p>
              <p className="leading-relaxed">
                © {new Date().getFullYear()} Namma Chennai Grievance & Transparency Engine. All rights reserved. <br/>
                Designed and developed for active citizen participation and public accountability.
              </p>
            </div>
          </footer>

        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
