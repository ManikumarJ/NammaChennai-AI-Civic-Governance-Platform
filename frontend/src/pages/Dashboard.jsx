import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CitizenDashboard from './CitizenDashboard';
import CouncillorDashboard from './CouncillorDashboard';
import MlaDashboard from './MlaDashboard';
import ZonalDashboard from './ZonalDashboard';
import MayorDashboard from './MayorDashboard';
import CommissionerDashboard from './CommissionerDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchGrievances = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/complaints`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaints(res.data);
      } catch (err) {
        console.error('Failed to load grievances for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [token, navigate]);

  const handleSelectComplaint = (id) => {
    navigate(`/complaints/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">Loading secure dashboard console...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user.role === 'Citizen' && (
        <CitizenDashboard onSelectComplaint={handleSelectComplaint} />
      )}
      {user.role === 'Ward Councillor' && (
        <CouncillorDashboard 
          complaints={complaints} 
          onSelectComplaint={handleSelectComplaint} 
        />
      )}
      {user.role === 'MLA' && (
        <MlaDashboard />
      )}
      {user.role === 'Zonal Officer' && (
        <ZonalDashboard 
          complaints={complaints} 
          onSelectComplaint={handleSelectComplaint} 
        />
      )}
      {user.role === 'Mayor' && (
        <MayorDashboard 
          complaints={complaints} 
          onSelectComplaint={handleSelectComplaint} 
        />
      )}
      {user.role === 'Corporation Commissioner' && (
        <CommissionerDashboard />
      )}
      {user.role === 'Super Admin' && (
        <CommissionerDashboard />
      )}
    </div>
  );
};

export default Dashboard;
