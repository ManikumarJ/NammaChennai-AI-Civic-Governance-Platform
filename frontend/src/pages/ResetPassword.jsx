import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Lock, ArrowRight, Check } from 'lucide-react';

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setMessage('Password updated successfully! Redirecting to login page...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-md">
        
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-govGreen/10 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-govGreen" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Set New Password</h2>
          <p className="text-slate-500 text-base mt-1">Please enter your new password below.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-base font-semibold mb-5">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-3 text-base font-semibold mb-5 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('password')}</label>
              <input
                type="password"
                placeholder="New Password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('confirmPass')}</label>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 text-white btn-green-grad font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-base mt-6"
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
