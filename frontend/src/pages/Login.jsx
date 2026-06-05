import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/authSlice';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, LogIn, Key, Users } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      dispatch(setCredentials(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Autofill login details for easy testing of roles
  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  const demoAccounts = [
    { label: 'Citizen (KK Nagar)', email: 'manikumar@gmail.com', role: 'Citizen' },
    { label: 'Ward Councillor (W-138)', email: 'councillor138@chennai.gov.in', role: 'Councillor' },
    { label: 'Zonal Officer (Z-10)', email: 'zonal10@chennai.gov.in', role: 'Zonal' },
    { label: 'MLA (Virugambakkam)', email: 'mla.virugambakkam@tn.gov.in', role: 'MLA' },
    { label: 'Mayor (City Wide)', email: 'mayor@chennai.gov.in', role: 'Mayor' },
    { label: 'Commissioner (Admin Power)', email: 'commissioner@chennai.gov.in', role: 'Commissioner' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-govGreen/5 rounded-full filter blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-govBlue/5 rounded-full filter blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Brand/Welcome Side */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2">
            <span className="bg-govGreen/10 text-govGreen text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">GovTech Initiative</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            {t('appName')} <br/>
            <span className="text-govGreen">{t('tagline')}</span>
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto lg:mx-0 leading-relaxed">
            Welcome back to the Greater Chennai grievance monitoring system. Log in to register grievances, track updates, check performance audits, and comment directly on progress.
          </p>
          
          {/* Quick Login Drawer */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center space-x-2 text-govBlue font-bold text-sm uppercase tracking-wide">
              <Users className="w-4.5 h-4.5" />
              <span>Quick Demo Portals</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Click to instantly populate credentials for any stakeholder role:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickLogin(acc.email)}
                  className="px-2.5 py-2 text-sm text-left font-bold text-slate-600 hover:text-govGreen bg-slate-100 hover:bg-govGreen/5 border border-slate-200 hover:border-govGreen/30 rounded-xl transition"
                >
                  <span className="block text-slate-400 text-sm font-extrabold tracking-wider uppercase mb-0.5">{acc.role}</span>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-md max-w-md mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{t('login')}</h2>
            <p className="text-slate-500 text-base mt-1">Enter your credentials below to access your local dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-base font-semibold mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@chennai.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('password')}</label>
                <Link to="/forgot-password" className="text-xs text-govBlue hover:underline font-bold">{t('forgotPass')}</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 text-white btn-green-grad font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-base mt-6"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t('login')}</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect */}
          <div className="mt-6 text-center text-base font-semibold text-slate-500 border-t border-slate-100 pt-6">
            New Citizen?{' '}
            <Link to="/register" className="text-govGreen hover:underline font-bold">
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
