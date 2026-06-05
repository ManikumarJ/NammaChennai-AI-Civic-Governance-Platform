import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateVerification } from '../store/authSlice';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token in request.');
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message);
        dispatch(updateVerification());
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed. The link may have expired.');
      }
    };
    triggerVerification();
  }, [token, dispatch]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-md text-center">
        
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-govGreen animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Verifying Email Address</h2>
            <p className="text-slate-500 text-base">Communicating with Namma Chennai servers...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-800">Verification Successful</h2>
            <p className="text-slate-600 text-base leading-relaxed">{message}</p>
            <div className="pt-4 border-t border-slate-100">
              <Link to="/login" className="inline-flex items-center space-x-1.5 text-white btn-green-grad font-bold px-5 py-2.5 rounded-xl shadow transition text-base">
                <span>Proceed to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-800">Verification Failed</h2>
            <p className="text-slate-600 text-base leading-relaxed">{message}</p>
            <div className="pt-4 border-t border-slate-100">
              <Link to="/login" className="text-govBlue hover:underline font-bold text-xs">
                Go to Login Page
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
