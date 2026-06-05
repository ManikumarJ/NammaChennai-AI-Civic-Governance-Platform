import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  MapPin, Plus, X, Globe, EyeOff, Navigation, Layers, Upload, Link as LinkIcon 
} from 'lucide-react';

const COLORS = ['#0D47A1', '#2E7D32', '#ED6C02', '#9C27B0', '#00BCD4', '#FFEB3B', '#F44336'];

const CitizenDashboard = ({ onSelectComplaint }) => {
  const { t } = useLanguage();
  const { user } = useSelector(state => state.auth);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create complaint modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road Damage');
  const [anonymous, setAnonymous] = useState(false);
  const [lat, setLat] = useState('13.0405'); // default KK Nagar
  const [lng, setLng] = useState('80.2012');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' or 'url'
  const [submitting, setSubmitting] = useState(false);
  const [duplicateComplaint, setDuplicateComplaint] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchCitizenDashboard = async () => {
    try {
      const token = localStorage.getItem('nc_token');
      const res = await axios.get(`${API_BASE_URL}/api/analytics/citizen`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      setError('Failed to fetch area analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenDashboard();
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
          setAddress(`Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          alert('Could not retrieve geolocation coordinates. Using Chennai default.');
        }
      );
    }
  };

  const handleCreateComplaint = async (e, isForced = false) => {
    if (e) e.preventDefault();
    if (!title || !description || !address) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('nc_token');
      await axios.post(`${API_BASE_URL}/api/complaints`, {
        title,
        description,
        category,
        images: imageUrl ? [imageUrl] : [],
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          address
        },
        anonymous,
        force: isForced
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Grievance registered successfully! AI routed categorization in progress.');
      setShowModal(false);
      setDuplicateComplaint(null);
      setTitle('');
      setDescription('');
      setAddress('');
      setImageUrl('');
      fetchCitizenDashboard();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.duplicate) {
        setDuplicateComplaint(err.response.data.duplicate);
      } else {
        alert(err.response?.data?.message || 'Failed to submit grievance.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">Loading citizen dashboard...</span>
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

  const { stats, recent, categoryData } = data;

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Intro Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-govGreen/10 text-govGreen text-sm font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Citizen Area Dashboard</span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
            Welcome back to {data.areaName}
          </h2>
          <p className="text-slate-500 text-base font-semibold mt-1">
            Ward {data.wardNumber} • Zone {data.zoneNumber} • Constituency: {user?.assemblyConstituency}
          </p>
        </div>
        
        <button
          onClick={() => { setDuplicateComplaint(null); setShowModal(true); }}
          className="flex items-center space-x-1.5 text-white btn-green-grad px-5 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition text-base"
        >
          <Plus className="w-4 h-4" />
          <span>{t('submitComplaint')}</span>
        </button>
      </div>

      {/* Grid of Counter stats */}
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
          <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('pending')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.pending}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl"><Layers className="w-6 h-6" /></div>
          <div>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider block">{t('inProgress')}</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-0.5">{stats.inProgress}</span>
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

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Area Complaints */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5">{t('recentComplaints')}</h3>
          <div className="divide-y divide-slate-100 flex-1">
            {recent.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-base font-semibold">
                No complaints submitted in your ward.
              </div>
            ) : (
              recent.map((c, i) => (
                <div 
                  key={c._id || i}
                  onClick={() => onSelectComplaint(c._id)}
                  className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 rounded-xl px-2 transition"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-extrabold text-govBlue">{c.complaintId}</span>
                    <h4 className="font-bold text-slate-800 text-xs line-clamp-1 mt-0.5">{c.title}</h4>
                    <span className="text-sm text-slate-400 font-semibold">{c.category} • {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${
                    c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Category Distribution Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[320px]">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3.5">{t('areaAnalytics')}</h3>
          <div className="w-full h-[220px] min-w-0 pt-3 relative">
            {categoryData.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-base font-semibold">
                No category data for analytics.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="95%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: 'sans-serif' }} layout="horizontal" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* CREATE COMPLAINT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">{t('submitComplaint')}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateComplaint ? (
              <div className="space-y-5 py-4">
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-slate-800 space-y-3">
                  <h4 className="font-extrabold text-amber-800 text-lg flex items-center space-x-2">
                    <span>⚠️ Similar Grievance Found Nearby</span>
                  </h4>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                    Namma Chennai AI detected an existing unresolved <strong>{duplicateComplaint.category}</strong> complaint reported within 150 meters of your selected location.
                  </p>
                  
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 mt-2">
                    <span className="text-xs font-extrabold text-govBlue uppercase tracking-wider block">{duplicateComplaint.complaintId}</span>
                    <h5 className="font-bold text-slate-800 text-base">{duplicateComplaint.title}</h5>
                    <p className="text-xs text-slate-505 line-clamp-2">{duplicateComplaint.description}</p>
                    <span className="text-xs text-slate-400 font-bold block mt-1">📍 {duplicateComplaint.location?.address}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      onSelectComplaint(duplicateComplaint._id);
                      setDuplicateComplaint(null);
                    }}
                    className="flex-1 py-3.5 bg-govGreen text-white rounded-xl font-bold hover:bg-govGreen-dark transition text-sm text-center shadow-md cursor-pointer"
                  >
                    View & Support Existing Issue
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateComplaint(null, true)}
                    className="flex-1 py-3.5 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition text-sm text-center cursor-pointer"
                  >
                    File New Complaint Anyway
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setDuplicateComplaint(null)}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold mt-2 block hover:underline cursor-pointer"
                >
                  Go back and edit details
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs font-semibold">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider">Grievance Title</label>
                <input
                  type="text"
                  placeholder="Provide a concise title (e.g., Potholes on 12th Sector Road)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-base focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  placeholder="Describe the complaint details. AI will automatically extract department routing and escalation levels..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-base focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider">Manual Category Suggestion</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                >
                  <option value="Garbage Collection">Garbage Collection</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Street Light">Street Light</option>
                  <option value="Water Leakage">Water Leakage</option>
                  <option value="Drainage Issue">Drainage Issue</option>
                  <option value="Public Health">Public Health</option>
                  <option value="Government School Issue">Government School Issue</option>
                  <option value="Government Hospital Issue">Government Hospital Issue</option>
                  <option value="Encroachment">Encroachment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Photo attachment selector */}
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block">Grievance Photo (Optional)</label>
                
                {/* Segmented Control */}
                <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 space-x-1 mb-2.5 max-w-xs">
                  <button
                    type="button"
                    onClick={() => { setImageInputMode('upload'); setImageUrl(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-extrabold transition flex items-center justify-center space-x-1 ${
                      imageInputMode === 'upload' ? 'bg-white text-govGreen shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setImageInputMode('url'); setImageUrl(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-extrabold transition flex items-center justify-center space-x-1 ${
                      imageInputMode === 'url' ? 'bg-white text-govGreen shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                </div>

                {imageInputMode === 'upload' ? (
                  <div className="relative">
                    {imageUrl ? (
                      <div className="relative border border-slate-200 rounded-2xl p-2.5 bg-slate-50 flex items-center space-x-4">
                        <img src={imageUrl} alt="Uploaded preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-400 font-bold block uppercase tracking-wider">File Selected</p>
                          <span className="text-slate-700 text-xs font-semibold block truncate">Grievance_Attachment.png</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-505 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-govGreen/60 rounded-2xl p-6 bg-slate-50 hover:bg-govGreen/5 transition flex flex-col items-center justify-center cursor-pointer space-y-2 group">
                        <Upload className="w-8 h-8 text-slate-450 group-hover:text-govGreen transition" />
                        <span className="text-base text-slate-600 font-bold">Choose a file to upload</span>
                        <span className="text-sm text-slate-400">Supports PNG, JPG, GIF</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Paste a photo web link (e.g. https://example.com/pothole.jpg)"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-base focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                    />
                    {imageUrl && (
                      <div className="h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative max-w-xs">
                        <img
                          src={imageUrl}
                          alt="Web URL preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Google Maps / Geolocation mock selectors */}
              <div className="bg-slate-50 rounded-2xl border border-slate-150 p-4 space-y-3.5">
                <div className="flex justify-between items-center text-govBlue font-bold">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-govGreen" />
                    <span>Location Coordinates (Google Maps Geotag)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="flex items-center space-x-1 text-govGreen hover:underline transition"
                  >
                    <Navigation className="w-3.5 h-3.5 animate-pulse" />
                    <span>Auto Detect</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-slate-400">Latitude</span>
                    <input 
                      type="number" 
                      step="0.0001" 
                      value={lat} 
                      onChange={e => setLat(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-slate-400">Longitude</span>
                    <input 
                      type="number" 
                      step="0.0001" 
                      value={lng} 
                      onChange={e => setLng(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-slate-400">Street / Local Address</span>
                  <input
                    type="text"
                    placeholder="e.g. 12th Sector Road, KK Nagar, Chennai"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                    required
                  />
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center space-x-2 border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                <input
                  type="checkbox"
                  id="anon-check"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                  className="rounded border-slate-350 text-govGreen focus:ring-govGreen/40 w-4.5 h-4.5 cursor-pointer"
                />
                <label htmlFor="anon-check" className="text-slate-600 cursor-pointer flex items-center space-x-1">
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  <span>Report Anonymously (Hides your identity from the public feed)</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-bold transition text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-white btn-green-grad rounded-xl font-bold shadow transition text-base"
                >
                  {submitting ? 'Analyzing and Submitting...' : 'File Grievance'}
                </button>
              </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default CitizenDashboard;
