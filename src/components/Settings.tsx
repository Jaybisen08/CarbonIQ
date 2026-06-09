import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, RefreshCw, Sun, Moon, Info, Key, Database } from 'lucide-react';
import { safeFetchJson } from '../utils/api';

interface SettingsProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userEmail: string;
}

export default function Settings({
  isDarkMode,
  onToggleTheme,
  userEmail
}: SettingsProps) {
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  
  const handleResetDatabaseSim = async () => {
    if (confirm('Are you absolutely sure you want to reset all simulation data for this account? This will reset calculations, goals, and challenges.')) {
      setResetting(true);
      setMsg(null);
      try {
        const response = await fetch('/api/auth/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
        const data = await safeFetchJson(response);
        if (data.success) {
          setMsg({ text: 'Database reset successful! Reloading application session...', error: false });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setMsg({ text: data.error || 'Failed to reset database.', error: true });
        }
      } catch (err: any) {
        console.error(err);
        setMsg({ text: err.message || 'Unable to communicate with the server to wipe simulation logs.', error: true });
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" id="settings-section">
      
      {/* Title */}
      <div id="settings-head">
        <h1 className="text-2xl font-bold font-display flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-brand-primary" />
          <span>Account Settings & Configurations</span>
        </h1>
        <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
          Edit client settings presets, tweak cryptographic identifiers, and manage state registries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="settings-grid">
        
        {/* Panel 1: Theme and Sourcing UI Preferences */}
        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="preferences-panel">
          <h3 className="font-display font-semibold text-base">Visual Customization</h3>

          <div className="flex items-center justify-between" id="row-theme">
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider">Application Theme Mode</h4>
              <p className="text-xs text-gray-400 mt-1">Select the color interface mode: Twilight Dark canvas or off-white Light shade.</p>
            </div>
            <button 
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'border-brand-dark-surface-sec hover:bg-brand-dark-surface-sec' : 'hover:bg-gray-100'}`}
              title="Toggle System Theme"
              id="btn-settings-toggle-theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>

          <div className="flex items-center justify-between" id="row-[CO2-region]">
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider">Carbon Grid Presets</h4>
              <p className="text-xs text-gray-400 mt-1">EPA eGRID regional coefficients multipliers.</p>
            </div>
            <select className={`p-2 rounded-lg border text-xs outline-none bg-transparent ${isDarkMode ? 'border-brand-dark-surface' : ''}`} id="select-grid-preset">
              <option value="US_average" className="dark:bg-brand-dark-bg">United States Average</option>
              <option value="EU_average" className="dark:bg-brand-dark-bg">European Union Green Core</option>
              <option value="APAC_coal_reliant" className="dark:bg-brand-dark-bg">Asia Pacific Coal Sourced</option>
            </select>
          </div>
        </div>

        {/* Panel 2: Secure credentials / Database cleanup */}
        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="security-panel">
          <h3 className="font-display font-semibold text-base">Credentials & Storage</h3>

          <div className="space-y-4" id="cred-items">
            <div className="flex items-start space-x-3 text-xs" id="item-sec">
              <Key className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Cryptographic Subject Hash Identifier</p>
                <p className="text-[10px] text-gray-500 font-mono select-all break-all mt-1">{userEmail || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs" id="item-db">
              <Database className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Local JSON Server Registry</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Emulates structural PostgreSQL tables using JSON local persistence.</p>
                
                <button 
                  onClick={handleResetDatabaseSim}
                  disabled={resetting}
                  className={`bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 text-[10px] font-semibold py-1.5 px-3 rounded-lg mt-3 flex items-center space-x-1 transition-colors ${resetting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  id="btn-settings-reset-db"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                  <span>{resetting ? 'Resetting...' : 'Reset Account Data'}</span>
                </button>

                {msg && (
                  <p className={`text-[11px] mt-2 font-medium ${msg.error ? 'text-red-400' : 'text-emerald-500'}`}>
                    {msg.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
