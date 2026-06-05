import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import homeHero from '../assets/home_hero.jpg';
import { 
  ShieldCheck, Eye, EyeOff, Globe, MapPin, 
  FileText, Clock, CheckCircle2 
} from 'lucide-react';
import PublicFeed from '../components/PublicFeed';
import InteractiveMap from '../components/InteractiveMap';

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [complaints, setComplaints] = useState([]);
  const [scorecardStats, setScorecardStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPublicData = async () => {
    try {
      // Fetch public complaint feeds.
      const token = localStorage.getItem('nc_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const complaintsRes = await axios.get(`${API_BASE_URL}/api/complaints`, { headers });
      const complaintsList = complaintsRes.data;
      setComplaints(complaintsList);

      // Compute aggregate city-wide metrics directly from complaints
      let total = complaintsList.length;
      let pending = complaintsList.filter(c => ['Submitted', 'Assigned', 'In Progress', 'Escalated'].includes(c.status)).length;
      let resolved = complaintsList.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
      
      setScorecardStats({ total, pending, resolved });
    } catch (err) {
      console.error('Failed to load public data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  const handleSelectComplaint = (id) => {
    // Redirect to login if guest clicks details, or allow guest to view details if authenticated, or navigate to details
    navigate(`/complaints/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome GovTech Banner */}
      <div className="relative bg-gradient-to-r from-govGreen-dark to-govBlue-dark rounded-3xl text-white p-8 lg:p-12 shadow-xl overflow-hidden">
        
        {/* Inline Vector Chennai Skyline Silhouette */}
        <div className="absolute bottom-0 right-0 w-full md:w-2/3 h-24 md:h-36 opacity-10 pointer-events-none">
          <svg viewBox="0 0 500 150" className="w-full h-full" fill="currentColor">
            {/* Chennai Central Central Station tower silhouette */}
            <rect x="50" y="50" width="40" height="100" />
            <polygon points="50,50 70,20 90,50" />
            {/* LIC Building */}
            <rect x="120" y="20" width="30" height="130" />
            <line x1="120" y1="35" x2="150" y2="35" stroke="currentColor" strokeWidth="2" />
            <line x1="120" y1="65" x2="150" y2="65" stroke="currentColor" strokeWidth="2" />
            <line x1="120" y1="95" x2="150" y2="95" stroke="currentColor" strokeWidth="2" />
            {/* High Court Dome */}
            <path d="M190 150 L190 80 Q210 50 230 80 L230 150 Z" />
            {/* Ripon Building columns */}
            <rect x="280" y="60" width="100" height="90" />
            <rect x="320" y="10" width="20" height="50" />
            <polygon points="320,10 330,0 340,10" />
            {/* Napier Bridge arcs */}
            <path d="M 400,150 Q 420,110 440,150 Q 460,110 480,150" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Public Accountability Platform</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              {t('appName')} – Chennai Governance Portal
            </h1>
            <p className="text-slate-200 text-xs lg:text-sm leading-relaxed">
              Welcome to Chennai's official public grievance, monitoring, and transparency platform. Unlike traditional complaint portals, every grievance submitted is publicly visible, geo-located, and tracked through an immutable timeline.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/register" className="bg-white hover:bg-slate-100 text-govGreen font-bold px-5 py-2.5 rounded-xl shadow-sm text-xs transition">
                {t('submitComplaint')}
              </Link>
              <Link to="/login" className="bg-govGreen text-white border border-govGreen-dark font-bold px-5 py-2.5 rounded-xl shadow-sm text-xs hover:bg-govGreen-dark transition">
                Stakeholder Login
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-4 bg-white/95 backdrop-blur p-2.5 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 overflow-hidden h-48 md:h-56">
            <img src={homeHero} alt="Namma Chennai" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </div>

      {/* Grid of City-Wide Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
          <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">City Total</span>
          <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{scorecardStats.total ?? 0}</span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
          <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block text-red-500">Unresolved</span>
          <span className="text-3xl font-extrabold text-red-650 block mt-0.5">{scorecardStats.pending ?? 0}</span>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
          <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block text-emerald-500">Resolved</span>
          <span className="text-3xl font-extrabold text-emerald-650 block mt-0.5">{scorecardStats.resolved ?? 0}</span>
        </div>

      </div>

      {/* Side-by-Side: Feed & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Feed Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <Eye className="w-5 h-5 text-govGreen" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">{t('publicFeed')}</h3>
          </div>
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-base font-semibold animate-pulse">
              Loading complaints feed...
            </div>
          ) : (
            <PublicFeed 
              complaints={complaints} 
              setComplaints={setComplaints} 
              onSelectComplaint={(id) => window.location.href = `/complaints/${id}`} 
            />
          )}
        </div>

        {/* Map Column */}
        <div className="lg:col-span-6 sticky top-24">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 h-[520px] flex items-center justify-center">
              <span className="text-slate-400 text-base font-bold animate-pulse">Loading map overlays...</span>
            </div>
          ) : (
            <InteractiveMap 
              complaints={complaints} 
              onSelectComplaint={(id) => window.location.href = `/complaints/${id}`} 
            />
          )}
        </div>

      </div>

    </div>
  );
};

export default Home;
