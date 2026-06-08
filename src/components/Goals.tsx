import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, Trophy, Clock, Trash2, Plus, Calendar, AlertCircle, CheckCircle, Flame, Leaf, Zap, Utensils } from 'lucide-react';

interface GoalsProps {
  goals: Goal[];
  isDarkMode: boolean;
  onAddGoal: (goalData: Omit<Goal, 'id' | 'completed' | 'currentValue'>) => Promise<void>;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export default function Goals({
  goals,
  isDarkMode,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}: GoalsProps) {
  // Toggle addition form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Progress logging input state
  const [loggingGoalId, setLoggingGoalId] = useState<string | null>(null);
  const [logValue, setLogValue] = useState<number>(5);

  // New Goal parameters
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'transportation' as 'transportation' | 'electricity' | 'food' | 'lifestyle',
    targetValue: 50,
    deadline: '2026-09-30'
  });

  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.description) return;
    setLoading(true);
    try {
      await onAddGoal(newGoal);
      setNewGoal({
        title: '',
        description: '',
        category: 'transportation',
        targetValue: 50,
        deadline: '2026-09-30'
      });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogProgress = async (goal: Goal) => {
    if (!goal) return;
    const nextVal = Math.min(goal.targetValue, goal.currentValue + logValue);
    try {
      await onUpdateGoal(goal.id, {
        currentValue: nextVal,
        completed: nextVal >= goal.targetValue
      });
      setLoggingGoalId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  // Icon mapping helper
  const getCategoryIcon = (category: string) => {
    if (category === 'transportation') return Flame;
    if (category === 'electricity') return Zap;
    if (category === 'food') return Utensils;
    return Leaf;
  };

  return (
    <div className="space-y-8" id="goals-section">
      
      {/* Title & Activator Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-400/10 pb-4" id="goals-header">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center space-x-2">
            <Target className="w-6 h-6 text-brand-primary" />
            <span>Decarbonization Goals</span>
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
            Track committed carbon milestones. Meet target thresholds to earn environmental points and gold status badges.
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center space-x-1.5 self-start"
          id="btn-trigger-add-goal"
        >
          <Plus className="w-4 h-4" />
          <span>New Target Goal</span>
        </button>
      </div>

      {/* New Goal Creation Form State */}
      {showAddForm && (
        <form 
          onSubmit={handleAddGoalSubmit}
          className={`p-6 rounded-2xl border space-y-6 text-left ${isDarkMode ? 'bg-brand-dark-surface/40 border-brand-dark-surface' : 'bg-white border-gray-200'}`}
          id="form-add-goal"
        >
          <h3 className="font-display font-semibold text-base text-brand-primary">Setup Decarbonization Scheme Target</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="form-grid">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Goal Title</label>
              <input 
                type="text"
                required
                placeholder='e.g., Use Electric bike for work'
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="goal-title-input"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Carbon Sector Category</label>
              <select 
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="goal-category-select"
              >
                <option value="transportation">Transportation (Commuting & Travel)</option>
                <option value="electricity">Electricity Grid (Appliances & Lighting)</option>
                <option value="food">Diet & Nutrition (Food Scrap Compost)</option>
                <option value="lifestyle">Lifestyle & Recycling (Goods & Life spans)</option>
              </select>
            </div>

            {/* Target Value Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider">Target CO₂ Reduction (kg)</label>
                <span className="text-xs font-mono text-brand-primary font-bold">{newGoal.targetValue} kg CO₂</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500"
                step="5"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                className="w-full accent-brand-primary cursor-pointer h-1.5 bg-gray-500/20 rounded-full"
                id="goal-target-range"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Target Deadline</label>
              <input 
                type="date"
                required
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="goal-deadline-input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Methodology Description</label>
              <textarea 
                required
                rows={3}
                placeholder="Explain the technical action plan to hit this carbon reduction..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="goal-description-textarea"
              />
            </div>

          </div>

          <div className="flex justify-end space-x-3 pt-2" id="form-actions">
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold py-2.5 px-4 border rounded-lg hover:bg-gray-500/10 transition-all cursor-pointer"
              id="btn-cancel-goal"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-6 rounded-lg text-xs"
              id="btn-save-goal"
            >
              Confirm Setup
            </button>
          </div>
        </form>
      )}

      {/* Main Grid splitting Active and Completed Schemes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="goals-container">
        
        {/* Left Side: Active Reductions list (8 Columns) */}
        <div className="lg:col-span-8 space-y-6" id="active-goals-container">
          <h3 className="font-display font-semibold text-lg flex items-center space-x-2">
            <span>Commitments in Progress</span>
            <span className="text-xs bg-brand-primary/15 text-brand-primary font-mono px-2 py-0.5 rounded-full">{activeGoals.length} scheme(s)</span>
          </h3>

          {activeGoals.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="active-goals-empty">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">Zero Active Target Commitments</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Create specialized carbon goals above or grab one dynamically via the <strong>AI Insights</strong> Recommendations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" id="active-goals-list">
              {activeGoals.map((goal) => {
                const Icon = getCategoryIcon(goal.category);
                const pct = Math.round((goal.currentValue / goal.targetValue) * 100);
                const isLogging = loggingGoalId === goal.id;

                return (
                  <div 
                    key={goal.id}
                    className={`p-5 rounded-2xl border relative ${isDarkMode ? 'bg-brand-dark-surface/20 border-brand-dark-surface' : 'bg-white border-gray-100 shadow-sm'}`}
                    id={`active-goal-card-${goal.id}`}
                  >
                    <div className="flex justify-between items-start" id="goal-row">
                      <div className="flex space-x-3 items-start" id="goal-title-desc">
                        <div className="bg-brand-primary/10 text-brand-primary p-2 rounded-lg mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-sm">{goal.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{goal.description}</p>
                          
                          {/* Deadline indicator */}
                          <div className="flex items-center space-x-1.5 text-[10px] text-gray-400 font-mono mt-2" id="goal-dead">
                            <Clock className="w-3.5 h-3.5 text-brand-primary" />
                            <span>Deadline: {goal.deadline}</span>
                          </div>
                        </div>
                      </div>

                      {/* Goal deletion action */}
                      <button 
                        onClick={() => onDeleteGoal(goal.id)}
                        className={`p-2 rounded-lg hover:text-red-500 hover:bg-red-500/15 text-gray-400 transition-all`}
                        title="Delete carbon scheme"
                        id={`btn-del-goal-${goal.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress slider bar representation */}
                    <div className="mt-5 space-y-2" id="goal-progress-bar">
                      <div className="flex justify-between text-[11px] font-mono" id="goal-pct">
                        <span className="text-gray-400">Carbon offset achieved:</span>
                        <span className="font-bold text-brand-primary">{goal.currentValue} / {goal.targetValue} kg ({pct}%)</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full relative ${isDarkMode ? 'bg-brand-dark-surface' : 'bg-gray-100'}`} id="bar-track">
                        <div className="bg-brand-primary h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }}></div>
                      </div>
                    </div>

                    {/* Logging updates */}
                    <div className="mt-4 pt-4 border-t border-gray-400/10 flex flex-wrap gap-3 items-center justify-between" id="goal-logging">
                      {isLogging ? (
                        <div className="flex flex-wrap items-center gap-3 w-full" id="log-inputs">
                          <div className="flex items-center space-x-2 flex-grow" id="log-slider">
                            <span className="text-[11px] font-mono text-gray-400">Add progress:</span>
                            <input 
                              type="range" 
                              min="1" 
                              max="100" 
                              value={logValue} 
                              onChange={(e) => setLogValue(Number(e.target.value))}
                              className="accent-brand-primary cursor-pointer h-1 flex-grow"
                            />
                            <span className="text-xs font-bold text-brand-primary font-mono select-none">{logValue} kg CO₂</span>
                          </div>
                          
                          <div className="flex gap-2" id="log-actions">
                            <button onClick={() => setLoggingGoalId(null)} className="text-[10px] uppercase font-semibold px-2 py-1 rounded border">Cancel</button>
                            <button onClick={() => handleLogProgress(goal)} className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-brand-primary text-brand-dark-bg">Save</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setLoggingGoalId(goal.id); setLogValue(Math.max(5, Math.round(goal.targetValue / 10))); }}
                          className={`text-[10px] uppercase font-bold tracking-wider py-1.5 px-3 rounded-lg border flex items-center space-x-1 ${isDarkMode ? 'border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5' : 'border-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/5'}`}
                          id={`btn-log-${goal.id}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Log Progress</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Completed reduction achievements (4 Columns) */}
        <div className="lg:col-span-4 space-y-6" id="completed-goals-container">
          <h3 className="font-display font-semibold text-lg flex items-center space-x-2">
            <span>Milestones Secured</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded-full">{completedGoals.length}</span>
          </h3>

          {completedGoals.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="completed-goals-empty">
              <p className="text-xs text-gray-400">Zero secured carbon targets logged. Complete active schemes to claim medals and points.</p>
            </div>
          ) : (
            <div className="space-y-3" id="completed-goals-list">
              {completedGoals.map((goal) => {
                return (
                  <div 
                    key={goal.id} 
                    className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start space-x-3 relative overflow-hidden"
                    id={`completed-goal-card-${goal.id}`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-semibold text-xs text-emerald-400 line-through">{goal.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">{goal.description}</p>
                      
                      {/* points badge */}
                      <div className="flex items-center space-x-1.5 mt-2 bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] w-fit font-mono font-bold" id="goal-secured-badge">
                        <Trophy className="w-3 h-3" />
                        <span>Completed • +100 Points</span>
                      </div>
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
