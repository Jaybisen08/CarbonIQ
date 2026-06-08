import React, { useState } from 'react';
import { Challenge } from '../types';
import { Trophy, Clock, Target, CheckCircle2, ArrowRight, Lock, Play, Flame, Leaf, Zap, Utensils, Award } from 'lucide-react';

interface ChallengesProps {
  challenges: Challenge[];
  isDarkMode: boolean;
  onJoinChallenge: (challengeId: string) => Promise<void>;
  onLeaveChallenge: (challengeId: string) => Promise<void>;
  onCompleteChallenge: (challengeId: string) => Promise<void>;
}

export default function Challenges({
  challenges,
  isDarkMode,
  onJoinChallenge,
  onLeaveChallenge,
  onCompleteChallenge
}: ChallengesProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'join' | 'leave' | 'complete') => {
    setLoadingId(id);
    try {
      if (action === 'join') await onJoinChallenge(id);
      else if (action === 'leave') await onLeaveChallenge(id);
      else if (action === 'complete') await onCompleteChallenge(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const activeChallenges = challenges.filter((c) => c.joined && !c.completed);
  const completedChallenges = challenges.filter((c) => c.completed);
  const discoverChallenges = challenges.filter((c) => !c.joined && !c.completed);

  const getCategoryIcon = (category: string) => {
    if (category === 'transportation') return Flame;
    if (category === 'electricity') return Zap;
    if (category === 'food') return Utensils;
    return Leaf;
  };

  return (
    <div className="space-y-8" id="challenges-section">
      
      {/* Header */}
      <div className="border-b border-gray-400/10 pb-4" id="challenges-head">
        <h1 className="text-2xl font-bold font-display flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-brand-primary" />
          <span>SaaS Carbon Challenges</span>
        </h1>
        <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
          Join structural municipal carbon challenges. Complete challenges to accumulate points, boost your leaderboard rank, and secure specialized badges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="challenges-view-grid">
        
        {/* Left Side: active and open challenges (8 Columns) */}
        <div className="lg:col-span-8 space-y-6" id="challenges-active-col">
          
          {/* Active Campaigns list */}
          <div className="space-y-4" id="section-active-campaigns">
            <h3 className="font-display font-semibold text-lg flex items-center space-x-2">
              <span>Your Active Campaigns</span>
              <span className="text-xs bg-brand-primary/15 text-brand-primary font-mono px-2 py-0.5 rounded-full">{activeChallenges.length} Active</span>
            </h3>

            {activeChallenges.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border border-dashed border-gray-400/20 ${isDarkMode ? 'bg-brand-dark-surface/10 text-gray-400' : 'bg-gray-50 text-gray-500'}`} id="active-challenges-empty">
                <p className="text-xs">No active challenges launched. Select a campaign below to initiate tracking.</p>
              </div>
            ) : (
              <div className="space-y-4" id="active-challenges-cards">
                {activeChallenges.map((cell) => {
                  const Icon = getCategoryIcon(cell.category);
                  return (
                    <div 
                      key={cell.id} 
                      className={`p-6 rounded-2xl border relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-primary/20' : 'bg-white border-emerald-500/20 shadow-sm'}`}
                      id={`active-cell-${cell.id}`}
                    >
                      <div className="absolute top-0 left-0 w-1 bg-brand-primary h-full"></div>
                      
                      <div className="flex space-x-4 items-start" id="active-cell-details">
                        <div className="bg-brand-primary/10 text-brand-primary p-2.5 rounded-xl flex-shrink-0 mt-0.5">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm">{cell.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{cell.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 font-mono mt-3" id="active-cell-labels">
                            <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5 text-brand-primary" /> <span>Duration: {cell.duration}</span></span>
                            <span className="bg-brand-primary/10 text-brand-primary font-bold px-1.5 py-0.5 rounded">+{cell.points} pts reward</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 self-end md:self-auto flex-shrink-0" id="active-cell-actions">
                        <button 
                          onClick={() => handleAction(cell.id, 'leave')}
                          disabled={loadingId === cell.id}
                          className={`text-xs py-2 px-3.5 rounded-lg border font-semibold hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer`}
                          id={`leave-btn-${cell.id}`}
                        >
                          Leave
                        </button>
                        <button 
                          onClick={() => handleAction(cell.id, 'complete')}
                          disabled={loadingId === cell.id}
                          className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg text-xs font-bold py-2 px-4 rounded-lg shadow transition-all cursor-pointer flex items-center space-x-1"
                          id={`complete-btn-${cell.id}`}
                        >
                          <Award className="w-4 h-4" />
                          <span>Complete Campaign</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Discover Campaigns list */}
          <div className="space-y-4" id="section-discover-campaigns">
            <h3 className="font-display font-semibold text-lg">Active Municipal Climate Campaigns</h3>
            
            {discoverChallenges.length === 0 ? (
              <div className={`p-6 text-center rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface text-gray-400' : 'bg-white border-gray-200'}`} id="discover-challenges-empty">
                <p className="text-xs">All active municipal campaigns joined or completed. Check back weekly for fresh operations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="discover-challenges-list">
                {discoverChallenges.map((cell) => {
                  const Icon = getCategoryIcon(cell.category);
                  return (
                    <div 
                      key={cell.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface hover:border-brand-primary/20' : 'bg-white border-gray-100 hover:shadow-sm shadow-sm'}`}
                      id={`discover-cell-${cell.id}`}
                    >
                      <div className="space-y-4" id="discover-top">
                        <div className="flex justify-between items-start" id="discover-pill">
                          <span className="text-[10px] font-bold font-mono tracking-wider bg-brand-primary/10 text-brand-primary uppercase px-2 py-0.5 rounded-full">{cell.category}</span>
                          <span className="text-xs font-mono font-bold text-brand-primary flex items-center space-x-1">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>+{cell.points} pts</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-semibold text-sm flex items-center space-x-1.5">
                            <Icon className="w-4 h-4 text-brand-primary inline" />
                            <span>{cell.title}</span>
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 leading-normal">{cell.description}</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-gray-400/5 flex justify-between items-center" id="discover-bottom">
                        <span className="text-[10px] text-gray-500 font-mono flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /> <span>{cell.duration}</span></span>
                        <button 
                          onClick={() => handleAction(cell.id, 'join')}
                          disabled={loadingId === cell.id}
                          className={`text-xs font-semibold py-1.5 px-3.5 rounded-lg border transition-all ${isDarkMode ? 'border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5' : 'border-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/5'}`}
                          id={`join-btn-${cell.id}`}
                        >
                          Join Campaign
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: completed achievements records (4 Columns) */}
        <div className="lg:col-span-4 space-y-6" id="challenges-completed-col">
          <h3 className="font-display font-semibold text-lg flex items-center space-x-2">
            <span>Certifications Unlocked</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded-full">{completedChallenges.length} Complete</span>
          </h3>

          {completedChallenges.length === 0 ? (
            <div className={`p-6 text-center rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface text-gray-400' : 'bg-white border-gray-200'}`} id="completed-challenges-empty">
              <p className="text-xs">No active campaign certificates earned yet. Successfully close active trial weeks to unlock certificates.</p>
            </div>
          ) : (
            <div className="space-y-3" id="completed-challenges-list">
              {completedChallenges.map((cell) => {
                return (
                  <div 
                    key={cell.id} 
                    className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-2"
                    id={`completed-cell-${cell.id}`}
                  >
                    <div className="flex justify-between items-center" id="completed-row-head">
                      <span className="text-[10px] font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-400 uppercase px-2 py-0.5 rounded-full">{cell.category}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div>
                      <h4 className="font-display font-semibold text-xs text-brand-dark-text-sec line-through">{cell.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-normal">Successfully completed. Earned <strong>+{cell.points}</strong> CarbonIQ environmental credit tokens.</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
