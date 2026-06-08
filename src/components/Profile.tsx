import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Award, Shield, MapPin, Briefcase, Calendar, RefreshCw } from 'lucide-react';

interface ProfileProps {
  userEmail: string;
  isDarkMode: boolean;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function Profile({
  userEmail,
  isDarkMode,
  profile,
  onUpdateProfile
}: ProfileProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    age: profile.age || 28,
    gender: profile.gender || 'Male',
    city: profile.city || '',
    state: profile.state || '',
    country: profile.country || '',
    occupation: profile.occupation || ''
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          profileUpdates: formData
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed.');
      }

      onUpdateProfile(data);
      setSuccessMsg('Profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection offline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" id="profile-section">
      
      {/* Title */}
      <div id="profile-head">
        <h1 className="text-2xl font-bold font-display">Personal Demographic Portfolio</h1>
        <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
          Update your location demographics and physical archetypes. These inputs coordinate calculated regional carbon grid multipliers.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-emerald-400 p-4 rounded-xl text-xs text-center" id="profile-success">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-center" id="profile-error">
          Exception: {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="profile-container">
        
        {/* Left Side: Demographic Inputs Form (8 Columns) */}
        <form 
          onSubmit={handleProfileSubmit}
          className={`lg:col-span-8 p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`}
          id="profile-form"
        >
          <h3 className="font-display font-semibold text-base text-brand-primary">Demographic Form Grid</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="profile-form-grid">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">First Name</label>
              <input 
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="input-first-name"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">Last Name</label>
              <input 
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="input-last-name"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">Age</label>
              <input 
                type="number"
                required
                min={1}
                max={120}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="input-age"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">Gender Profile</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="select-gender"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">City</label>
              <input 
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="input-city"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">State/Province</label>
              <input 
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="input-state"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">Country</label>
              <input 
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="input-country"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block">Occupation Field</label>
              <input 
                type="text"
                required
                placeholder="Product design, software engineering, etc..."
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="input-occupation"
              />
            </div>

          </div>

          <div className="flex justify-end pt-2" id="profile-btn">
            <button 
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-8 rounded-lg text-xs flex items-center space-x-1.5"
              id="btn-profile-submit"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Demographics Updates</span>
            </button>
          </div>
        </form>

        {/* Right Side: Badges list & points summary (4 Columns) */}
        <div className="lg:col-span-4 space-y-6" id="profile-badges-col">
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface' : 'bg-white border-gray-100 shadow-sm'}`} id="profile-milestones">
            <div className="flex items-center space-x-2 border-b border-gray-400/10 pb-3 mb-4" id="milestones-header">
              <Award className="w-5 h-5 text-brand-primary" />
              <h3 className="font-display font-semibold text-sm">Achievements Medals</h3>
            </div>

            {profile.badges && profile.badges.length > 0 ? (
              <div className="flex flex-col gap-3" id="profile-badges-list">
                {profile.badges.map((badge, bIdx) => (
                  <div key={bIdx} className="p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10 text-xs font-semibold text-brand-primary" id={`single-badge-${bIdx}`}>
                    {badge}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed">No achievements plaques accrued. Participate in environmental challenges to unlock credentials.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
