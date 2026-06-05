import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Landmark, TrendingUp, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

const MlaDashboard = () => {
  const { t } = useLanguage();
  const { user } = useSelector(state => state.auth);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMlaDashboard = async () => {
      try {
        const token = localStorage.getItem('nc_token');
        const res = await axios.get(`${API_BASE_URL}/api/analytics/mla`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch constituency analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchMlaDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">Loading constituency analytics...</span>
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

  const { constituency, wardStats, totalComplaints } = data;

  const filteredWards = wardStats.filter(w => 
    w.ward.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-purple-100 text-purple-800 border border-purple-300 text-sm font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Member of Legislative Assembly (MLA) Portal</span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
            {constituency} Constituency Oversight
          </h2>
          <p className="text-slate-500 text-base font-semibold mt-1">
            Analyze ward performance comparisons and audit resolved vs. long-pending complaints.
          </p>
        </div>
        <div className="bg-govBlue text-white rounded-2xl p-4 text-center min-w-[120px] shadow-sm">
          <span className="text-sm font-bold block opacity-75 uppercase">Total Registered</span>
          <span className="text-3xl font-extrabold block mt-0.5">{totalComplaints}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Ward list comparison */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3.5 gap-2">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Ward Comparison Table</h3>
            <input 
              type="text" 
              placeholder="Filter by Ward #..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-govGreen/40 w-36 font-semibold"
            />
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="min-w-full text-base font-semibold text-slate-500">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-left">
                  <th className="py-2">Ward</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Pending</th>
                  <th className="py-2">Resolved</th>
                  <th className="py-2">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWards.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-450 font-bold">
                      No wards matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWards.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-extrabold text-govBlue">Ward {w.ward}</td>
                      <td className="py-3 text-slate-800">{w.total}</td>
                      <td className="py-3 text-red-650">{w.pending}</td>
                      <td className="py-3 text-emerald-650">{w.resolved}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full border text-sm font-extrabold ${
                          parseFloat(w.resolutionRate) >= 70 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {w.resolutionRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Comparison Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[350px]">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5">Ward Resolution Performance</h3>
          <div className="w-full h-[250px] min-w-0 pt-4">
            {wardStats.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-base font-semibold">
                No ward data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="95%" minWidth={0} minHeight={0}>
                <BarChart data={wardStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="ward" label={{ value: 'Ward Number', position: 'bottom', offset: -5, style: { fontSize: 9, fontFamily: 'sans-serif', fontWeight: 'bold' } }} tick={{ fontSize: 9, fontFamily: 'sans-serif' }} />
                  <YAxis label={{ value: 'Complaints count', angle: -90, position: 'insideLeft', style: { fontSize: 9, fontFamily: 'sans-serif', fontWeight: 'bold' } }} tick={{ fontSize: 9, fontFamily: 'sans-serif' }} />
                  <Tooltip wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: 'sans-serif' }} />
                  <Bar name="Resolved" dataKey="resolved" fill="#2E7D32" radius={[3, 3, 0, 0]} />
                  <Bar name="Pending" dataKey="pending" fill="#D32F2F" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MlaDashboard;
