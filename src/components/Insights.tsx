import React, { useState, useEffect } from 'react';
import { Recommendation, Goal } from '../types';
import { safeFetchJson } from '../utils/api';
import { Cpu, Leaf, BrainCircuit, ArrowRight, Zap, Target, Flame, Lightbulb, RefreshCw, Layers, Sparkles, Check } from 'lucide-react';

interface InsightsProps {
  userEmail: string;
  isDarkMode: boolean;
  recommendations: Recommendation[];
  onRecommendationsLoaded: (rects: Recommendation[]) => void;
  onAddGoal: (goalData: Omit<Goal, 'id' | 'completed' | 'currentValue'>) => Promise<void>;
  goals: Goal[];
}

export default function Insights({
  userEmail,
  isDarkMode,
  recommendations,
  onRecommendationsLoaded,
  onAddGoal,
  goals
}: InsightsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [claimStatus, setClaimStatus] = useState<Record<string, boolean>>({});

  // Trigger Gemini AI generate API call
  const generateAIInsights = async () => {
    setLoading(true);
    setErrorMsg('');
    setLoadingLogs([]);

    // Animated console log items to provide a highly premium SaaS loading feedback
    const logs = [
      'Establishing connection to CarbonIQ core server...',
      'Bundling verified carbon calculations history...',
      'Activating Gemini 3.5 Flash server grids...',
      'Running decarbonization accounting algorithms...',
      'Formulating actionable reduction targets...'
    ];

    let currentLogIdx = 0;
    const logInterval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setLoadingLogs((prev) => [...prev, logs[currentLogIdx]]);
        currentLogIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 450);

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await safeFetchJson(response);
      clearInterval(logInterval);

      onRecommendationsLoaded(data.recommendations);
    } catch (err: any) {
      setErrorMsg(err.message || 'Connecting failure');
    } finally {
      setLoading(false);
    }
  };

  // Convert an recommendation into a CarbonIQ Goal dynamically
  const handleTransitionToGoal = async (rec: Recommendation) => {
    setClaimStatus((prev) => ({ ...prev, [rec.id]: true }));
    try {
      const targetMonthsDeadline = new Date();
      targetMonthsDeadline.setMonth(targetMonthsDeadline.getMonth() + 3); // 3 months deadline standard
      const formattedDeadline = targetMonthsDeadline.toISOString().split('T')[0];

      await onAddGoal({
        title: rec.title,
        description: rec.description,
        category: rec.category,
        targetValue: Math.round(rec.co2Savings / 4), // Set nominal target 1/4th (monthly carbon savings)
        deadline: formattedDeadline
      });
    } catch (err) {
      console.error('Goal transition failed', err);
    } finally {
      // Keep showing checking status
    }
  };

  // Load baseline offline recommendations if empty initially
  useEffect(() => {
    if (recommendations.length === 0) {
      generateAIInsights();
    }
  }, []);

  return (
    <div className="space-y-8" id="insights-section">
      
      {/* Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="insights-heading">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-brand-primary" />
            <span>AI Insights & Strategy</span>
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
            Engage advanced language learning models to audit your emissions distribution and design personal decarbonization schedules.
          </p>
        </div>

        <button 
          onClick={generateAIInsights}
          disabled={loading}
          className="text-xs bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
          id="btn-re-generate"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate Recommendations</span>
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-mono text-center" id="insights-error">
          Exception: {errorMsg}
        </div>
      )}

      {/* Loading Console Simulation View */}
      {loading ? (
        <div className={`p-8 rounded-2xl border text-left font-mono space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-gray-100 border-gray-200'}`} id="insights-terminal-loader">
          <div className="flex items-center space-x-3" id="term-header">
            <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-brand-primary">AI_REDUCTION_ENGINE.SYS CLUSTER ACTIVE</span>
          </div>

          <div className="space-y-2 text-xs text-gray-400" id="term-logs">
            {loadingLogs.map((log, idx) => (
              <p key={idx} className="flex items-center space-x-2">
                <span className="text-brand-primary">&gt;</span>
                <span>{log}</span>
              </p>
            ))}
          </div>

          <div className="flex justify-center py-6" id="loading-spinner">
            <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
          </div>
        </div>
      ) : (
        /* Grid list of Recommendations cards */
        <div className="grid grid-cols-1 gap-6" id="recommendations-grid">
          {recommendations.map((rec) => {
            const isClaimed = goals.some((g) => g.title === rec.title) || claimStatus[rec.id];

            return (
              <div 
                key={rec.id}
                className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between gap-6 transition-all relative overflow-hidden group ${
                  isDarkMode 
                    ? 'bg-brand-dark-surface/30 border-brand-dark-surface hover:border-brand-primary/30' 
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                }`}
                id={`rec-card-${rec.id}`}
              >
                {/* Horizontal Category Pill Stripe */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary"></div>

                <div className="space-y-4 max-w-2xl" id="rec-contents">
                  <div className="flex flex-wrap items-center gap-2" id="rec-tags">
                    {/* Category Label */}
                    <span className="text-[10px] font-bold font-mono tracking-wider bg-brand-primary/10 text-brand-primary uppercase px-2.5 py-1 rounded-full">{rec.category}</span>
                    {/* Difficulty Badge */}
                    <span className={`text-[10px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-full uppercase ${
                      rec.difficulty === 'Easy' 
                        ? 'bg-green-500/10 text-green-400' 
                        : rec.difficulty === 'Medium' 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-red-500/10 text-red-400'
                    }`}>{rec.difficulty} Difficulty</span>
                  </div>

                  <div id="rec-title">
                    <h3 className="font-display font-semibold text-lg">{rec.title}</h3>
                    <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>{rec.description}</p>
                  </div>
                </div>

                {/* Score badge & Transition Action Button */}
                <div className="flex flex-row md:flex-col md:items-end md:justify-between items-center justify-between border-t md:border-t-0 border-gray-500/10 pt-4 md:pt-0 gap-4" id="rec-kpis">
                  
                  {/* CO2 Savings Grid Box */}
                  <div className="text-left md:text-right" id="savings-box">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Est. CO₂ Savings</p>
                    <p className="text-xl font-bold font-display text-brand-primary mt-0.5">{rec.co2Savings} <span className="text-xs font-mono text-gray-400">kg/yr</span></p>
                    {/* Impact Score */}
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Impact Factor: {rec.impactScore}/100</p>
                  </div>

                  {/* Transition triggers */}
                  <button
                    disabled={isClaimed}
                    onClick={() => handleTransitionToGoal(rec)}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                      isClaimed
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                        : 'bg-brand-primary hover:bg-brand-accent text-brand-dark-bg select-none shadow cursor-pointer'
                    }`}
                    id={`btn-claim-${rec.id}`}
                  >
                    {isClaimed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Goals</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-3.5 h-3.5" />
                        <span>Activate as Goal</span>
                      </>
                    )}
                  </button>
                  
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Insight Tips section */}
      {!loading && (
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface' : 'bg-gray-100 border-gray-200'}`} id="wisdom-container">
          <div className="flex space-x-3 items-center mb-3" id="wisdom-head">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-semibold text-base">CarbonIQ Decarbonization Wisdom</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Carbon offsets and reductions follow the <strong>GHG Protocol Corporate Standards</strong>. Real world mitigation is best executed sequentially: evaluate transportation configurations first (which constitutes up to 45% of average user weights), transition to renewable grid tariffs, optimize diets, and utilize recycling loops to lock in gains.
          </p>
        </div>
      )}

    </div>
  );
}
