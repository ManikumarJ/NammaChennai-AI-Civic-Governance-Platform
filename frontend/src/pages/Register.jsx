import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/authSlice';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Phone, Lock, UserPlus, MapPin, Grid, Layers, Milestone } from 'lucide-react';

const CHENNAI_AREAS = [
  { area: 'KK Nagar', ward: 121, zone: 10, constituency: 'Virugambakkam' },
  { area: 'T. Nagar', ward: 130, zone: 10, constituency: 'T. Nagar' },
  { area: 'Mylapore', ward: 125, zone: 9, constituency: 'Mylapore' },
  { area: 'Adyar', ward: 175, zone: 13, constituency: 'Velachery' },
  { area: 'Velachery', ward: 178, zone: 13, constituency: 'Velachery' },
  { area: 'Custom', ward: '', zone: '', constituency: '' }
];

const getZoneForWard = (wardStr) => {
  const ward = parseInt(wardStr, 10);
  if (isNaN(ward) || ward < 1 || ward > 200) return null;

  if (ward >= 1 && ward <= 14) return { zone: 1, name: 'Thiruvottiyur' };
  if (ward >= 15 && ward <= 21) return { zone: 2, name: 'Manali' };
  if (ward >= 22 && ward <= 33) return { zone: 3, name: 'Madhavaram' };
  if (ward >= 34 && ward <= 48) return { zone: 4, name: 'Tondiarpet' };
  if (ward >= 49 && ward <= 63) return { zone: 5, name: 'Royapuram' };
  if (ward >= 64 && ward <= 78) return { zone: 6, name: 'Thiru-Vi-Ka Nagar' };
  if (ward >= 79 && ward <= 93) return { zone: 7, name: 'Ambattur' };
  if (ward >= 94 && ward <= 108) return { zone: 8, name: 'Anna Nagar' };
  if (ward >= 109 && ward <= 126) return { zone: 9, name: 'Teynampet' };
  if (ward >= 127 && ward <= 142) return { zone: 10, name: 'Kodambakkam' };
  if (ward >= 143 && ward <= 155) return { zone: 11, name: 'Valasaravakkam' };
  if (ward >= 156 && ward <= 167) return { zone: 12, name: 'Alandur' };
  if (ward === 168 || ward === 169 || (ward >= 183 && ward <= 191)) return { zone: 14, name: 'Perungudi' };
  if (ward >= 170 && ward <= 182) return { zone: 13, name: 'Adyar' };
  if (ward >= 192 && ward <= 200) return { zone: 15, name: 'Sholinganallur' };

  return null;
};

const getZoneName = (zoneNum) => {
  const zone = parseInt(zoneNum, 10);
  switch (zone) {
    case 1: return 'Thiruvottiyur';
    case 2: return 'Manali';
    case 3: return 'Madhavaram';
    case 4: return 'Tondiarpet';
    case 5: return 'Royapuram';
    case 6: return 'Thiru-Vi-Ka Nagar';
    case 7: return 'Ambattur';
    case 8: return 'Anna Nagar';
    case 9: return 'Teynampet';
    case 10: return 'Kodambakkam';
    case 11: return 'Valasaravakkam';
    case 12: return 'Alandur';
    case 13: return 'Adyar';
    case 14: return 'Perungudi';
    case 15: return 'Sholinganallur';
    default: return '';
  }
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [areaOption, setAreaOption] = useState(CHENNAI_AREAS[0].area);
  const [customArea, setCustomArea] = useState('');
  const [ward, setWard] = useState(CHENNAI_AREAS[0].ward.toString());
  const [zone, setZone] = useState(CHENNAI_AREAS[0].zone.toString());
  const [assemblyConstituency, setAssemblyConstituency] = useState(CHENNAI_AREAS[0].constituency);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-populate Ward / Zone when Area is selected
  const handleAreaChange = (e) => {
    const selectedAreaName = e.target.value;
    setAreaOption(selectedAreaName);
    
    const matched = CHENNAI_AREAS.find(a => a.area === selectedAreaName);
    if (matched && selectedAreaName !== 'Custom') {
      setWard(matched.ward.toString());
      setZone(matched.zone.toString());
      setAssemblyConstituency(matched.constituency);
    } else {
      setWard('');
      setZone('');
      setAssemblyConstituency('');
    }
  };

  const handleWardChange = (e) => {
    const val = e.target.value;
    setWard(val);
    
    if (areaOption === 'Custom') {
      const matchedZone = getZoneForWard(val);
      if (matchedZone) {
        setZone(matchedZone.zone.toString());
      } else {
        setZone('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const activeArea = areaOption === 'Custom' ? customArea : areaOption;

    if (!name || !email || !phone || !password || !activeArea || !ward || !zone || !assemblyConstituency) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (areaOption === 'Custom') {
      const wardNum = parseInt(ward, 10);
      if (isNaN(wardNum) || wardNum < 1 || wardNum > 200) {
        setError('Ward Number must be a valid number between 1 and 200.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        phone,
        password,
        area: activeArea,
        ward,
        zone,
        assemblyConstituency,
        role: 'Citizen'
      });

      dispatch(setCredentials(res.data));
      alert('Registration successful! A mock verification email has been simulated. Check backend logs for SMTP details.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-govGreen/5 rounded-full filter blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-govBlue/5 rounded-full filter blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-md">
        
        <div className="text-center mb-6">
          <span className="bg-govGreen/10 text-govGreen text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">Citizen Sign Up</span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{t('register')}</h2>
          <p className="text-slate-500 text-base mt-1">Submit your details to automatically configure your local area dashboard.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-base font-semibold mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* General Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Karthik Raja"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="karthik@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                />
              </div>
            </div>

          </div>

          <hr className="border-slate-100 my-4" />

          {/* Chennai Civic Boundaries Section */}
          <div className="bg-slate-50 rounded-2xl border border-slate-150 p-4 space-y-4">
            
            <div className="flex items-center space-x-2 text-govBlue font-bold text-xs uppercase tracking-wide">
              <MapPin className="w-4 h-4 text-govGreen" />
              <span>Chennai Civic Boundaries</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Area Name Dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Area</label>
                <select
                  value={areaOption}
                  onChange={handleAreaChange}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                >
                  {CHENNAI_AREAS.map(a => (
                    <option key={a.area} value={a.area}>{a.area === 'Custom' ? 'Other (Manual Entry)' : a.area}</option>
                  ))}
                </select>
              </div>

              {/* Custom Area manual input if Custom selected */}
              {areaOption === 'Custom' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Type Custom Area Name</label>
                  <input
                    type="text"
                    placeholder="Adyar / Perungudi"
                    value={customArea}
                    onChange={e => setCustomArea(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                  />
                </div>
              )}

              {/* Ward Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ward Number</label>
                <div className="relative">
                  <Grid className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="number"
                    placeholder="121"
                    value={ward}
                    disabled={areaOption !== 'Custom'}
                    onChange={handleWardChange}
                    className="w-full bg-slate-50 disabled:opacity-75 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Zone Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Zone Number</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Auto-calculated"
                    value={
                      zone ? `${zone} (${getZoneName(zone)})` : ''
                    }
                    disabled={true}
                    className="w-full bg-slate-50 opacity-80 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 transition"
                  />
                </div>
              </div>

              {/* Assembly Constituency */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Assembly Constituency</label>
                <div className="relative">
                  <Milestone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Virugambakkam"
                    value={assemblyConstituency}
                    disabled={areaOption !== 'Custom'}
                    onChange={e => setAssemblyConstituency(e.target.value)}
                    className="w-full bg-slate-50 disabled:opacity-75 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-govGreen/40 focus:bg-white transition"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 text-white btn-green-grad font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-base mt-6"
          >
            {loading ? (
              <span>Registering...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t('register')}</span>
              </>
            )}
          </button>

        </form>

        {/* Login Redirect */}
        <div className="mt-6 text-center text-base font-semibold text-slate-500 border-t border-slate-100 pt-6">
          Already registered?{' '}
          <Link to="/login" className="text-govGreen hover:underline font-bold">
            {t('login')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
