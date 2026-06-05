import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText, Clock, CheckCircle2, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';

const COLORS = ['#2E7D32', '#0D47A1', '#ED6C02', '#9C27B0', '#00BCD4', '#F44336', '#E91E63'];

const MayorDashboard = ({ complaints, onSelectComplaint }) => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMayorDashboard = async () => {
      try {
        const token = localStorage.getItem('nc_token');
        const res = await axios.get(`${API_BASE_URL}/api/analytics/mayor`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch city-wide analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchMayorDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">Loading city-wide analytics...</span>
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

  const { stats, areaData, departmentPerformance } = data;

  // Render a mock chart data for category distribution city-wide
  const categoryData = departmentPerformance.map(d => ({
    name: d.department,
    value: d.total
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <span className="bg-red-100 text-red-800 border border-red-300 text-sm font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Mayor Executive Office</span>
        <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
          Chennai City Dashboard
        </h2>
        <p className="text-slate-500 text-base font-semibold mt-1">
          Review city-wide grievance heatmaps, track top recurring area issues, and evaluate municipal department scorecards.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
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

        {/* Resolution Rate */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-purple-50 text-purple-650 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('resolutionRate')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.resolutionRate}%</span>
          </div>
        </div>

      </div>

      {/* Interactive Map Visualisation */}
      <InteractiveMap complaints={complaints} onSelectComplaint={onSelectComplaint} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Department Performance Scorecards */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5 flex items-center space-x-1.5">
            <Award className="w-4.5 h-4.5 text-govGreen" />
            <span>Department Performance Scorecards</span>
          </h3>
          <div className="overflow-x-auto mt-3">
            <table className="min-w-full text-base font-semibold text-slate-500">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-left">
                  <th className="py-2.5">Department Name</th>
                  <th className="py-2.5">Total Grievances</th>
                  <th className="py-2.5">Resolved</th>
                  <th className="py-2.5">SLA Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentPerformance.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 text-slate-800 font-bold">{dept.department}</td>
                    <td className="py-3">{dept.total}</td>
                    <td className="py-3 text-emerald-650">{dept.resolved}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-sm font-extrabold ${
                        parseFloat(dept.resolutionRate) >= 65 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-red-50 text-red-750 border-red-100'
                      }`}>
                        {dept.resolutionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Complaints by Category Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[320px]">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5">Grievance Distribution</h3>
          <div className="w-full h-[220px] min-w-0 pt-4">
            <ResponsiveContainer width="100%" height="95%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 8.5, fontFamily: 'sans-serif' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MayorDashboard;
