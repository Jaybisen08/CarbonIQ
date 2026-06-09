import React, { useState } from 'react';
import { UserProfile } from '../types';
import { safeFetchJson } from '../utils/api';
import { Leaf, ArrowRight, Shield, RefreshCw, Key, Mail, User, MapPin, Briefcase } from 'lucide-react';

interface AuthProps {
  isDarkMode: boolean;
  onAuthSuccess: (userRecord: any) => void;
  onNavigateBack: () => void;
}

export default function Auth({
  isDarkMode,
  onAuthSuccess,
  onNavigateBack
}: AuthProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Dual-mode form inputs state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    occupation: 'Sustainability Lead'
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const targetUrl = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          password: formData.password, 
          profile: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            occupation: formData.occupation,
            isStudent: false,
            householdSize: 1,
            primaryTransport: 'Public',
            points: 450,
            badges: ['Green Core']
          } 
        };

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await safeFetchJson(response);

      onAuthSuccess({
        email: formData.email,
        profile: data.profile,
        calculations: data.calculations,
        goals: data.goals,
        challenges: data.challenges,
        recommendations: data.recommendations
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Connecting offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-center items-center p-4 ${isDarkMode ? 'bg-brand-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`} id="auth-panel">
      
      {/* Small back btn */}
      <button 
        onClick={onNavigateBack}
        className="absolute top-6 left-6 text-xs text-gray-400 hover:text-brand-primary flex items-center space-x-1 cursor-pointer transition-colors"
        id="btn-auth-back"
      >
        <span>&larr;</span>
        <span>Back to Landing</span>
      </button>

      <div className={`w-full max-w-lg p-8 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/40 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-xl'}`} id="auth-card">
        
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8" id="auth-brand">
          <div className="bg-brand-primary p-2.5 rounded-xl text-brand-dark-bg flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight text-brand-primary">CarbonIQ SaaS Core</h2>
          <p className="text-xs text-gray-400">Measure. Manage. Reduce. Decarbonize.</p>
        </div>

        {/* Tab Selection toggle */}
        <div className="grid grid-cols-2 bg-gray-500/10 p-1 rounded-xl mb-6 text-xs font-semibold" id="auth-tabs">
          <button 
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition-all ${isLogin ? 'bg-brand-primary text-brand-dark-bg font-bold' : 'text-gray-400'}`}
            id="tab-login"
          >
            Login Account
          </button>
          <button 
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition-all ${!isLogin ? 'bg-brand-primary text-brand-dark-bg font-bold' : 'text-gray-400'}`}
            id="tab-register"
          >
            Register Profile
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/15 text-red-400 p-3.5 rounded-xl text-xs font-mono text-center mb-6" id="auth-error-block">
            {errorMsg}
          </div>
        )}

        {/* Action Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4 text-left" id="form-auth-submit">
          
          {/* Email */}
          <div className="space-y-1" id="group-email">
            <label className="text-xs font-semibold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              <input 
                type="email"
                required
                placeholder="e.g., pilot@carboniq.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white focus:border-brand-primary' : 'bg-gray-50 border-gray-200 focus:border-brand-secondary'}`}
                id="input-auth-email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1" id="group-password">
            <label className="text-xs font-semibold uppercase tracking-wider block">Cryptographic Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white focus:border-brand-primary' : 'bg-gray-50 border-gray-200 focus:border-brand-secondary'}`}
                id="input-auth-password"
              />
            </div>
          </div>

          {/* Registration fields bundle */}
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-400/20" id="reg-fields-bundle">
              
              {/* First Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold block">First Name</label>
                <input 
                  type="text"
                  required
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none bg-transparent ${isDarkMode ? 'border-brand-dark-surface-sec' : ''}`}
                  id="reg-first-name"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold block">Last Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none bg-transparent ${isDarkMode ? 'border-brand-dark-surface-sec' : ''}`}
                  id="reg-last-name"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-xs font-semibold block">City Location</label>
                <input 
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none bg-transparent ${isDarkMode ? 'border-brand-dark-surface-sec' : ''}`}
                  id="reg-city"
                />
              </div>

              {/* Work field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold block">Occupation Field</label>
                <input 
                  type="text"
                  required
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none bg-transparent ${isDarkMode ? 'border-brand-dark-surface-sec' : ''}`}
                  id="reg-occupation"
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 cursor-pointer"
            id="btn-auth-submit"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            <span>{isLogin ? 'Login Dashboard Key' : 'Deploy Registered Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {isLogin && (
          <div className="text-center pt-4" id="default-credentials-helper">
            <p className="text-[10px] text-gray-500 leading-normal">
              <strong>Quick Tip:</strong> Click the "Try Demo" button on the Landing page or sign in using simulated profiles like <strong>sarah.chen@example.com</strong> (no password required).
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
