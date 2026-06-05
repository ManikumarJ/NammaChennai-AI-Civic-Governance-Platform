import React, { useState } from 'react';
import { MapPin, Info, CheckCircle, Clock, AlertTriangle, Crosshair } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const InteractiveMap = ({ complaints, onSelectComplaint }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('ALL'); // ALL, Submitted, In Progress, Resolved
  const [selectedPin, setSelectedPin] = useState(null);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (filter === 'ALL') return true;
    if (filter === 'Submitted') return c.status === 'Submitted' || c.status === 'Escalated';
    if (filter === 'In Progress') return c.status === 'Assigned' || c.status === 'In Progress';
    if (filter === 'Resolved') return c.status === 'Resolved' || c.status === 'Closed';
    return true;
  });

  const getMarkerColor = (status) => {
    if (status === 'Submitted') return 'text-red-500 bg-red-100 border-red-500';
    if (status === 'Escalated') return 'text-red-600 bg-red-200 border-red-600 animate-pulse';
    if (status === 'Assigned' || status === 'In Progress') return 'text-amber-500 bg-amber-100 border-amber-500';
    if (status === 'Resolved' || status === 'Closed') return 'text-emerald-500 bg-emerald-100 border-emerald-500';
    return 'text-slate-500 bg-slate-100 border-slate-500';
  };

  const getMarkerIcon = (status) => {
    if (status === 'Submitted' || status === 'Escalated') return <AlertTriangle className="w-4 h-4" />;
    if (status === 'Assigned' || status === 'In Progress') return <Clock className="w-4 h-4" />;
    if (status === 'Resolved' || status === 'Closed') return <CheckCircle className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  // We map coordinates to percentages in a simulated container of Chennai for fallback UI
  // Coordinates are roughly:
  // KK Nagar: 13.0368, 80.1982
  // T. Nagar: 13.0392, 80.2319
  // Adyar: 13.0063, 80.2574 (shifted to fit canvas well)
  // Mylapore: 13.0328, 80.2685
  // Velachery: 12.9803, 80.2224
  // Map limits:
  // Lat: 12.96 to 13.06
  // Lng: 80.18 to 80.28
  const getCoordinatesPct = (lat, lng) => {
    const minLat = 12.96;
    const maxLat = 13.06;
    const minLng = 80.18;
    const maxLng = 80.28;

    // Convert coordinates to 5% to 95% coordinates on CSS absolute container
    const x = ((lng - minLng) / (maxLng - minLng)) * 90 + 5;
    const y = 95 - (((lat - minLat) / (maxLat - minLat)) * 90 + 5); // Lat goes up, Y CSS goes down
    
    // Clamp
    return {
      x: Math.min(92, Math.max(8, x)),
      y: Math.min(92, Math.max(8, y))
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[520px]">
      
      {/* Map Control Bar */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-5 h-5 text-govGreen" />
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">{t('map')}</h3>
        </div>
        <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
          {['ALL', 'Submitted', 'In Progress', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedPin(null); }}
              className={`px-3 py-1.5 rounded-md transition ${filter === f ? 'bg-white text-govBlue font-bold shadow-sm' : 'hover:text-slate-800'}`}
            >
              {f === 'ALL' ? 'All Areas' : t(f.toLowerCase().replace(' ', ''))}
            </button>
          ))}
        </div>
      </div>

      {/* Map Content Body */}
      <div className="relative flex-1 bg-slate-50 overflow-hidden select-none">
        
        {/* SVG stylized outline background simulating Chennai layout */}
        <svg className="absolute inset-0 w-full h-full text-slate-200/50" xmlns="http://www.w3.org/2000/svg">
          {/* Main roads simulation */}
          <path d="M 0,250 Q 300,100 600,450 T 1000,200" fill="none" stroke="#E2E8F0" strokeWidth="6" />
          <path d="M 200,0 Q 400,200 450,550 T 800,600" fill="none" stroke="#E2E8F0" strokeWidth="4" />
          <path d="M 0,400 Q 500,250 1000,500" fill="none" stroke="#E2E8F0" strokeWidth="3" />
          
          {/* Cooum and Adyar River representations */}
          <path d="M 0,180 Q 200,160 400,220 T 700,120 T 1000,150" fill="none" stroke="#BAE6FD" strokeWidth="12" opacity="0.6" />
          <path d="M 0,480 Q 300,450 600,490 T 1000,420" fill="none" stroke="#BAE6FD" strokeWidth="16" opacity="0.6" />
          
          {/* Coastal line */}
          <path d="M 900,0 C 880,150 920,400 950,600" fill="none" stroke="#93C5FD" strokeWidth="20" opacity="0.4" />
          <text x="910" y="300" transform="rotate(85,910,300)" className="text-sm fill-blue-400 font-bold tracking-widest uppercase">Bay of Bengal</text>
        </svg>

        {/* Legend overlays */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold space-y-1.5 z-10">
          <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span><span className="text-slate-600">Pending / Escalated</span></div>
          <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span><span className="text-slate-600">In Progress</span></div>
          <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span><span className="text-slate-600">Resolved / Closed</span></div>
        </div>

        {/* Chennai Landmarks Labels */}
        <div className="absolute top-8 left-[15%] text-sm font-bold text-slate-400 uppercase tracking-wider">K.K. Nagar</div>
        <div className="absolute top-[28%] left-[45%] text-sm font-bold text-slate-400 uppercase tracking-wider">T. Nagar</div>
        <div className="absolute top-[35%] left-[75%] text-sm font-bold text-slate-400 uppercase tracking-wider">Mylapore</div>
        <div className="absolute bottom-[20%] left-[62%] text-sm font-bold text-slate-400 uppercase tracking-wider">Adyar</div>
        <div className="absolute bottom-[10%] left-[32%] text-sm font-bold text-slate-400 uppercase tracking-wider">Velachery</div>

        {/* Complaint Markers */}
        {filteredComplaints.map((c, index) => {
          const { x, y } = getCoordinatesPct(c.location.lat, c.location.lng);
          return (
            <div 
              key={c._id || index}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                onClick={() => setSelectedPin(selectedPin === c ? null : c)}
                className={`p-2.5 rounded-full border shadow-md flex items-center justify-center cursor-pointer transition transform hover:scale-125 ${getMarkerColor(c.status)}`}
              >
                {getMarkerIcon(c.status)}
              </button>

              {/* Pin Detail Popup overlay */}
              {selectedPin?._id === c._id && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-slate-400 block">{c.complaintId}</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      c.priority === 'High' || c.priority === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
                    }`}>
                      {c.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs mt-1 line-clamp-1">{c.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{c.description}</p>
                  <div className="mt-2.5 flex justify-between items-center text-sm border-t border-slate-100 pt-2 font-bold">
                    <span className="text-govBlue truncate max-w-[120px]">{c.location.address.split(',')[0]}</span>
                    <button 
                      onClick={() => onSelectComplaint(c._id)}
                      className="text-govGreen hover:underline flex items-center space-x-0.5"
                    >
                      <span>{t('details')}</span>
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveMap;
