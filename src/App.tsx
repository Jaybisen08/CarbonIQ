import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CarbonCalculator from './components/CarbonCalculator';
import Insights from './components/Insights';
import Goals from './components/Goals';
import Challenges from './components/Challenges';
import Leaderboard from './components/Leaderboard';
import History from './components/History';
import Profile from './components/Profile';
import Settings from './components/Settings';
import { generateCarbonReport } from './utils/pdfGenerator';
import { EmissionsBreakdown, UserProfile, Goal, Challenge, Recommendation } from './types';
import { 
  Leaf, BarChart3, Cpu, Target, Trophy, Clock, User, 
  Settings as SettingsIcon, LogOut, Menu, X, Shield, RefreshCw 
} from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to twilight dark!
  });

  // Application routing views: 'landing' | 'auth' | 'dashboard' | 'calculator' | 'insights' | 'goals' | 'challenges' | 'leaderboard' | 'history' | 'profile' | 'settings'
  const [activeView, setActiveView] = useState<string>(() => {
    const savedUser = localStorage.getItem('authenticated_user');
    return savedUser ? 'dashboard' : 'landing';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    profile: UserProfile;
    calculations: EmissionsBreakdown[];
    goals: Goal[];
    challenges: Challenge[];
    recommendations: Recommendation[];
  } | null>(() => {
    const saved = localStorage.getItem('authenticated_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync theme
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle successful login or profile deployment
  const handleAuthSuccess = (session: any) => {
    setCurrentUser(session);
    localStorage.setItem('authenticated_user', JSON.stringify(session));
    setActiveView('dashboard');
  };

  // Launch live mock/demo profile directly from public landing page
  const handleTryDemo = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@carboniq.com', password: '' })
      });
      const data = await response.json();
      if (response.ok) {
        handleAuthSuccess({
          email: 'demo@carboniq.com',
          profile: data.profile,
          calculations: data.calculations,
          goals: data.goals,
          challenges: data.challenges,
          recommendations: data.recommendations
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      // Fallback local construct if server call fails
      const localDemo = {
        email: 'sarah.chen@example.com',
        profile: {
          email: 'sarah.chen@example.com',
          firstName: 'Sarah',
          lastName: 'Chen',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          occupation: 'Sustainability Architect',
          isStudent: false,
          householdSize: 2,
          primaryTransport: 'Electric',
          points: 1250,
          badges: ['Eco Titan', 'Zero Waste Pro']
        },
        calculations: [
          { date: 'Mar 2026', transportation: 180, electricity: 140, food: 110, lifestyle: 85, total: 515, sustainabilityScore: 78 },
          { date: 'Apr 2026', transportation: 140, electricity: 120, food: 95, lifestyle: 60, total: 415, sustainabilityScore: 84 },
          { date: 'May 2026', transportation: 80, electricity: 95, food: 65, lifestyle: 45, total: 285, sustainabilityScore: 92 }
        ],
        goals: [
          { id: 'g1', title: 'Adopt Electric Rideshare transit', description: 'Switch highway commuting from private internal combustion to battery EVs.', category: 'transportation', targetValue: 120, currentValue: 80, deadline: '2026-08-31', completed: false }
        ],
        challenges: [
          { id: 'ch1', title: 'Vampire Draw Slayer', description: 'Shut down all electrical standbys overnight.', category: 'electricity', duration: '7 days', points: 150, joined: true, completed: false }
        ],
        recommendations: []
      };
      handleAuthSuccess(localDemo);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authenticated_user');
    setActiveView('landing');
  };

  // Sync and mutation helpers with the database endpoints
  const handleUpdateCalculationInState = (latestCalc: EmissionsBreakdown, nextHistoryList: EmissionsBreakdown[]) => {
    if (!currentUser) return;
    const resolvedHistory = nextHistoryList.length > 0 ? nextHistoryList : [...currentUser.calculations, latestCalc];
    
    const updated = {
      ...currentUser,
      calculations: resolvedHistory,
      profile: {
        ...currentUser.profile,
        sustainabilityScore: latestCalc.sustainabilityScore
      }
    };
    setCurrentUser(updated);
    localStorage.setItem('authenticated_user', JSON.stringify(updated));
    setActiveView('dashboard'); // take them back to principal graphs overview!
  };

  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'completed' | 'currentValue'>) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'add',
          goalData
        })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = { ...currentUser, goals: data };
        setCurrentUser(updated);
        localStorage.setItem('authenticated_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'update',
          goalId,
          goalData: updates
        })
      });
      const data = await response.json();
      if (response.ok) {
        // If a goal got completed, award points automatically on the user profile!
        let nextPoints = currentUser.profile.points;
        if (updates.completed) {
          nextPoints += 100;
          await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              profileUpdates: { points: nextPoints, badges: [...currentUser.profile.badges, 'Goal Breaker'] }
            })
          });
        }

        const updated = { 
          ...currentUser, 
          goals: data,
          profile: {
            ...currentUser.profile,
            points: nextPoints
          }
        };
        setCurrentUser(updated);
        localStorage.setItem('authenticated_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'delete',
          goalId
        })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = { ...currentUser, goals: data };
        setCurrentUser(updated);
        localStorage.setItem('authenticated_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'join',
          challengeId
        })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = { ...currentUser, challenges: data };
        setCurrentUser(updated);
        localStorage.setItem('authenticated_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'leave',
          challengeId
        })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = { ...currentUser, challenges: data };
        setCurrentUser(updated);
        localStorage.setItem('authenticated_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          action: 'complete',
          challengeId
        })
      });
      const data = await response.json();
      if (response.ok) {
        // Quantify points
        const targetChallenge = currentUser.challenges.find(c => c.id === challengeId);
        const ptsGranted = targetChallenge ? targetChallenge.points : 100;
        const nextPoints = currentUser.profile.points + ptsGranted;

        await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            profileUpdates: { points: nextPoints }
          })
        });

        const updated = { 
          ...currentUser, 
          challenges: data,
          profile: {
            ...currentUser.profile,
            points: nextPoints
          }
        };
        setCurrentUser(updated);
        localStorage.setItem('authenticated_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger professional PDF downloads statement compiled on client
  const triggerPdfReportCompile = () => {
    if (!currentUser) return;
    setPdfLoading(true);
    setTimeout(() => {
      try {
        generateCarbonReport(
          currentUser.profile,
          currentUser.calculations,
          currentUser.goals,
          currentUser.challenges,
          currentUser.recommendations
        );
      } catch (err) {
        console.error('PDF report fail', err);
      } finally {
        setPdfLoading(false);
      }
    }, 600);
  };

  // Nav routing menu sidebar list
  const sidebarLinks = [
    { view: 'dashboard', label: 'Overview Dashboard', icon: BarChart3 },
    { view: 'calculator', label: 'Carbon Calculator', icon: Leaf },
    { view: 'insights', label: 'AI Strategy Actions', icon: Cpu },
    { view: 'goals', label: 'My Targets Goals', icon: Target },
    { view: 'challenges', label: 'SaaS Campaigns', icon: Trophy },
    { view: 'leaderboard', label: 'Sovereign Ranks', icon: Shield },
    { view: 'history', label: 'Audit Log History', icon: Clock },
    { view: 'profile', label: 'User Demographics', icon: User },
    { view: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  /* ---------------------------------------------------- */
  /* Main routing switches rendering                      */
  /* ---------------------------------------------------- */

  if (activeView === 'landing') {
    return (
      <LandingPage 
        onLaunchApp={() => setActiveView('auth')}
        onTryDemo={handleTryDemo}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  if (activeView === 'auth') {
    return (
      <Auth 
        isDarkMode={isDarkMode}
        onAuthSuccess={handleAuthSuccess}
        onNavigateBack={() => setActiveView('landing')}
      />
    );
  }

  // Double check protection safety
  if (!currentUser) {
    setActiveView('landing');
    return null;
  }

  return (
    <div className={`min-h-screen flex font-sans ${isDarkMode ? 'bg-brand-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`} id="app-authenticated-frame">
      
      {/* SIDEBAR ON DESKTOP */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 w-64 border-r justify-between ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="desktop-sidebar">
        
        <div className="flex flex-col h-full overflow-y-auto" id="side-wrapper">
          {/* Brand header */}
          <div className="flex items-center space-x-2 px-6 py-5 select-none" id="side-brand">
            <div className="bg-brand-primary p-1.5 rounded-lg text-brand-dark-bg flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-brand-primary">CarbonIQ</span>
          </div>

          {/* Quick profile banner */}
          <div className="px-6 py-4 border-b border-gray-400/10" id="side-profile-badge">
            <p className="text-xs font-bold font-display">{currentUser.profile.firstName} {currentUser.profile.lastName}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{currentUser.email}</p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-1 rounded-lg w-fit" id="pts-bubble">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              <span>{currentUser.profile.points} pts balance</span>
            </div>
          </div>

          {/* Navigation Items stack */}
          <nav className="p-4 space-y-1" id="side-nav">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeView === link.view;

              return (
                <button
                  key={link.view}
                  onClick={() => { setActiveView(link.view); setMobileMenuOpen(false); }}
                  className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-medium transition-all flex items-center space-x-3 cursor-pointer ${
                    isActive 
                      ? 'bg-brand-primary/15 text-brand-primary font-bold' 
                      : 'text-gray-400 hover:bg-gray-500/5 hover:text-white'
                  }`}
                  id={`side-nav-link-${link.view}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout action */}
        <div className="p-4 border-t border-gray-400/10" id="side-footer">
          <button 
            onClick={handleLogout}
            className="w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-3 cursor-pointer"
            id="side-btn-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>

      </aside>

      {/* MOBILE HEADERS WITH MENU FLY-OVER OUTS */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-y-auto" id="main-interface-col">
        
        <header className={`md:hidden flex justify-between h-16 items-center px-4 border-b sticky top-0 z-40 ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="mobile-header">
          <div className="flex items-center space-x-2" id="mobile-hd-logo">
            <Leaf className="w-5 h-5 text-brand-primary" />
            <span className="font-display font-bold text-base tracking-tight text-brand-primary">CarbonIQ</span>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border rounded-lg"
            id="btn-mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className={`md:hidden p-6 absolute top-16 left-0 w-full z-50 border-b flex flex-col space-y-3 ${isDarkMode ? 'bg-brand-dark-bg/95 border-brand-dark-surface' : 'bg-white/95 border-gray-200 shadow-xl'}`} id="mobile-flyout">
            <div className="pb-3 border-b border-gray-400/10 text-xs text-gray-400" id="mob-profile-header">
              <span className="font-bold">{currentUser.profile.firstName} ({currentUser.profile.points} pts)</span>
            </div>
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.view}
                  onClick={() => { setActiveView(link.view); setMobileMenuOpen(false); }}
                  className={`w-full text-left py-2 px-4 rounded text-xs px-2.5 py-1.5 transition-colors ${activeView === link.view ? 'bg-brand-primary/15 text-brand-primary font-bold' : 'text-gray-400'}`}
                >
                  {link.label}
                </button>
              );
            })}
            <button 
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 text-xs font-bold text-red-400 mt-2"
            >
              Logout Account
            </button>
          </div>
        )}

        {/* PRIMARY ACTIVE INTERFACE SHEET */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full" id="main-content-sheet">
          
          {activeView === 'dashboard' && (
            <Dashboard 
              calculations={currentUser.calculations}
              isDarkMode={isDarkMode}
              userName={currentUser.profile.firstName}
              onNavigate={(v) => {
                if (v === 'reports') {
                  triggerPdfReportCompile();
                } else {
                  setActiveView(v);
                }
              }}
            />
          )}

          {activeView === 'calculator' && (
            <CarbonCalculator 
              userEmail={currentUser.email}
              isDarkMode={isDarkMode}
              onCalculationCompleted={handleUpdateCalculationInState}
              currentProfileDiet={currentUser.profile.dietType}
              currentProfileTransport={currentUser.profile.primaryTransport}
            />
          )}

          {activeView === 'insights' && (
            <Insights 
              userEmail={currentUser.email}
              isDarkMode={isDarkMode}
              recommendations={currentUser.recommendations}
              onRecommendationsLoaded={(nextList) => {
                const updated = { ...currentUser, recommendations: nextList };
                setCurrentUser(updated);
                localStorage.setItem('authenticated_user', JSON.stringify(updated));
              }}
              onAddGoal={handleAddGoal}
              goals={currentUser.goals}
            />
          )}

          {activeView === 'goals' && (
            <Goals 
              goals={currentUser.goals}
              isDarkMode={isDarkMode}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeView === 'challenges' && (
            <Challenges 
              challenges={currentUser.challenges}
              isDarkMode={isDarkMode}
              onJoinChallenge={handleJoinChallenge}
              onLeaveChallenge={handleLeaveChallenge}
              onCompleteChallenge={handleCompleteChallenge}
            />
          )}

          {activeView === 'leaderboard' && (
            <Leaderboard 
              userEmail={currentUser.email}
              isDarkMode={isDarkMode}
              currentUserPoints={currentUser.profile.points}
            />
          )}

          {activeView === 'history' && (
            <History 
              calculations={currentUser.calculations}
              isDarkMode={isDarkMode}
            />
          )}

          {activeView === 'profile' && (
            <Profile 
              userEmail={currentUser.email}
              isDarkMode={isDarkMode}
              profile={currentUser.profile}
              onUpdateProfile={(updatedProfile) => {
                const updated = { ...currentUser, profile: updatedProfile };
                setCurrentUser(updated);
                localStorage.setItem('authenticated_user', JSON.stringify(updated));
              }}
            />
          )}

          {activeView === 'settings' && (
            <Settings 
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              userEmail={currentUser.email}
            />
          )}

        </main>
      </div>

    </div>
  );
}
