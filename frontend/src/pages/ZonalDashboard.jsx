import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Clock, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

const COLORS = ['#D32F2F', '#1976D2', '#388E3C', '#FBC02D', '#7B1FA2', '#0288D1', '#E64A19'];

const ZonalDashboard = ({ complaints, onSelectComplaint }) => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchZonalDashboard = async () => {
      try {
        const token = localStorage.getItem('nc_token');
        const res = await axios.get(`${API_BASE_URL}/api/analytics/zonal`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch zonal analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchZonalDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">Loading zonal analytics...</span>
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

  const { zoneNumber, stats, escalatedCount, categoryTrends } = data;

  // Filter complaints list to show escalated items in zonal officer's zone
  const escalatedComplaints = complaints.filter(c => 
    c.status === 'Escalated' && c.citizen?.zone === zoneNumber
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-sm font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Zonal Officer Portal</span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
            Zone {zoneNumber} Administrative Oversight
          </h2>
          <p className="text-slate-500 text-base font-semibold mt-1">
            Resolve auto-escalated complaints, monitor department SLAs, and review issue distribution trends.
          </p>
        </div>
        <div className="bg-red-600 text-white rounded-2xl p-4 text-center min-w-[120px] shadow-md animate-pulse">
          <span className="text-sm font-bold block opacity-90 uppercase">Zonal Escalated</span>
          <span className="text-3xl font-extrabold block mt-0.5">{escalatedCount}</span>
        </div>
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

        {/* Escalated */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-red-50 text-red-650 rounded-2xl"><ShieldAlert className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('escalated')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{escalatedCount}</span>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-purple-55 text-purple-600 bg-purple-50 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('avgResTime')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.avgResolutionTime} Days</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of escalated complaints */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5 flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-red-650" />
            <span>Zonal Escalation Queue</span>
          </h3>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-base font-semibold text-slate-500">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-left">
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Title</th>
                  <th className="py-2.5">Priority</th>
                  <th className="py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {escalatedComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-slate-450 font-bold">
                      No auto-escalated issues pending in your zone.
                    </td>
                  </tr>
                ) : (
                  escalatedComplaints.map((c, i) => (
                    <tr key={c._id || i} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-extrabold text-red-600">{c.complaintId}</td>
                      <td className="py-3 text-slate-800 truncate max-w-[200px]">{c.title}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded border text-sm font-extrabold bg-red-50 text-red-650">
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3">
                        <button 
                          onClick={() => onSelectComplaint(c._id)}
                          className="text-govBlue hover:underline flex items-center space-x-0.5 font-extrabold"
                        >
                          <span>Review</span>
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

        {/* Right Column: Trend Analysis Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[320px]">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5">Zonal Issue Trends</h3>
          <div className="w-full h-[220px] min-w-0 pt-4">
            {categoryTrends.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-base font-semibold">
                No trend data for category metrics.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="95%" minWidth={0} minHeight={0}>
                <BarChart data={categoryTrends} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'sans-serif' }} />
                  <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 8, fontFamily: 'sans-serif', fontWeight: 'bold' }} />
                  <Tooltip wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                  <Bar dataKey="count" fill="#388E3C" radius={[0, 3, 3, 0]}>
                    {categoryTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ZonalDashboard;
