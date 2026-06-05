import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, MapPin, Calendar, User, Shield, Info, 
  MessageSquare, FileText, Send, CheckCircle2, ChevronRight,
  Upload, Link as LinkIcon, X
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { user } = useSelector(state => state.auth);

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Translation toggle
  const [showTa, setShowTa] = useState(language === 'ta');

  // Add Comment Form
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Update Status Form
  const [statusInput, setStatusInput] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusImage, setStatusImage] = useState('');
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' or 'url'
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        setStatusImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchComplaintDetails = async () => {
    try {
      const token = localStorage.getItem('nc_token');
      const res = await axios.get(`${API_BASE_URL}/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaint(res.data.complaint);
      setComments(res.data.comments);
      setStatusInput(res.data.complaint.status);
    } catch (err) {
      setError('Failed to retrieve complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  useEffect(() => {
    setShowTa(language === 'ta');
  }, [language]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      const token = localStorage.getItem('nc_token');
      const res = await axios.post(`${API_BASE_URL}/api/complaints/${id}/comments`, {
        text: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch (err) {
      alert('Failed to post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('nc_token');
      const res = await axios.patch(`${API_BASE_URL}/api/complaints/${id}/status`, {
        status: statusInput,
        note: statusNote,
        image: statusImage || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Grievance status updated successfully!');
      setStatusNote('');
      setStatusImage('');
      fetchComplaintDetails(); // Refresh details and audit trail
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">Loading grievance detail...</span>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h3 className="text-xl font-bold text-red-600 mb-2">{error || 'Grievance not found.'}</h3>
        <Link to="/dashboard" className="text-govGreen hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Determine what language text to display
  const titleDisplay = showTa && complaint.aiAnalysis?.translations?.titleTa 
    ? complaint.aiAnalysis.translations.titleTa 
    : complaint.title;

  const descDisplay = showTa && complaint.aiAnalysis?.translations?.descTa 
    ? complaint.aiAnalysis.translations.descTa 
    : complaint.description;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Assigned': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Escalated': return 'bg-red-50 text-red-700 border-red-200';
      case 'Closed': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isOfficial = user && user.role !== 'Citizen';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-govGreen transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <button 
          onClick={() => setShowTa(!showTa)}
          className="text-xs font-bold px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-govBlue flex items-center space-x-1"
        >
          <span>Translate to:</span>
          <span className="font-extrabold text-govGreen">{showTa ? 'English' : 'தமிழ்'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Complaint Details and Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-govBlue uppercase tracking-wider">{complaint.complaintId}</span>
                <h1 className="text-xl font-bold text-slate-800 leading-snug">{titleDisplay}</h1>
              </div>
              <div className="flex space-x-2">
                <span className={`text-xs font-bold border px-3 py-1 rounded-full ${getStatusStyle(complaint.status)}`}>
                  {t(complaint.status.toLowerCase().replace(' ', ''))}
                </span>
                <span className="text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600 px-3 py-1 rounded-full">
                  {complaint.priority} Priority
                </span>
              </div>
            </div>

            {/* Meta Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-base font-semibold text-slate-500">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-govGreen" />
                <div>
                  <span className="block text-sm text-slate-400 font-bold uppercase tracking-wider">Location</span>
                  <span className="text-slate-700 truncate block max-w-[150px]">{complaint.location.address}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-govBlue" />
                <div>
                  <span className="block text-sm text-slate-400 font-bold uppercase tracking-wider">Reported Date</span>
                  <span className="text-slate-700 block">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                <User className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="block text-sm text-slate-400 font-bold uppercase tracking-wider">Reporter Name</span>
                  <span className="text-slate-700 block">{complaint.anonymous ? 'Anonymous' : complaint.citizen?.name}</span>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-2">
              <h3 className="font-bold text-base text-slate-400 uppercase tracking-wider">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">{descDisplay}</p>
            </div>

            {/* Work Completion / Citizen Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-bold text-base text-slate-400 uppercase tracking-wider">Uploaded Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.images.map((img, i) => (
                    <div key={i} className="h-28 rounded-xl overflow-hidden border border-slate-100">
                      <img 
                        src={img} 
                        alt="Complaint attachment" 
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => window.open(img, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Transparency Routing Analysis Box */}
            {complaint.aiAnalysis && (
              <div className="bg-govGreen/5 border border-govGreen/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-govGreen font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>AI Engine Routing Evaluation</span>
                </div>
                <p className="text-base text-slate-600 leading-normal italic">
                  " {complaint.aiAnalysis.summary} "
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm font-bold">
                  <div>
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-700 block mt-0.5">{complaint.aiAnalysis.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Officer:</span>
                    <span className="text-slate-700 block mt-0.5">{complaint.aiAnalysis.authority}</span>
                  </div>
                </div>
                {/* Escalation Path Breadcrumb */}
                {complaint.aiAnalysis.escalationPath && (
                  <div className="border-t border-govGreen/10 pt-2.5 mt-2.5">
                    <span className="text-sm text-slate-400 font-extrabold uppercase block mb-1">Escalation path</span>
                    <div className="flex flex-wrap items-center text-sm text-slate-500 font-bold gap-1">
                      {complaint.aiAnalysis.escalationPath.map((path, idx) => (
                        <React.Fragment key={idx}>
                          <span className={complaint.responsibleAuthority === path ? 'text-govGreen underline' : ''}>{path}</span>
                          {idx < complaint.aiAnalysis.escalationPath.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Comment Thread (Accountability directives) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-govBlue" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{t('comments')}</h3>
            </div>

            {/* Conversation list */}
            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-base font-semibold">
                  No discussion notes recorded yet.
                </div>
              ) : (
                comments.map((comm, index) => (
                  <div 
                    key={comm._id || index}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold ${
                      comm.isOfficial 
                        ? 'bg-amber-50/50 border-amber-200' 
                        : 'bg-slate-50 border-slate-150'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${comm.isOfficial ? 'text-amber-800' : 'text-slate-800'}`}>
                          {comm.user?.name}
                        </span>
                        {comm.isOfficial && (
                          <span className="bg-amber-100 text-amber-800 text-sm font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-250">
                            {comm.user?.role}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-400 font-medium">
                        {new Date(comm.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-normal">{comm.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input Form */}
            {user ? (
              <form onSubmit={handlePostComment} className="flex items-center space-x-2 border-t border-slate-100 pt-4">
                <input
                  type="text"
                  placeholder={isOfficial ? "Instruct ward office or comment explanation..." : "Ask councillor for progress updates..."}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={postingComment || !commentText.trim()}
                  className="p-3 bg-govGreen hover:bg-govGreen-dark text-white rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-slate-500 text-base font-semibold">
                  Please{' '}
                  <Link to="/login" className="text-govGreen font-bold hover:underline">
                    login
                  </Link>{' '}
                  to participate in this discussion and ask updates.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Timeline Audit Trail & Action Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Timeline Audit Trail component */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 relative">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-govGreen" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{t('timeline')}</h3>
            </div>

            <div className="relative pl-6 space-y-6">
              {/* Vertical line connector */}
              <div className="timeline-line"></div>

              {complaint.auditTrail?.map((audit, i) => (
                <div key={i} className="relative">
                  {/* Timeline circle node */}
                  <span className={`absolute -left-[27px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border ring-4 ring-white ${
                    audit.status === 'Resolved' || audit.status === 'Closed' 
                      ? 'bg-emerald-500 border-emerald-600'
                      : audit.status === 'Escalated'
                      ? 'bg-red-500 border-red-600 animate-pulse'
                      : 'bg-govBlue border-govBlue-dark'
                  }`} />
                  
                  <div className="text-xs font-bold">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="uppercase text-sm tracking-wide text-slate-800">{audit.status}</span>
                      <span className="text-sm text-slate-400 font-medium">{new Date(audit.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mt-1 leading-normal">
                      {audit.note}
                    </p>
                    {audit.updatedBy && (
                      <span className="text-sm text-slate-400 font-extrabold block mt-0.5">
                        BY: {audit.updatedBy.name} ({audit.updatedBy.role})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Resolution Box (Officials Only) */}
          {isOfficial && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-govGreen" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Status Action Drawer</h3>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                
                {/* State selector */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Update Grievance State</label>
                  <select
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Escalated">Escalate Upward</option>
                  </select>
                </div>

                {/* Resolution note */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Work Progression Note</label>
                  <textarea
                    placeholder="Add details about inspections, repair scheduling, or contractor orders..."
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                  />
                </div>

                 {/* Work completion image (mock base64 link or url) */}
                {statusInput === 'Resolved' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Completion Photo (Optional)</label>
                    
                    {/* Segmented Control */}
                    <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 space-x-1 mb-2.5 max-w-xs">
                      <button
                        type="button"
                        onClick={() => { setImageInputMode('upload'); setStatusImage(''); }}
                        className={`flex-1 py-1 rounded-lg text-sm font-extrabold transition flex items-center justify-center space-x-1 ${
                          imageInputMode === 'upload' ? 'bg-white text-govGreen shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImageInputMode('url'); setStatusImage(''); }}
                        className={`flex-1 py-1 rounded-lg text-sm font-extrabold transition flex items-center justify-center space-x-1 ${
                          imageInputMode === 'url' ? 'bg-white text-govGreen shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Image URL</span>
                      </button>
                    </div>

                    {imageInputMode === 'upload' ? (
                      <div className="relative">
                        {statusImage ? (
                          <div className="relative border border-slate-250 rounded-2xl p-2 bg-slate-50 flex items-center space-x-3 text-sm">
                            <img src={statusImage} alt="Resolution preview" className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-400 font-bold block uppercase tracking-wider">File Selected</p>
                              <span className="text-slate-700 font-semibold block truncate">Completion_Proof.png</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStatusImage('')}
                              className="p-1 rounded-full hover:bg-slate-200 text-slate-505 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-200 hover:border-govGreen/60 rounded-2xl p-4 bg-slate-50 hover:bg-govGreen/5 transition flex flex-col items-center justify-center cursor-pointer space-y-1.5 group">
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-govGreen transition" />
                            <span className="text-sm text-slate-650 font-bold">Choose a file to upload</span>
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
                          placeholder="Paste image link demonstrating resolved works..."
                          value={statusImage}
                          onChange={e => setStatusImage(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                        />
                        {statusImage && (
                          <div className="h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative max-w-xs">
                            <img
                              src={statusImage}
                              alt="Web URL preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="w-full text-white btn-green-grad py-3 rounded-xl font-bold text-xs shadow-md transition"
                >
                  {updatingStatus ? 'Updating status...' : 'Update Status'}
                </button>

              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ComplaintDetail;
