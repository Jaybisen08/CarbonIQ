import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { getLocalLeaderboard } from '../utils/localDb';
import { Trophy, Award, Shield, User, Search, RefreshCw, Flame, HelpCircle } from 'lucide-react';

interface LeaderboardProps {
  userEmail: string;
  isDarkMode: boolean;
  currentUserPoints: number;
}

export default function Leaderboard({
  userEmail,
  isDarkMode,
  currentUserPoints
}: LeaderboardProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const data = getLocalLeaderboard(userEmail);
      setBoard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, [userEmail, currentUserPoints]); // refresh standings when points change!

  const filteredBoard = board.filter((ent) => 
    ent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8" id="leaderboard-section">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-400/10 pb-4" id="board-head">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-brand-primary" />
            <span>Sovereign Standings</span>
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
            Audit real standings among modern environmental advocates. Accumulate points in weekly carbon campaigns to gain premium status medals.
          </p>
        </div>

        <button 
          onClick={fetchStandings}
          className="text-xs bg-gray-500/10 hover:bg-gray-500/20 py-2.5 px-4 border rounded-lg flex items-center space-x-1.5 transition-all self-start"
          id="btn-board-refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Standings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="board-container">
        
        {/* Left: Scoreboard standings list (8 columns) */}
        <div className="lg:col-span-8 space-y-4" id="standings-col">
          
          {/* Search Standings Input */}
          <div className="relative" id="board-search">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            <input 
              type="text" 
              placeholder="Search standing names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pl-10 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface focus:border-brand-primary' : 'bg-white border-gray-200 focus:border-brand-secondary'}`}
              id="input-board-search"
            />
          </div>

          {loading ? (
            <div className="py-24 text-center cursor-wait" id="board-loader">
              <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-mono">Fetching standings grid servers...</p>
            </div>
          ) : (
            <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'bg-brand-dark-surface/5 border-brand-dark-surface' : 'bg-white border-gray-100 shadow-sm'}`} id="table-board-container">
              <div className="overflow-x-auto" id="overflow-scroll">
                <table className="w-full border-collapse" id="table-standings">
                  <thead className={`text-xs font-semibold ${isDarkMode ? 'bg-brand-dark-surface/30' : 'bg-gray-50 text-gray-500'}`} id="table-thead">
                    <tr className="border-b border-gray-400/10">
                      <th className="p-4 text-left w-16 select-none">RANK</th>
                      <th className="p-4 text-left">CHAMPION NAME</th>
                      <th className="p-4 text-right">SUSTAINABILITY INDEX</th>
                      <th className="p-4 text-right">ACCUMULATED SCORE</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-400/10 text-xs" id="table-tbody">
                    {filteredBoard.map((ent, idx) => {
                      const isTopRank = ent.rank <= 3;
                      const rankColors = ent.rank === 1 
                        ? 'text-amber-400 font-bold' 
                        : ent.rank === 2 
                          ? 'text-gray-300 font-bold' 
                          : ent.rank === 3 
                            ? 'text-amber-600 font-bold' 
                            : 'text-gray-500';

                      return (
                        <tr 
                          key={idx}
                          className={`hover:bg-gray-500/5 transition-colors ${
                            ent.name.toLowerCase().includes('sarah') || ent.name.toLowerCase().includes('you')
                              ? 'bg-brand-primary/5 font-bold'
                              : ''
                          }`}
                          id={`tr-rank-${ent.rank}`}
                        >
                          {/* Rank */}
                          <td className="p-4 text-left">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono ${isTopRank ? 'bg-brand-primary/10' : ''} ${rankColors}`}>
                              {ent.rank}
                            </span>
                          </td>

                          {/* Avatar & Name */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-brand-primary/10 text-brand-primary w-8 h-8 rounded-full flex items-center justify-center font-bold uppercase select-none">
                                {ent.name.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                                  <span>{ent.name}</span>
                                  {ent.name.toLowerCase().includes('sarah') && (
                                    <span className="text-[9px] bg-brand-primary text-brand-dark-bg font-bold px-1.5 py-0.5 rounded uppercase">Your profile</span>
                                  )}
                                </p>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap gap-1 mt-1" id="badges-row">
                                  {ent.badges && ent.badges.slice(0, 2).map((bg, bIdx) => (
                                    <span key={bIdx} className="text-[9px] font-semibold bg-gray-500/10 text-gray-400 px-1 py-0.5 rounded">{bg}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Sustainability Index Column */}
                          <td className="p-4 text-right font-mono text-sm text-emerald-400 font-semibold select-none">
                            {ent.sustainabilityScore}/100
                          </td>

                          {/* Points Column */}
                          <td className="p-4 text-right">
                            <span className="font-bold text-brand-primary font-mono text-sm select-none">{ent.points.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-500 ml-1 font-mono">pts</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right: Badge definitions and status (4 columns) */}
        <div className="lg:col-span-4 space-y-6" id="badge-definitions-col">
          <div className={`p-6 rounded-2xl border text-left space-y-4 ${isDarkMode ? 'bg-brand-dark-surface/15 border-brand-dark-surface' : 'bg-white border-gray-100 shadow-sm'}`} id="badges-info">
            <div className="flex items-center space-x-2 border-b border-gray-400/10 pb-3" id="badges-info-header">
              <Shield className="w-5 h-5 text-brand-primary" />
              <h3 className="font-display font-semibold text-sm">CarbonIQ Status Tiers Guidance</h3>
            </div>

            <div className="space-y-4" id="badges-cards">
              <div className="flex items-start space-x-3" id="badge-c1">
                <div className="bg-amber-400/15 p-2 rounded text-amber-400 mt-0.5 font-bold text-xs uppercase font-display select-none">T1</div>
                <div>
                  <h4 className="font-semibold text-xs uppercase font-display">T1: Eco Titan</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">Requires &gt;2,000 points balance. Mapped for champions of direct longitudinal carbon savings.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3" id="badge-c2">
                <div className="bg-emerald-400/15 p-2 rounded text-emerald-400 mt-0.5 font-bold text-xs uppercase font-display select-none">T2</div>
                <div>
                  <h4 className="font-semibold text-xs uppercase font-display">T2: Green Commuter</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">Requires zero emission vehicle types matching calculations metrics histories.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3" id="badge-c3">
                <div className="bg-blue-400/15 p-2 rounded text-blue-400 mt-0.5 font-bold text-xs uppercase font-display select-none">T3</div>
                <div>
                  <h4 className="font-semibold text-xs uppercase font-display">T3: Renewable Pro</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">Granted upon toggling smart solar photovoltaic grids inside of audit calculator grids.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
