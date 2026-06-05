import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, ShieldAlert, Award, AlertCircle, 
  MapPin, CheckCircle2, Star, TrendingUp, Users 
} from 'lucide-react';

const CommissionerDashboard = () => {
  const { t } = useLanguage();

  // Search Engine
  const [searchQuery, setSearchQuery] = useState('KK Nagar');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Public Scorecards List
  const [scorecards, setScorecards] = useState([]);
  const [scorecardsLoading, setScorecardsLoading] = useState(true);
  const [scorecardsError, setScorecardsError] = useState('');

  const executeSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    try {
      const token = localStorage.getItem('nc_token');
      const res = await axios.get(`${API_BASE_URL}/api/analytics/commissioner?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResult(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Search execution failed.');
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchScorecards = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics/scorecards`);
      setScorecards(res.data);
    } catch (err) {
      setScorecardsError('Failed to retrieve public scorecards.');
    } finally {
      setScorecardsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch('KK Nagar');
    fetchScorecards();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <span className="bg-blue-100 text-govBlue border border-blue-300 text-sm font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Corporation Commissioner Portal</span>
        <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
          Municipal Operations Command Console
        </h2>
        <p className="text-slate-500 text-base font-semibold mt-1">
          Perform cross-referenced query audits of wards, councillors, MLAs, and calculate transparency satisfaction indices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Commissioner Search Console */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
            Cross-Referenced Search Console
          </h3>

          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search KK Nagar, Adyar, Ward 121, etc..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="px-4 py-3 bg-govGreen hover:bg-govGreen-dark text-white rounded-xl font-bold shadow-sm text-xs transition"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchError && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-base font-semibold">
              {searchError}
            </div>
          )}

          {/* Search Results Display */}
          {searchResult && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200 flex-1">
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-sm text-slate-400 font-extrabold uppercase">Search Audit Target</span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{searchResult.searchTarget}</h4>
                </div>
                <div className="flex space-x-3 text-center">
                  <div>
                    <span className="text-sm text-slate-400 font-extrabold uppercase block">Performance</span>
                    <span className="text-sm font-extrabold text-govGreen block">{searchResult.performanceScore}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400 font-extrabold uppercase block">Transparency</span>
                    <span className="text-sm font-extrabold text-govBlue block">{searchResult.transparencyScore}%</span>
                  </div>
                </div>
              </div>

              {/* Stakeholder Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base font-semibold text-slate-500">
                <div>
                  <span className="text-sm text-slate-400 font-bold block uppercase">Ward Councillor</span>
                  <span className="text-slate-800 block mt-0.5">{searchResult.wardCouncillor}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-400 font-bold block uppercase">MLA Authority</span>
                  <span className="text-slate-800 block mt-0.5">{searchResult.mla}</span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-center">
                  <span className="text-sm text-slate-450 block font-bold uppercase">Total</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-0.5">{searchResult.totalComplaints}</span>
                </div>
                <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-center">
                  <span className="text-sm text-slate-455 block font-bold uppercase text-red-500">Pending</span>
                  <span className="text-base font-extrabold text-red-650 block mt-0.5">{searchResult.pending}</span>
                </div>
                <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-center">
                  <span className="text-sm text-slate-455 block font-bold uppercase text-emerald-500">Resolved</span>
                  <span className="text-base font-extrabold text-emerald-650 block mt-0.5">{searchResult.resolved}</span>
                </div>
              </div>

              {/* Resolution rate bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-sm font-bold text-slate-450">
                  <span className="uppercase">Resolution Rate</span>
                  <span className="text-govGreen">{searchResult.resolutionRate}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${searchResult.resolutionRate}%` }} 
                    className="h-full bg-govGreen rounded-full"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Public Scorecards List (All Wards) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[500px]">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
            Public Ward Scorecards
          </h3>
          
          <div className="overflow-y-auto flex-1 pr-1 mt-2">
            {scorecardsLoading ? (
              <div className="text-center py-12 text-slate-400 text-base font-semibold">
                Loading scorecards...
              </div>
            ) : scorecardsError ? (
              <div className="text-center py-6 text-red-600 text-xs font-semibold">
                {scorecardsError}
              </div>
            ) : (
              <div className="space-y-3">
                {scorecards.map((score, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800">{score.wardName}</span>
                      <div className="flex items-center space-x-1 text-sm font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Satisfaction: {score.satisfactionScore}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm text-slate-500">
                      <div>
                        <span className="block text-sm text-slate-400 uppercase font-bold">Total</span>
                        <span className="font-extrabold text-slate-700 block mt-0.5">{score.totalComplaints}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-slate-400 uppercase font-bold">Resolved</span>
                        <span className="font-extrabold text-emerald-600 block mt-0.5">{score.resolvedComplaints}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-slate-400 uppercase font-bold">Pending</span>
                        <span className="font-extrabold text-red-600 block mt-0.5">{score.pendingComplaints}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-slate-400 uppercase font-bold">Res. Time</span>
                        <span className="font-extrabold text-govBlue block mt-0.5">{score.avgResolutionTime} Days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CommissionerDashboard;
