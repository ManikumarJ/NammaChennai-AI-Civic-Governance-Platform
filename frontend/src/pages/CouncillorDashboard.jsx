import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Clock, CheckCircle2, Award, ArrowRight } from 'lucide-react';

const COLORS = ['#ED6C02', '#0D47A1', '#2E7D32'];

const CouncillorDashboard = ({ complaints, onSelectComplaint }) => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCouncillorDashboard = async () => {
      try {
        const token = localStorage.getItem('nc_token');
        const res = await axios.get(`${API_BASE_URL}/api/analytics/councillor`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch councillor analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchCouncillorDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">Loading councillor dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-700 p-5 rounded-2xl max-w-lg mx-auto text-center font-bold">
        {error || 'Error loading dashboard.'}
      </div>
    );
  }

  const { stats, statusData } = data;

  // Filter complaints list to only show councillor's ward
  const wardNumber = data.wardNumber;
  const wardComplaints = complaints.filter(c => c.citizen?.ward === wardNumber);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-sm font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Ward Councillor Portal</span>
        <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
          Ward {wardNumber} Administration
        </h2>
        <p className="text-slate-500 text-base font-semibold mt-1">
          Review grievances, update statuses, upload completion images, and coordinate with citizens.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-govBlue/10 text-govBlue rounded-2xl"><FileText className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('totalComplaints')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.total}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('pending')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.pending}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('resolved')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.resolved}</span>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-purple-55 text-purple-600 bg-purple-50 rounded-2xl"><Award className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('avgResTime')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.avgResolutionTime} Days</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of ward complaints */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5">Ward Grievance Queue</h3>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-base font-semibold text-slate-500">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-left">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Priority</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-450 font-bold">
                      No complaints registered in your ward.
                    </td>
                  </tr>
                ) : (
                  wardComplaints.map((c, i) => (
                    <tr key={c._id || i} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-extrabold text-govBlue">{c.complaintId}</td>
                      <td className="py-3 text-slate-800">{c.category}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded border text-sm font-extrabold ${
                          c.priority === 'High' || c.priority === 'Critical' ? 'bg-red-50 text-red-650' : 'bg-slate-50 text-slate-550'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded border text-sm font-extrabold ${
                          c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button 
                          onClick={() => onSelectComplaint(c._id)}
                          className="text-govBlue hover:underline flex items-center space-x-0.5 font-extrabold"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[320px]">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5">Resolution Matrix</h3>
          <div className="w-full h-[220px] min-w-0 pt-4">
            <ResponsiveContainer width="100%" height="95%" minWidth={0} minHeight={0}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: 'sans-serif' }} />
                <YAxis tick={{ fontSize: 9, fontFamily: 'sans-serif' }} />
                <Tooltip wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CouncillorDashboard;
