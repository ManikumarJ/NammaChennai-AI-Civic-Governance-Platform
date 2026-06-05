import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Globe, LogOut, Shield, User as UserIcon, Menu, X } from 'lucide-react';
import { logout } from '../store/authSlice';
import { useLanguage } from '../context/LanguageContext';
import io from 'socket.io-client';
import logo from '../assets/logo.png';

const AppHeader = ({ notifications: propNotifications, setNotifications }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { language, toggleLanguage, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotify(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Citizen': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Ward Councillor': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MLA': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Zonal Officer': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Mayor': return 'bg-red-100 text-red-800 border-red-300';
      case 'Corporation Commissioner': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const unreadCount = propNotifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          
          {/* Brand Logo & Gov Emblem */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Namma Chennai Logo" className="h-16 md:h-20 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-govGreen font-semibold transition">{t('home')}</Link>
            
            {user && (
              <Link to="/dashboard" className="text-slate-600 hover:text-govGreen font-semibold transition">
                {t('dashboard')}
              </Link>
            )}

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-slate-700"
            >
              <Globe className="w-4 h-4 text-govGreen" />
              <span>{t('language')}</span>
            </button>

            {token ? (
              <div className="flex items-center space-x-4">
                {/* Notification Dropdown Container */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowNotify(!showNotify)}
                    className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-govGreen transition focus:outline-none"
                  >
                    <Bell className="w-5.5 h-5.5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {showNotify && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllRead} 
                            className="text-xs text-govGreen hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {propNotifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-slate-400 text-sm">
                            No notifications yet.
                          </div>
                        ) : (
                          propNotifications.map((notif, index) => (
                            <div 
                              key={notif._id || index} 
                              onClick={() => {
                                setShowNotify(false);
                                if (notif.complaint) {
                                  navigate(`/complaints/${notif.complaint._id || notif.complaint}`);
                                }
                              }}
                              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition ${!notif.read ? 'bg-govGreen/5' : ''}`}
                            >
                              <p className="text-base text-slate-700 leading-normal">{notif.message}</p>
                              <span className="text-sm text-slate-400 block mt-1.5">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info & Badge */}
                <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800 leading-tight">{user.name}</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full border mt-0.5 ${getRoleColor(user.role)}`}>
                      {t(user.role === 'Citizen' ? 'citizenPortal' : user.role === 'Ward Councillor' ? 'councillor' : user.role.toLowerCase().replace(' ', ''))}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title={t('logout')}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-base font-bold text-govBlue hover:text-govBlue-dark px-3 py-2 transition">{t('login')}</Link>
                <Link to="/register" className="text-base font-bold text-white btn-green-grad px-4 py-2 rounded-lg shadow-sm hover:shadow transition">{t('register')}</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button 
              onClick={toggleLanguage} 
              className="p-1 rounded-full border border-slate-200 hover:bg-slate-50 transition text-base font-semibold text-slate-700"
            >
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-4 space-y-2">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold">{t('home')}</Link>
          {user && (
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold">{t('dashboard')}</Link>
          )}
          {token ? (
            <div className="border-t border-slate-100 pt-2 mt-2 space-y-2">
              <div className="px-3 py-2">
                <div className="text-sm font-bold text-slate-800">{user.name}</div>
                <div className="text-base text-slate-500 mt-0.5">{user.role}</div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 mt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-2 border border-slate-200 rounded-lg text-sm font-bold text-govBlue">{t('login')}</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-2 btn-green-grad text-white rounded-lg text-sm font-bold">{t('register')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AppHeader;
