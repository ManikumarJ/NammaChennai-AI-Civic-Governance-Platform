import React, { useState } from 'react';
import { Users, AlertCircle, MapPin, Calendar, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CATEGORIES = [
  'All',
  'Garbage Collection',
  'Road Damage',
  'Street Light',
  'Water Leakage',
  'Drainage Issue',
  'Public Health',
  'Government School Issue',
  'Government Hospital Issue',
  'Encroachment',
  'Other'
];

const PublicFeed = ({ complaints, setComplaints, onSelectComplaint }) => {
  const { t, language } = useLanguage();
  const { user } = useSelector(state => state.auth);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [votingId, setVotingId] = useState(null);

  // Upvote complaint: "I Am Also Affected"
  const handleAffectedVote = async (e, id) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to report that you are affected by this issue.');
      return;
    }
    if (user.role !== 'Citizen') {
      alert('Only registered citizens can vote on public grievances.');
      return;
    }
    
    setVotingId(id);
    try {
      const token = localStorage.getItem('nc_token');
      const res = await axios.post(`http://localhost:5000/api/complaints/${id}/affected`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state count
      setComplaints(prev => prev.map(c => {
        if (c._id === id) {
          return { 
            ...c, 
            affectedCount: res.data.affectedCount,
            affectedCitizens: [...(c.affectedCitizens || []), user.id]
          };
        }
        return c;
      }));
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update support count.');
    } finally {
      setVotingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Escalated':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'Closed':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Low':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Filter complaints based on categories and search query
  const filteredComplaints = complaints.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    
    // Choose appropriate bilingual text
    const titleText = language === 'ta' && c.aiAnalysis?.translations?.titleTa 
      ? c.aiAnalysis.translations.titleTa 
      : c.title;

    const descText = language === 'ta' && c.aiAnalysis?.translations?.descTa
      ? c.aiAnalysis.translations.descTa
      : c.description;

    const matchesSearch = 
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Category Horizontal Filter List */}
      <div className="flex space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${
              selectedCategory === cat
                ? 'bg-govGreen text-white border-govGreen shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'All' ? 'All Issues' : cat}
          </button>
        ))}
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-govGreen/40 shadow-sm"
        />
      </div>

      {/* Complaint List Grid */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">{t('noComplaints')}</h3>
          </div>
        ) : (
          filteredComplaints.map((c, index) => {
            // Render translated title and description
            const titleDisplay = language === 'ta' && c.aiAnalysis?.translations?.titleTa 
              ? c.aiAnalysis.translations.titleTa 
              : c.title;

            const descDisplay = language === 'ta' && c.aiAnalysis?.translations?.descTa 
              ? c.aiAnalysis.translations.descTa 
              : c.description;

            const hasVoted = user && c.affectedCitizens?.includes(user.id);

            return (
              <div
                key={c._id || index}
                onClick={() => onSelectComplaint(c._id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm glow-card cursor-pointer flex flex-col md:flex-row md:items-start md:space-x-5"
              >
                
                {/* Image Preview or Category Emblem */}
                <div className="w-full md:w-36 h-28 bg-slate-100 rounded-xl overflow-hidden mb-4 md:mb-0 flex-shrink-0 flex items-center justify-center border border-slate-100">
                  {c.images && c.images.length > 0 ? (
                    <img
                      src={c.images[0]}
                      alt="Complaint preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-govBlue/60 font-bold text-center p-2 text-xs flex flex-col items-center">
                      <MapPin className="w-6 h-6 text-govBlue mb-1" />
                      <span>{c.category}</span>
                    </div>
                  )}
                </div>

                {/* Complaint Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-extrabold text-govBlue tracking-wider">{c.complaintId}</span>
                    <span className={`text-sm font-bold border px-2.5 py-0.5 rounded-full ${getStatusBadge(c.status)}`}>
                      {t(c.status.toLowerCase().replace(' ', ''))}
                    </span>
                    <span className={`text-sm font-bold border px-2.5 py-0.5 rounded-full ${getPriorityBadge(c.priority)}`}>
                      {c.priority}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mb-1.5 line-clamp-1">{titleDisplay}</h3>
                  <p className="text-slate-500 text-base line-clamp-2 leading-relaxed mb-3.5">{descDisplay}</p>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-bold text-slate-400 border-t border-slate-50 pt-3">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-govGreen" />
                      <span className="text-slate-600 truncate max-w-[150px]">{c.location.address.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-govBlue" />
                      <span className="text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-govGreen bg-govGreen/5 px-2 py-0.5 rounded-md border border-govGreen/10">
                      <Users className="w-3.5 h-3.5" />
                      <span>{c.affectedCount} {t('affectedCountText')}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement CTA */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center border-t border-slate-100 md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0 flex-shrink-0 md:pl-4 md:border-l border-slate-100">
                  {user && user.role === 'Citizen' && (
                    <button
                      onClick={(e) => handleAffectedVote(e, c._id)}
                      disabled={hasVoted || votingId === c._id}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        hasVoted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-govGreen border-govGreen hover:bg-govGreen hover:text-white'
                      }`}
                    >
                      {votingId === c._id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : hasVoted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Users className="w-3.5 h-3.5" />
                      )}
                      <span>{hasVoted ? 'Registered Affected' : t('affectedBtn')}</span>
                    </button>
                  )}
                  
                  <button className="text-govBlue hover:text-govBlue-dark font-bold text-xs flex items-center space-x-1 mt-2.5">
                    <span>{t('details')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default PublicFeed;
