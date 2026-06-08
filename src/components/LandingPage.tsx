import React, { useEffect, useRef, useState } from 'react';
import { Leaf, BarChart3, Shield, Cpu, Flame, Target, Trophy, ArrowRight, Sun, Moon } from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onTryDemo: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function LandingPage({
  onLaunchApp,
  onTryDemo,
  isDarkMode,
  onToggleTheme
}: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sliderVal, setSliderVal] = useState<number>(45);

  // Canvas interactive particle node network representing sustainability data flow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 480);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const numParticles = 45;
    const colors = isDarkMode
      ? ['#52B788', '#40916C', '#74C69D', '#2D6A4F']
      : ['#52B788', '#40916C', '#74C69D', '#1B4332'];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.strokeStyle = isDarkMode
              ? `rgba(82, 183, 136, ${0.12 - dist / 110 * 0.12})`
              : `rgba(64, 145, 108, ${0.10 - dist / 110 * 0.10})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Attract lightly to mouse
        if (mouse.x > 0) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            p.x += dx * 0.005;
            p.y += dy * 0.005;
          }
        }

        // Boundary bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isDarkMode]);

  // Environmental impact offset calculator slider metrics based on sliderVal
  const co2Mitigated = Math.round(sliderVal * 12.4);
  const treesPlanted = Math.round(sliderVal * 0.6);

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-brand-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`} id="landing-home">
      {/* Top Navigation Frame */}
      <nav className={`border-b sticky top-0 z-50 backdrop-blur-md ${isDarkMode ? 'bg-brand-dark-bg/85 border-brand-dark-surface' : 'bg-white/85 border-gray-200'}`} id="landing-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2" id="nav-logo">
              <div className="bg-brand-primary p-1.5 rounded-lg text-brand-dark-bg flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-brand-primary">CarbonIQ</span>
            </div>

            {/* Menu options */}
            <div className="hidden md:flex items-center space-x-8" id="nav-links">
              <a href="#features" className={`text-sm font-medium ${isDarkMode ? 'text-brand-dark-text-sec hover:text-brand-primary' : 'text-gray-600 hover:text-brand-secondary'} transition-colors`}>Features</a>
              <a href="#impact-simulator" className={`text-sm font-medium ${isDarkMode ? 'text-brand-dark-text-sec hover:text-brand-primary' : 'text-gray-600 hover:text-brand-secondary'} transition-colors`}>Analytics</a>
              <a href="#about" className={`text-sm font-medium ${isDarkMode ? 'text-brand-dark-text-sec hover:text-brand-primary' : 'text-gray-600 hover:text-brand-secondary'} transition-colors`}>Intelligence</a>
            </div>

            {/* CTA Elements */}
            <div className="flex items-center space-x-4" id="nav-ctas">
              {/* Light/Dark Toggle */}
              <button 
                onClick={onToggleTheme}
                className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'border-brand-dark-surface text-brand-dark-text-sec hover:bg-brand-dark-surface' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                title="Toggle visual theme"
                id="btn-theme-toggle"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={onTryDemo}
                className={`hidden sm:inline-flex text-sm font-medium py-2 px-4 rounded-lg transition-all ${isDarkMode ? 'text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/5' : 'text-brand-secondary border border-brand-secondary/20 hover:bg-brand-secondary/5'}`}
                id="btn-nav-try-demo"
              >
                Try Demo
              </button>

              <button
                onClick={onLaunchApp}
                className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-semibold text-sm py-2 px-4 rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
                id="btn-nav-launch"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Container */}
      <div className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="landing-hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Headline Texts */}
          <div className="lg:col-span-7 space-y-6" id="hero-headlines">
            <div className="inline-flex items-center space-x-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-3 py-1" id="badge-version">
              <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
              <span className="text-xs font-semibold text-brand-primary tracking-wider uppercase">SaaS v1.4 Carbon Intelligence</span>
            </div>
            
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none" id="heading-hero">
              Measure Today. <span className="text-brand-primary">Improve Tomorrow.</span>
            </h1>
            
            <p className={`text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-600'}`} id="desc-hero">
              Track your carbon footprint, audit organizational emissions, and execute data-driven environmental decisions backed by secure, sovereign AI recommendations.
            </p>

            <div className="flex flex-wrap gap-4 pt-2" id="hero-actions">
              <button 
                onClick={onLaunchApp}
                className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-3.5 px-7 rounded-xl shadow-md transition-all flex items-center space-x-2 text-base"
                id="btn-hero-launch"
              >
                <span>Get Started with CarbonIQ</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={onTryDemo}
                className={`py-3.5 px-7 rounded-xl border font-semibold text-base transition-all ${isDarkMode ? 'border-brand-dark-surface hover:bg-brand-dark-surface/50 text-white' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                id="btn-hero-demo"
              >
                Explore Live Demo
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-6 border-t border-dashed border-gray-400/20" id="hero-social-proof">
              <div>
                <p className="text-2xl font-bold font-display text-brand-primary">10.4K</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tons CO₂ Saved</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-brand-primary">94.8%</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Audit Confidence</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-brand-primary">150+</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Climate Milestones</p>
              </div>
            </div>
          </div>

          {/* Abstract Particle Visualization Frame */}
          <div className="lg:col-span-5 relative" id="hero-visualization">
            <div className={`rounded-2xl border relative overflow-hidden shadow-xl ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="visual-frame">
              <div className="p-4 border-b flex justify-between items-center bg-gray-500/5 border-inherit" id="visual-header">
                <span className="text-xs font-mono tracking-widest text-brand-primary">EMISSION_GRID_FLOW.SYS</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              
              <canvas ref={canvasRef} className="w-full mix-blend-screen block" id="interactive-climate-canvas" />

              <div className="p-6 space-y-4" id="visual-interactive-panel">
                <div className="flex justify-between items-center" id="visual-slider-head">
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>SIMULATED WEEKLY MASS ECO ACTIONS</span>
                  <span className="text-sm font-mono font-bold text-brand-primary">{sliderVal} acts</span>
                </div>
                
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={sliderVal} 
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer"
                  id="simulator-slider"
                />

                <div className="grid grid-cols-2 gap-4 text-center border-t border-inherit pt-4" id="visual-data-grid">
                  <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/15" id="data-mitigated">
                    <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>CO₂ Offset Est.</p>
                    <p className="text-xl font-bold font-display text-brand-primary">{co2Mitigated} kg</p>
                  </div>
                  <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/15" id="data-trees">
                    <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>Equivalent Trees</p>
                    <p className="text-xl font-bold font-display text-brand-primary">~{treesPlanted} seedlings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Features bento-style highlights */}
      <div className={`py-20 border-t ${isDarkMode ? 'bg-brand-dark-surface/10 border-brand-dark-surface' : 'bg-gray-100 border-gray-200'}`} id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4" id="features-header">
            <h2 className="font-display font-bold text-3xl sm:text-4xl" id="features-title">Designed for Precision, Built for Change.</h2>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`} id="features-desc">
              CarbonIQ takes carbon accounting beyond standard templates, giving you dynamic analytics, sovereign AI recommendations, and interactive community leaderboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="features-bento">
            {/* Feature 1 */}
            <div className={`p-8 rounded-2xl border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-brand-dark-surface border-brand-dark-surface hover:border-brand-primary/30' : 'bg-white border-gray-200 hover:shadow-lg'}`} id="feat-1">
              <div className="bg-brand-primary/10 text-brand-primary w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-3">Dynamic Carbon Calculator</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
                Evaluate transportation, home electrical utilization, food waste diets, and shopping frequency. We generate real environmental calculations instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 rounded-2xl border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-brand-dark-surface border-brand-dark-surface hover:border-brand-primary/30' : 'bg-white border-gray-200 hover:shadow-lg'}`} id="feat-2">
              <div className="bg-brand-primary/10 text-brand-primary w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-3">Sovereign AI Insights</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
                Engage server-side Gemini 3.5 Flash engines to automatically interpret carbon load distributions and formulate quantified, realistic eco recommendations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 rounded-2xl border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-brand-dark-surface border-brand-dark-surface hover:border-brand-primary/30' : 'bg-white border-gray-200 hover:shadow-lg'}`} id="feat-3">
              <div className="bg-brand-primary/10 text-brand-primary w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-3">Professional PDF Statements</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
                Execute on-demand downloads of high-fidelity environmental statements detailing demographics, emission categories, line analytics charts, and active goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Extra informational overview section */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center" id="about">
        <div className="space-y-6" id="about-content">
          <div className="bg-brand-primary/10 text-brand-primary font-bold text-xs uppercase px-3 py-1 rounded-full inline-block" id="about-badge">
            The CarbonIQ Ecosystem
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl" id="about-heading font-bold">Gamified Decarbonization for the Modern Individual.</h2>
          <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`} id="about-desc">
            We believe saving the environment doesn't have to be a boring compliance checklist. CarbonIQ helps you align targets, compete on points, and unlock achievements that matter.
          </p>

          <div className="space-y-4" id="about-list">
            <div className="flex items-start space-x-3" id="about-item-1">
              <div className="bg-brand-primary/10 p-1 rounded text-brand-primary mt-0.5">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Target Reduction Milestones</h4>
                <p className="text-xs text-gray-400">Establish category carbon goals and log incremental milestones daily.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3" id="about-item-2">
              <div className="bg-brand-primary/10 p-1 rounded text-brand-primary mt-0.5">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Participate in Climate Challenges</h4>
                <p className="text-xs text-gray-400">Join weeks of green commutes or zero waste trials to build points and status badges.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Mock Card Panel */}
        <div className={`p-8 rounded-2xl border text-left space-y-6 relative ${isDarkMode ? 'bg-brand-dark-surface border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="about-mock-card">
          <div className="flex justify-between items-center pb-4 border-b border-gray-400/10" id="card-mock-head">
            <span className="text-xs font-mono text-brand-primary uppercase">MEMBER_KPI_METRICS</span>
            <span className="bg-brand-primary/15 text-brand-primary font-mono text-[10px] px-2 py-0.5 rounded">94 SUSTAINABILITY LEVEL</span>
          </div>

          <div className="space-y-4" id="card-mock-metrics">
            <div className="flex justify-between items-center" id="mock-m1">
              <span className={`text-sm ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-600'}`}>CO₂ Net Monthly Impact</span>
              <span className="text-lg font-bold text-red-400">330 kg CO₂e</span>
            </div>
            
            <div className="w-full bg-gray-500/10 h-2 rounded-full overflow-hidden" id="mock-pbar">
              <div className="bg-brand-primary h-full w-[35%] rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-400/10" id="mock-footer">
              <div id="mock-score">
                <p className="text-xs text-gray-400">Total Points Awarded</p>
                <p className="text-xl font-bold text-brand-primary">1,250 pts</p>
              </div>
              <div id="mock-badges">
                <p className="text-xs text-gray-400 font-bold">Badges Unlocked</p>
                <div className="flex space-x-1 mt-1" id="mock-icons">
                  <span className="inline-block bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-1.5 py-0.5 rounded">Zero Waste</span>
                  <span className="inline-block bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-1.5 py-0.5 rounded">Cold Wash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding Area */}
      <footer className={`py-12 border-t ${isDarkMode ? 'bg-brand-dark-bg/50 border-brand-dark-surface' : 'bg-gray-100 border-gray-200'}`} id="landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center space-x-2" id="footer-logo">
            <div className="bg-brand-primary p-1.5 rounded-lg text-brand-dark-bg flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-brand-primary">CarbonIQ</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} CarbonIQ Inc. Developed with dynamic servers and server-side environmental APIs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
