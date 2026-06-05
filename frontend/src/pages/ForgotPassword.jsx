import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message + ' Note: Since SMTP is mocked, the reset link is printed to the Node.js backend console.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset. Make sure the email is registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-md">
        
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-govBlue/10 flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6 text-govBlue" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{t('forgotPass')}</h2>
          <p className="text-slate-500 text-base mt-1">Enter your registered email and we'll send a link to reset your password.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-base font-semibold mb-5">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-3 text-base font-semibold mb-5">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                placeholder="citizen@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 text-white btn-green-grad font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-base mt-6"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-base font-semibold text-slate-500 border-t border-slate-100 pt-6">
          <Link to="/login" className="text-slate-500 hover:text-govGreen flex items-center justify-center space-x-1 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
