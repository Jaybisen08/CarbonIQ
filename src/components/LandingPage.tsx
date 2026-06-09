import React, { useEffect, useRef, useState } from 'react';
import { 
  Leaf, BarChart3, Shield, Cpu, Flame, Target, Trophy, 
  ArrowRight, Sun, Moon, Info, Check, HelpCircle, 
  ChevronDown, ChevronUp, Star, Users, Globe, ExternalLink, 
  FileText, Activity, Zap, Compass, Sparkles, AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onTryDemo: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

// Procedural landmass centers in radians for our interactive rotating Earth
const LAND_MASSES = [
  { lat: 0.8, lng: -1.7, r: 0.95 },   // North America
  { lat: -0.3, lng: -1.0, r: 0.8 },    // South America
  { lat: 0.9, lng: 0.5, r: 0.85 },    // Europe
  { lat: 0.7, lng: 1.8, r: 1.15 },    // Asia / Siberia / India
  { lat: 0.1, lng: 0.3, r: 0.85 },    // Africa
  { lat: -0.4, lng: 2.3, r: 0.55 },   // Australia
  { lat: -1.4, lng: 0.0, r: 0.75 },   // Antarctica
  { lat: 1.2, lng: -0.7, r: 0.45 },   // Greenland
];

// Great circle distance checking to map procedural landmasses
function isInContinent(lat: number, lng: number): boolean {
  for (const land of LAND_MASSES) {
    const cosDist = Math.sin(lat) * Math.sin(land.lat) +
                    Math.cos(lat) * Math.cos(land.lat) * Math.cos(lng - land.lng);
    const dist = Math.acos(Math.min(1, Math.max(-1, cosDist)));
    if (dist < land.r) return true;
  }
  return false;
}

export default function LandingPage({
  onLaunchApp,
  onTryDemo,
  isDarkMode,
  onToggleTheme
}: LandingPageProps) {
  const earthCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Stats counter states
  const [stats, setStats] = useState({
    emissions: 0,
    goals: 0,
    trees: 0,
    members: 0
  });

  // Interactive slider configurations
  const [commuteDist, setCommuteDist] = useState<number>(30); // miles/day
  const [commuteType, setCommuteType] = useState<'petrol' | 'hybrid' | 'ev'>('petrol');
  const [flightsCount, setFlightsCount] = useState<number>(3); // flights/year
  const [monthlyPower, setMonthlyPower] = useState<number>(350); // kWh
  const [dietStyle, setDietStyle] = useState<'vegan' | 'vegetarian' | 'omnivore'>('omnivore');
  const [shoppingHabit, setShoppingHabit] = useState<'eco' | 'average' | 'consumer'>('average');

  // FAQ Expand state index
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(0);

  // Active feature highlight tabs
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>('calc');

  // Contact Form state variables
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('general');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess(false);

    if (!contactName.trim()) {
      setContactError('First and last name is required.');
      return;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setContactError('A valid email address is required.');
      return;
    }
    if (!contactMessage.trim() || contactMessage.length < 10) {
      setContactError('Message must be at least 10 characters long.');
      return;
    }

    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactSubject('general');
      setContactMessage('');
    }, 1000);
  };

  // -----------------------------------------------------------------
  // 3D Canvas Earth Simulation
  // -----------------------------------------------------------------
  useEffect(() => {
    const canvas = earthCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = 500;
    let height = canvas.height = 500;
    
    // Starfield generation
    const stars: Array<{ x: number; y: number; r: number; alpha: number; speed: number }> = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005
      });
    }

    // Pre-calculated Earth nodes for extreme performance
    const spherePoints: Array<{ x: number; y: number; z: number; isLand: boolean }> = [];
    const totalPoints = 1400;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < totalPoints; i++) {
      const y = 1 - (i / (totalPoints - 1)) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = (2 * Math.PI * i) / goldenRatio;

      const x = Math.cos(theta) * rAtY;
      const z = Math.sin(theta) * rAtY;

      const lat = Math.asin(y);
      const lng = Math.atan2(z, x);

      const isLand = isInContinent(lat, lng);
      spherePoints.push({ x, y, z, isLand });
    }

    // Drifting cloud layers
    const cloudPoints: Array<{ x: number; y: number; z: number; size: number }> = [];
    for (let i = 0; i < 180; i++) {
      const y = (Math.random() * 2) - 1;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = Math.random() * Math.PI * 2;
      cloudPoints.push({
        x: Math.cos(theta) * rAtY * 1.05,
        y,
        z: Math.sin(theta) * rAtY * 1.05,
        size: Math.random() * 12 + 6
      });
    }

    let alpha = 0; // Rotation angle
    let cloudAlpha = 0;

    // Direct lighting source from front top-left
    const lightSource = { x: -0.6, y: 0.6, z: 1.0 };
    // Normalize light vector
    const len = Math.sqrt(lightSource.x**2 + lightSource.y**2 + lightSource.z**2);
    lightSource.x /= len;
    lightSource.y /= len;
    lightSource.z /= len;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Starfield rendering
      ctx.fillStyle = isDarkMode ? '#09090B' : '#FAFAF9';
      ctx.fillRect(0, 0, width, height);

      if (isDarkMode) {
        stars.forEach(star => {
          star.alpha += star.speed;
          if (star.alpha > 1 || star.alpha < 0) {
            star.speed = -star.speed;
          }
          ctx.fillStyle = `rgba(147, 197, 253, ${Math.max(0.1, Math.min(1, star.alpha))})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 170;

      // Glow / Atmosphere rim (radial gradients)
      const atmosGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.25);
      if (isDarkMode) {
        atmosGlow.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
        atmosGlow.addColorStop(0.3, 'rgba(59, 130, 246, 0.12)');
        atmosGlow.addColorStop(0.7, 'rgba(30, 58, 138, 0.04)');
        atmosGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        atmosGlow.addColorStop(0, 'rgba(147, 197, 253, 0.22)');
        atmosGlow.addColorStop(0.4, 'rgba(219, 234, 254, 0.08)');
        atmosGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = atmosGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Earth's physical backdrop sphere
      ctx.fillStyle = isDarkMode ? '#0d1e3d' : '#EFF6FF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Shadow shade gradient overlay on the globe itself to simulate dark hemisphere
      const planetaryShade = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      if (isDarkMode) {
        planetaryShade.addColorStop(0, 'rgba(147, 197, 253, 0.04)');
        planetaryShade.addColorStop(0.5, 'rgba(9, 9, 11, 0.45)');
        planetaryShade.addColorStop(1, 'rgba(9, 9, 11, 0.95)');
      } else {
        planetaryShade.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        planetaryShade.addColorStop(0.6, 'rgba(147, 197, 253, 0.15)');
        planetaryShade.addColorStop(1, 'rgba(29, 78, 216, 0.35)');
      }
      
      alpha += 0.0032; // Earth rotation speed
      cloudAlpha += 0.0042; // Atmosphere rotates slightly faster

      const cosTilt = Math.cos(23.4 * Math.PI / 180);
      const sinTilt = Math.sin(23.4 * Math.PI / 180);

      // Render Earth dots (backface culling + 3D rotation)
      spherePoints.forEach(p => {
        // Rotate around Y-axis
        let x1 = p.x * Math.cos(alpha) - p.z * Math.sin(alpha);
        let z1 = p.x * Math.sin(alpha) + p.z * Math.cos(alpha);
        let y1 = p.y;

        // Apply Earth tilt (rotation around Z-axis)
        let xRot = x1 * cosTilt - y1 * sinTilt;
        let yRot = x1 * sinTilt + y1 * cosTilt;
        let zRot = z1;

        // Render point only if it lies on front hemisphere (zRot > 0)
        if (zRot > 0) {
          // Orthographic projection coordinate mapping
          const px = centerX + xRot * radius;
          const py = centerY - yRot * radius;

          // Simple dynamic light factor calculation based on distance to light source
          const intensity = Math.max(0.08, xRot * lightSource.x + yRot * lightSource.y + zRot * lightSource.z);
          
          if (p.isLand) {
            // Shiny neon land dots
            if (intensity > 0.25) {
              ctx.fillStyle = isDarkMode 
                ? `rgba(37, 99, 235, ${0.45 + intensity * 0.55})` 
                : `rgba(29, 78, 216, ${0.5 + intensity * 0.5})`;
            } else {
              // Glowing night lights in dark areas!
              ctx.fillStyle = isDarkMode ? 'rgba(253, 224, 71, 0.85)' : 'rgba(37, 99, 235, 0.4)';
            }
          } else {
            // Light Grid oceans dots
            ctx.fillStyle = isDarkMode 
              ? `rgba(29, 78, 216, ${0.12 * intensity})` 
              : `rgba(147, 197, 253, ${0.25 * intensity})`;
          }

          ctx.beginPath();
          const dotSize = p.isLand ? (zRot * 1.8 + 0.8) : 0.9;
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render transparent drifting cloud layer
      cloudPoints.forEach(c => {
        let x1 = c.x * Math.cos(cloudAlpha) - c.z * Math.sin(cloudAlpha);
        let z1 = c.x * Math.sin(cloudAlpha) + c.z * Math.cos(cloudAlpha);
        let y1 = c.y;

        let xRot = x1 * cosTilt - y1 * sinTilt;
        let yRot = x1 * sinTilt + y1 * cosTilt;
        let zRot = z1;

        if (zRot > 0.1) {
          const px = centerX + xRot * radius;
          const py = centerY - yRot * radius;
          
          const lighting = Math.max(0, xRot * lightSource.x + yRot * lightSource.y + zRot * lightSource.z);
          ctx.fillStyle = isDarkMode
            ? `rgba(255, 255, 255, ${0.11 * lighting})`
            : `rgba(255, 255, 255, ${0.35 * lighting})`;

          ctx.beginPath();
          ctx.arc(px, py, c.size * (zRot * 0.5 + 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Aesthetic orbital climate satellite trail
      const orbitAng = alpha * 1.5;
      const satX = centerX + Math.cos(orbitAng) * radius * 1.35 * cosTilt;
      const satY = centerY + Math.sin(orbitAng) * radius * 0.7 * sinTilt;
      const satZ = Math.sin(orbitAng);

      // Draw orbit path line behind or ahead
      ctx.strokeStyle = isDarkMode ? 'rgba(37, 99, 235, 0.08)' : 'rgba(29, 78, 216, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.35, radius * 0.6, 23.4 * Math.PI / 180, 0, Math.PI * 2);
      ctx.stroke();

      // Active glowing state node
      ctx.fillStyle = '#2563EB';
      ctx.shadowBlur = isDarkMode ? 12 : 0;
      ctx.shadowColor = '#2563EB';
      ctx.beginPath();
      ctx.arc(satX, satY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      // Floating carbon tag label next to satellite
      if (satZ > 0) {
        ctx.fillStyle = isDarkMode ? 'rgba(147, 197, 253, 0.85)' : '#1E3A8A';
        ctx.font = '9px monospace';
        ctx.fillText("CO2_STATION_METRICS_042", satX + 8, satY - 2);
      }

      ctx.strokeStyle = planetaryShade;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isDarkMode]);

  // -----------------------------------------------------------------
  // Animated stats count-up entering simulations
  // -----------------------------------------------------------------
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      if (t >= 1) {
        setStats({
          emissions: 142854,
          goals: 12492,
          trees: 583491,
          members: 48201
        });
        clearInterval(interval);
      } else {
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setStats({
          emissions: Math.floor(ease * 142854),
          goals: Math.floor(ease * 12492),
          trees: Math.floor(ease * 583491),
          members: Math.floor(ease * 48201)
        });
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------------------------------------------
  // Interactive Custom Assessment Real-time calculator engine
  // -----------------------------------------------------------------
  const calculateSimulatedFootprint = () => {
    // Commute Emissions
    const commuteFactor = commuteType === 'petrol' ? 0.411 : commuteType === 'hybrid' ? 0.21 : 0.08;
    const annualCommuteDist = commuteDist * 5 * 52; // 5 days a week, 52 weeks
    const commuteKg = annualCommuteDist * commuteFactor;

    // Flight Emissions
    const flightKg = flightsCount * 4 * 250; // average 4 hours flight

    // Electricity usage
    const electricityKg = monthlyPower * 12 * 0.385; // Annual

    // Diet impact
    const dietFactors = { vegan: 1500, vegetarian: 2400, omnivore: 3400 };
    const dietKg = dietFactors[dietStyle];

    // Shopping habit impact
    const shoppingFactors = { eco: 800, average: 1800, consumer: 3200 };
    const shoppingKg = shoppingFactors[shoppingHabit];

    // Grand total in metric tons (divided by 1000)
    const grandTotalTons = (commuteKg + flightKg + electricityKg + dietKg + shoppingKg) / 1000;
    return parseFloat(grandTotalTons.toFixed(1));
  };

  const simulatedTons = calculateSimulatedFootprint();
  const nationalAverageTons = 16.0;
  const isBetterThanAverage = simulatedTons < nationalAverageTons;
  const carbonSavingsPercentage = Math.round(Math.max(0, ((nationalAverageTons - simulatedTons) / nationalAverageTons) * 100));

  return (
    <div className={`min-h-screen font-sans antialiased ${isDarkMode ? 'bg-[#09090B] text-[#FFFFFF]' : 'bg-[#FAFAF9] text-[#18181B]'}`} id="premium-landing-root">
      
      {/* -----------------------------------------------------------------
          Top Premium Navigation 
         ----------------------------------------------------------------- */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all ${
        isDarkMode 
          ? 'bg-[#09090B]/90 border-[#3F3F46]/30 text-white' 
          : 'bg-[#FAFAF9]/90 border-zinc-200 text-[#18181B]'
      }`} id="app-nav">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-18 justify-between items-center">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" id="logo-brand">
              <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.25)]">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight font-display text-brand-primary">CarbonIQ</span>
                <span className="text-[10px] tracking-wider text-gray-500 font-mono -mt-1 font-semibold">SAAS ENTERPRISE</span>
              </div>
            </div>

            {/* Nav links */}
            <div className="hidden lg:flex items-center space-x-7" id="nav-inline-links">
              <a href="#premium-landing-root" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors">Home</a>
              <a href="#about-carboniq-sec" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors">About</a>
              <a href="#feature-showcase" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors">Features</a>
              <a href="#benefits" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors">Benefits</a>
              <a href="#interactive-simulator" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors">Assessment Lab</a>
              <a href="#contact" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors">Contact</a>
              <a href="#faq" className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-primary transition-colors">FAQ Support</a>
            </div>

            {/* CTAs and Toggle */}
            <div className="flex items-center space-x-4" id="nav-actions">
              {/* Theme Toggle */}
              <button 
                onClick={onToggleTheme}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isDarkMode 
                    ? 'border-[#3F3F46]/35 bg-[#27272A]/20 hover:bg-[#27272A]/45 text-amber-400' 
                    : 'border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-slate-800'
                }`}
                aria-label="Toggle user visual theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-brand-primary" />}
              </button>

              <button
                onClick={onTryDemo}
                className={`hidden sm:inline-flex text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'text-brand-primary border-brand-primary/20 bg-brand-primary/10 hover:bg-brand-primary/20' 
                    : 'text-brand-secondary border-brand-secondary/20 bg-blue-50/50 hover:bg-blue-100/70'
                }`}
              >
                Try Demo
              </button>

              <button
                onClick={onLaunchApp}
                className="bg-brand-primary hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.25)] transition-all flex items-center space-x-2 cursor-pointer grow-0"
              >
                <span>Launch Space</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* -----------------------------------------------------------------
          Hero Section 
         ----------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32" id="hero-sec">
        
        {/* Subtle decorative grid background layer in dark mode */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f60d_1px,transparent_1px),linear-gradient(to_bottom,#3b82f60d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Info */}
            <div className="lg:col-span-6 space-y-8 text-left" id="hero-info-cols">
              <div className="inline-flex items-center space-x-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-4 py-1.5" id="hero-badge-tag">
                <Sparkles className="w-4.5 h-4.5 text-brand-primary animate-pulse" />
                <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Global Carbon Intelligence Platform</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]" id="hero-main-title">
                Measure Today.<br />
                <span className="text-brand-primary relative">
                  Improve Tomorrow.
                  <span className="absolute bottom-1 left-0 w-full h-[6px] bg-brand-primary/20 rounded" />
                </span>
              </h1>

              <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-zinc-450' : 'text-slate-600'}`} id="hero-main-description">
                Understand your environmental impact, track your carbon footprint, receive AI-powered recommendations, and build a sustainable future through data-driven decisions.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2" id="hero-cta-buttons">
                <button
                  onClick={onLaunchApp}
                  className="bg-brand-primary hover:bg-[#1D4ED8] text-white font-extrabold text-sm uppercase tracking-wider py-4.5 px-8 rounded-xl shadow-[0_5px_25px_rgba(37,99,235,0.3)] transition-all flex items-center space-x-2 group cursor-pointer"
                  id="cta-get-started"
                >
                  <span>Build Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onTryDemo}
                  className={`py-4 px-8 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'border-[#3F3F46]/40 bg-[#27272A]/20 hover:bg-[#27272A]/50 text-gray-205' 
                      : 'border-zinc-300 bg-white hover:bg-zinc-100 text-slate-800 shadow-sm'
                  }`}
                  id="cta-try-demo"
                >
                  Try Demo System
                </button>

                <a
                  href="#feature-showcase"
                  className={`py-4 px-6 text-xs font-bold uppercase tracking-wider flex items-center space-x-1 hover:underline ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-850'
                  }`}
                  id="cta-learn-more"
                >
                  <span>Learn More</span>
                  <span>&darr;</span>
                </a>
              </div>

              {/* Small micro social statistics block */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-dashed border-zinc-700/20" id="hero-social-grid">
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-display text-brand-primary">10.4K</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">TONNES CO2 REDUCED</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-display text-brand-primary">99.8%</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">DATA CONFIDENCE FACTOR</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-display text-brand-primary">120+</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">ACTIVE CITY CAMPAIGNS</p>
                </div>
              </div>
            </div>

            {/* Earth Rotating Globe column */}
            <div className="lg:col-span-6 flex justify-center items-center relative" id="hero-globe-canvas-col">
              
              {/* Back ambient glowing orb background */}
              <div className="absolute w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative p-2 rounded-3xl" id="canvas-globe-wrapper">
                <canvas 
                  ref={earthCanvasRef} 
                  className="w-full max-w-[480px] h-auto aspect-square select-none pointer-events-none block blur-[0.2px]"
                  id="globe-3d-rendering"
                />

                {/* Cybernetic telemetry tags around the planet */}
                <div className="absolute top-8 left-0 block bg-[#18181B]/95 border border-[#3F3F46]/50 text-white text-[9px] font-mono p-2.5 rounded-xl shadow-lg" id="tele-tag-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping"></span>
                    <span>ORBITAL_METERS: ACTV</span>
                  </div>
                  <p className="text-[8px] text-gray-400 mt-0.5">AXS_TILT: 23.44°</p>
                </div>

                <div className="absolute bottom-12 right-0 block bg-[#18181B]/95 border border-[#3F3F46]/50 text-white text-[9px] font-mono p-2.5 rounded-xl shadow-lg" id="tele-tag-2">
                  <p className="text-brand-primary font-bold">STATION_DECARBON: OK</p>
                  <p className="text-[8px] text-gray-400 mt-0.5">RAD_CURVATURE: 1.05R</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          Live Statistics Section 
         ----------------------------------------------------------------- */}
      <section className={`py-12 border-y ${
        isDarkMode ? 'bg-[#18181B]/20 border-[#3F3F46]/20' : 'bg-zinc-100/55 border-zinc-200'
      }`} id="stats">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" id="live-stats-row">
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">CO2 Emissions Tracked</span>
              <p className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums">
                {stats.emissions.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Tons</span>
              </p>
              <p className="text-[10px] text-slate-450">Verifiably logged worldwide</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">Sustainability Milestones</span>
              <p className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums">
                {stats.goals.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Units</span>
              </p>
              <p className="text-[10px] text-slate-450">Completed by active users</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">Seedling Equivalent Saved</span>
              <p className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums">
                {stats.trees.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Trees</span>
              </p>
              <p className="text-[10px] text-slate-450">Offsetting greenhouse loads</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">Community Climate Cohort</span>
              <p className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums">
                {stats.members.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Accounts</span>
              </p>
              <p className="text-[10px] text-slate-450">Enrolled and verified</p>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          About CarbonIQ Section
         ----------------------------------------------------------------- */}
      <section className="py-24" id="about-carboniq-sec">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Context Left Column */}
            <div className="lg:col-span-7 space-y-6 text-left" id="about-info-col">
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#52B788] uppercase">
                <Compass className="w-4 h-4 text-[#52B788]" />
                <span>Modern Climate Stewardship</span>
              </div>
              
              <h2 className="font-display font-black text-3xl sm:text-4xl leading-tight">
                Decarbonization Built Around Actionable Technology.
              </h2>
              
              <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                CarbonIQ redefines carbon tracking from a simple periodic audit to an active, real-time strategy. Traditional accounting fails because static data yields slow reactions. CarbonIQ maps your daily decisions, predicts high-intensity segments, and uses secure server-side model processing to target immediate action paths.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4" id="about-bento-sub">
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#1B4332]/15 border-[#2D6A4F]/20' : 'bg-white border-emerald-100 shadow-sm'
                }`}>
                  <h4 className="font-bold text-sm text-[#52B788] mb-1.5 flex items-center gap-2">
                    <Zap className="w-4.5 h-4.5" /> High Precision Audits
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Retrieve immediate numbers on household power loads, flight sectors, diet routines, and logistics commute configurations with precise factors.
                  </p>
                </div>

                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#1B4332]/15 border-[#2D6A4F]/20' : 'bg-white border-emerald-100 shadow-sm'
                }`}>
                  <h4 className="font-bold text-sm text-[#52B788] mb-1.5 flex items-center gap-2">
                    <Users className="w-4.5 h-4.5" /> Direct Community Sync
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Collaborate inside targeted municipal campaigns, progress up the ranks of the public leaderboards, and lock in points for local offset programs.
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Aesthetic Metric Card Right Column */}
            <div className="lg:col-span-5" id="about-visualization-col">
              <div className={`p-8 rounded-3xl border text-left space-y-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#122F22]/40 to-[#081C15] border-[#2D6A4F]/30 shadow-2xl' 
                  : 'bg-white border-emerald-200 shadow-xl'
              }`} id="carboniq-preview-card">
                
                <div className="flex justify-between items-center pb-4 border-b border-[#2D6A4F]/20">
                  <span className="text-[10px] font-mono tracking-wider text-emerald-500 uppercase">SYS_METERS_CURRENT</span>
                  <span className="bg-[#52B788]/20 text-[#52B788] text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg">
                    Level 5 eco advocate
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span>Transportation Sector Intensity</span>
                      <span className="text-amber-400">3.4 Tons CO2 (Avg)</span>
                    </div>
                    <div className="w-full h-2 bg-[#2D6A4F]/20 rounded-full overflow-hidden">
                      <div className="bg-[#52B788] h-full w-[45%] rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span>Home Electrical Sector Load</span>
                      <span className="text-emerald-400">1.2 Tons CO2 (Low)</span>
                    </div>
                    <div className="w-full h-2 bg-[#2D6A4F]/20 rounded-full overflow-hidden">
                      <div className="bg-[#52B788] h-full w-[22%] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2D6A4F]/20 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Historical Total Net pts</p>
                    <p className="text-2xl font-black font-display text-[#52B788]">2,850 Pts</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">SaaS Active campaigns</p>
                    <p className="text-sm font-bold text-[#D8F3DC] mt-1 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>3 Joined Campaigns</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          How CarbonIQ Works Section (4-step timeline)
         ----------------------------------------------------------------- */}
      <section className={`py-24 border-y ${
        isDarkMode ? 'bg-[#18181B]/10 border-[#3F3F46]/20' : 'bg-zinc-50/50 border-zinc-200'
      }`} id="how-it-works-sec">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4" id="works-header">
            <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Deployment Sequence</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl" id="works-title">Your Path to Modern Decarbonization</h2>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Establish your footprint profile, measure historical emission segments, generate secure recommendations, and execute targets across the platform in 4 simple movements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative" id="works-timeline">
            {/* Timeline connection bar on desktops */}
            <div className="hidden md:block absolute top-1/4 left-10 right-10 h-0.5 bg-gradient-to-r from-blue-500/10 via-brand-primary/40 to-blue-500/10 z-0" />

            {/* Step 1 */}
            <div className={`p-6 rounded-2xl border relative z-10 transition-all hover:scale-[1.02] ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30 hover:border-brand-primary/50' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="step-one">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.15)] mb-6">
                1
              </div>
              <h3 className="font-display font-bold text-base mb-2 leading-snug">Create Account</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Configure your demographic data securely, specifying parameters like city, state, and occupation.
              </p>
            </div>

            {/* Step 2 */}
            <div className={`p-6 rounded-2xl border relative z-10 transition-all hover:scale-[1.02] ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30 hover:border-brand-primary/50' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="step-two">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.15)] mb-6">
                2
              </div>
              <h3 className="font-display font-bold text-base mb-2 leading-snug">Input Lifestyle Info</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Specify commute vehicle fuels, monthly energy configurations, dietary programs, and purchase styles in the calculator.
              </p>
            </div>

            {/* Step 3 */}
            <div className={`p-6 rounded-2xl border relative z-10 transition-all hover:scale-[1.02] ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30 hover:border-brand-primary/50' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="step-three">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.15)] mb-6">
                3
              </div>
              <h3 className="font-display font-bold text-base mb-2 leading-snug">Analyze Footprint</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Review dynamic graphs rendering carbon emissions across transportation, nutrition, electricity, and materials.
              </p>
            </div>

            {/* Step 4 */}
            <div className={`p-6 rounded-2xl border relative z-10 transition-all hover:scale-[1.02] ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30 hover:border-brand-primary/50' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="step-four">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.15)] mb-6">
                4
              </div>
              <h3 className="font-display font-bold text-base mb-2 leading-snug">Optimize & Track</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Formulate goals, participate in high-level challenges, earn status achievements, and track progress.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          Feature Showcase Section (Bento-Grid style with tab selector)
         ----------------------------------------------------------------- */}
      <section className="py-24" id="feature-showcase">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4" id="showcase-header">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">The Platform Engine</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl" id="showcase-title">Powerful Capabilities For High-Fidelity Tracking</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Every tool and view in CarbonIQ is meticulously configured to process user data dynamically. No empty frames.
            </p>
          </div>

          {/* Interactive Feature Grid Showcase cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" id="showcase-grid">
            
            {/* Feature 1: Carbon Calculator */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">Carbon Calculator</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Inputs for fuel, flights, appliance usage, diet type, and recycling habits translated via regional factors into real carbon numbers.
              </p>
            </div>

            {/* Feature 2: AI Insights */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">AI Strategy Insights</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Secure logic layer calls server-side AI to process high emission domains, offering quantified reduction solutions instantly.
              </p>
            </div>

            {/* Feature 3: Executive Dashboard */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">Executive Dashboard</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Aggregates categories to render visual projections, trend patterns, and sustainability score tracking dynamically.
              </p>
            </div>

            {/* Feature 4: Goals Tracking */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">Targets Tracking</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Set and edit clear carbon saving horizons. Progress bars automatically adjust upwards when calculations show targeted decreases.
              </p>
            </div>

            {/* Feature 5: Campaigns & Challenges */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">System Challenges</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Join structured regional carbon trails, log daily compliance status with check buttons, and build verified point scores.
              </p>
            </div>

            {/* Feature 6: Sovereign Ranks Leaderboard */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">Sovereign Ranks</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Compare verified scores against global community members. Generates positions from audit data securely.
              </p>
            </div>

            {/* Feature 7: PDF Reports Generation */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">High Fidelity PDF Output</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Download fully detailed audited environmental receipts compiling emission profiles, AI strategy pathways and historic goal charts.
              </p>
            </div>

            {/* Feature 8: Carbon Offsetting Calculator */}
            <div className={`p-6 rounded-2xl border text-left transition-all hover:-translate-y-1 ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-5 border border-[#2563EB]/20">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2">Offset Simulator</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Quantify target financial and active coordinates needed to reclaim carbon neutral states via proven environmental pathways.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          Benefits Section
         ----------------------------------------------------------------- */}
      <section className="py-24 border-t border-zinc-700/20" id="benefits">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4" id="benefits-header">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase font-mono">Value Proposition</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl" id="benefits-title" style={{ color: isDarkMode ? '#FFFFFF' : '#111827' }}>Why Users Count On CarbonIQ</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Decarbonization is not just an ethical requirement — it is a smart strategy yielding direct cost reductions, community prestige, and verified proof of impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" id="benefits-grid">
            
            <div className={`p-6 rounded-2xl border text-left transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`} id="benefit-1">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-5">
                <Zap className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2" style={{ color: isDarkMode ? '#FAFAFA' : '#111827' }}>Direct Household Savings</h3>
              <p className="text-xs text-gray-450 leading-relaxed font-sans">
                Receive targeted home optimization advice. Adjust heating configurations and use scheduling to save up to <strong className="text-[#2563EB]">$1,200 annually</strong> in average utility overhead.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border text-left transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`} id="benefit-2">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-5">
                <Cpu className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2" style={{ color: isDarkMode ? '#FAFAFA' : '#111827' }}>Seamless AI Automations</h3>
              <p className="text-xs text-gray-455 leading-relaxed">
                Zero complex spreadsheets. Log raw daily details and let server-side modern AI engines parse emissions segments and formulate personalized pathways automatically.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border text-left transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`} id="benefit-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-5">
                <Trophy className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2" style={{ color: isDarkMode ? '#FAFAFA' : '#111827' }}>Communal Eco Status</h3>
              <p className="text-xs text-gray-455 leading-relaxed">
                Build profile points, earn authoritative badges like "Eco Titan", rise up the municipal leaderboards, and turn daily compliance into shared standard prestige.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border text-left transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#18181B]/40 border-[#3F3F46]/35' : 'bg-white border-zinc-200 shadow-md'
            }`} id="benefit-4">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-5">
                <FileText className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="font-display font-extrabold text-base mb-2" style={{ color: isDarkMode ? '#FAFAFA' : '#111827' }}>Verified PDF Compliance</h3>
              <p className="text-xs text-gray-455 leading-relaxed font-sans">
                Download fully audited carbon statements compiling exact household parameters, active goals, and AI-predicted saving curves. Print for files instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          Interactive Assessment Simulator Section
         ----------------------------------------------------------------- */}
      <section className={`py-24 border-y ${
        isDarkMode ? 'bg-[#18181B]/15 border-[#3F3F46]/25' : 'bg-zinc-50/50 border-zinc-200'
      }`} id="interactive-simulator">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4" id="sim-header">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase">Interactive Sandbox Lab</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl" id="sim-title">Estimate Your Carbon Index Instantly</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Modify the parameters below to witness how day-to-day configurations dynamically shift projected carbon balances.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="sim-main-container">
            
            {/* Left Controls Column */}
            <div className={`lg:col-span-7 p-8 rounded-3xl space-y-6 text-left ${
              isDarkMode ? 'bg-[#18181B] border border-[#3F3F46]/30' : 'bg-white border border-zinc-200 shadow-md'
            }`} id="sim-controls">
              
              {/* Control 1: Commute Daily Distance */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Daily Transit Commute Distance</span>
                  <span className="text-[#2563EB] font-mono">{commuteDist} miles / day</span>
                </div>
                <input 
                  type="range"
                  min="0" 
                  max="120" 
                  value={commuteDist}
                  onChange={(e) => setCommuteDist(Number(e.target.value))}
                  className="w-full accent-[#2563EB] cursor-pointer"
                  id="sim-commute-slider"
                />
                <div className="grid grid-cols-3 gap-2 pt-1 font-semibold" id="sim-fuel-types">
                  {['petrol', 'hybrid', 'ev'].map(type => (
                    <button
                      key={type}
                      onClick={() => setCommuteType(type as any)}
                      className={`py-1.5 rounded-lg text-[10px] uppercase tracking-wider border transition-all ${
                        commuteType === type 
                          ? 'bg-[#2563EB] border-[#2563EB] text-white font-black' 
                          : 'border-zinc-700/35 text-xs text-gray-450 hover:border-[#2563EB]/20'
                      }`}
                    >
                      {type === 'petrol' ? '⛽ Internal Comb' : type === 'hybrid' ? '⚡ Hybrid' : '🔌 Electric EV'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control 2: Annual Flights Hour load */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Long-haul Aviation (Flights/Year)</span>
                  <span className="text-[#2563EB] font-mono">{flightsCount} flights (est 4h each)</span>
                </div>
                <input 
                  type="range"
                  min="0" 
                  max="25" 
                  value={flightsCount}
                  onChange={(e) => setFlightsCount(Number(e.target.value))}
                  className="w-full accent-[#2563EB] cursor-pointer"
                />
              </div>

              {/* Control 3: Monthly Home electrical load */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Monthly Electric Usage (kWh)</span>
                  <span className="text-[#2563EB] font-mono">{monthlyPower} kWh / month</span>
                </div>
                <input 
                  type="range"
                  min="50" 
                  max="1500" 
                  value={monthlyPower}
                  onChange={(e) => setMonthlyPower(Number(e.target.value))}
                  className="w-full accent-[#2563EB] cursor-pointer"
                />
              </div>

              {/* Control 4: Dietary Profiles Selector */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-gray-400 block">Dietary Profile Selection</label>
                <div className="grid grid-cols-3 gap-3 font-semibold" id="diet-switch-grid">
                  {[
                    { key: 'vegan', label: '🥗 Strict Vegan' },
                    { key: 'vegetarian', label: '🧀 Vegetarian' },
                    { key: 'omnivore', label: '🥩 Core Meat' }
                  ].map(e => (
                    <button
                      key={e.key}
                      onClick={() => setDietStyle(e.key as any)}
                      className={`py-2 px-3 rounded-lg text-xs tracking-wide border transition-all ${
                        dietStyle === e.key 
                          ? 'bg-[#2563EB] border-[#2563EB] text-white font-black' 
                          : 'border-zinc-700/35 text-gray-450 hover:border-[#2563EB]/20'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control 5: Consumer Shopping */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-gray-400 block">Materials Consumption Strategy</label>
                <div className="grid grid-cols-3 gap-3 font-semibold" id="shopping-switch-grid">
                  {[
                    { key: 'eco', label: '♻️ Minimalist' },
                    { key: 'average', label: '📦 Average' },
                    { key: 'consumer', label: '💸 Heavy Spender' }
                  ].map(e => (
                    <button
                      key={e.key}
                      onClick={() => setShoppingHabit(e.key as any)}
                      className={`py-2 px-3 rounded-lg text-xs tracking-wide border transition-all ${
                        shoppingHabit === e.key 
                          ? 'bg-[#2563EB] border-[#2563EB] text-white font-black' 
                          : 'border-zinc-700/35 text-gray-455 hover:border-[#2563EB]/20'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Projected Results Column */}
            <div className="lg:col-span-5 space-y-6" id="sim-results-pane">
              
              <div className={`p-8 rounded-3xl text-left space-y-6 ${
                isDarkMode ? 'bg-[#18181B] border border-[#3F3F46]/30' : 'bg-white border border-zinc-205 shadow-xl'
              }`} id="projected-emissions-box">
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-primary">PROJECTION_TOTALS_ANNUAL</span>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Your Simulated Carbon Footprint</p>
                  <p className="text-5xl font-black font-display text-[#2563EB] tabular-nums">
                    {simulatedTons} <span className="text-lg font-semibold text-zinc-400">tons CO2e / yr</span>
                  </p>
                </div>

                {/* Progress bar comparison with static National Target */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Your Projection: {simulatedTons} Tons</span>
                    <span>US Normal: {nationalAverageTons} Tons</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-700/30 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isBetterThanAverage ? 'bg-[#22C55E]' : 'bg-red-550'}`}
                      style={{ width: `${Math.min(100, (simulatedTons / nationalAverageTons) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status assessment message */}
                <div className={`p-4 rounded-xl text-xs font-medium border ${
                  isBetterThanAverage 
                    ? 'bg-emerald-950/20 border-emerald-500/15 text-emerald-400' 
                    : 'bg-red-950/15 border-red-500/15 text-red-400'
                }`} id="feedback-alert">
                  <div className="flex items-start space-x-2.5">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      {isBetterThanAverage ? (
                        <p>
                          <strong>Excellent!</strong> Your simulated emissions are <strong>{carbonSavingsPercentage}% below</strong> the national standard of 16.0 tons! You qualify for the Gold Sovereign badge.
                        </p>
                      ) : (
                        <p>
                          <strong>Alert!</strong> Your simulated footprint is currently above standard. By replacing private petrol miles with electric public transits, you can save up to 4.2 tons.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onLaunchApp}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all text-center flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lock in Calculations & Save</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          AI Intelligence Processing representation
         ----------------------------------------------------------------- */}
      <section className="py-24" id="ai-intelligence">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4" id="ai-header">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase font-mono">The Cognitive Edge</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl" id="ai-title">Server-Side Intelligent Decarbonization</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Understand how our integrated Gemini neural engine inspects structural parameters to derive saving paths.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="ai-flow">
            {/* Left AI diagram simulation */}
            <div className="lg:col-span-6 space-y-4 relative" id="diagram-container">
              
              <div className={`p-5 rounded-2xl border flex items-center justify-between shadow-sm relative ${
                isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200'
              }`} id="node-input">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-[#2563EB] flex items-center justify-center font-mono text-xs">
                    01
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">RAW CONSUMER LOAD INDICES</h5>
                    <p className="text-[10px] text-gray-450">Commute, diet, and monthly energy numbers</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-zinc-805 text-[#2563EB] px-2 py-0.5 rounded font-semibold">PASSED</span>
              </div>

              {/* Connector */}
              <div className="flex justify-center h-6" id="arrow-down-one">
                <div className="w-0.5 h-full bg-gradient-to-b from-[#2563EB] to-zinc-800" />
              </div>

              <div className={`p-5 rounded-2xl border flex items-center justify-between shadow-md relative bg-[#2563EB] border-brand-primary`} id="node-engine">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ffffff]/20 text-white flex items-center justify-center">
                    <Cpu className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">GEMINI 3.5 SUSTAINABILITY ANALYSIS</h5>
                    <p className="text-[10px] text-blue-100/70">Neural segmentation & quantified calculations</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white text-[#2563EB] font-black px-2 py-0.5 rounded animate-pulse text-[9px]">COMPUTING</span>
              </div>

              {/* Connector */}
              <div className="flex justify-center h-6" id="arrow-down-two">
                <div className="w-0.5 h-full bg-gradient-to-b from-zinc-805 to-[#2563EB]" />
              </div>

              <div className={`p-5 rounded-2xl border flex items-center justify-between shadow-sm relative ${
                isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200'
              }`} id="node-output-diagram">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-850 text-[#2563EB] flex items-center justify-center font-mono text-xs">
                    03
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">QUANTIFIED RECOMMENDED TARGETS</h5>
                    <p className="text-[10px] text-gray-450">Save targets with easy setup and high impact values</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-zinc-805 text-brand-primary px-2 py-0.5 rounded font-semibold">DELIVERED</span>
              </div>

            </div>

            {/* Right Information Block */}
            <div className="lg:col-span-6 space-y-6 text-left" id="ai-description">
              <h3 className="font-display font-bold text-2xl">Formulating Intelligent, High-Impact Saving Strategies.</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
                Plain-text lists can feel repetitive. CarbonIQ parses and identifies segments where you can cut the most carbon with the least operational compromise. Our recommendations are derived by benchmarking your footprint relative to adjacent municipal regions and identifying where public transport, cold-wash cycles, and local offsets make massive differences.
              </p>

              <ul className="space-y-3.5 text-xs text-gray-400" id="ai-benefits">
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4.5 h-4.5 text-[#2563EB]" />
                  <span>Real-time habit analysis and diagnostic parsing</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4.5 h-4.5 text-[#2563EB]" />
                  <span>Identifies anomalies, like appliance standby leakage over weekends</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4.5 h-4.5 text-[#2563EB]" />
                  <span>Interactive calculations for clean transport alternatives</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* -----------------------------------------------------------------
          Sustainability Impact Section (Flowchart chain)
         ----------------------------------------------------------------- */}
      <section className={`py-24 border-y ${
        isDarkMode ? 'bg-[#18181B]/20 border-[#3F3F46]/20' : 'bg-zinc-100/50 border-zinc-200'
      }`} id="impact-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4" id="impact-header">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase font-mono">Sustainability Domino Effect</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl" id="impact-title">How Incremental Goals Drive Planetary Health</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              One modest operational pivot cascades down to build significant macro improvements in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center pt-6" id="impact-cards-row">
            
            {/* Node 1 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between h-48 text-left ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="text-[10px] font-mono text-[#2563EB] font-bold">STAGE 01 &bull; ACTION</div>
              <p className="text-sm font-bold mt-4 text-zinc-900 dark:text-zinc-100">Reducing private commute vehicle use</p>
              <div className="text-xs text-gray-400 mt-auto">Transitioning commutes to light EV networks.</div>
            </div>

            {/* Node 2 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between h-48 text-left ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="text-[10px] font-mono text-[#2563EB] font-bold">STAGE 02 &bull; COMPUTE</div>
              <p className="text-sm font-bold mt-4 text-zinc-900 dark:text-zinc-100">Lower global metric tonnes of CO2e</p>
              <div className="text-xs text-gray-400 mt-auto">Direct downward shift in daily recorded emission loads.</div>
            </div>

            {/* Node 3 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between h-48 text-left ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="text-[10px] font-mono text-[#2563EB] font-bold">STAGE 03 &bull; ATMOSPHERE</div>
              <p className="text-sm font-bold mt-4 text-zinc-900 dark:text-zinc-100">Cleaner air & lower regional PM2.5</p>
              <div className="text-xs text-gray-400 mt-auto">Physical relief to surrounding urban atmosphere metrics.</div>
            </div>

            {/* Node 4 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between h-48 text-left bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] border-brand-secondary/30 shadow-md`}>
              <div className="text-[10px] font-mono text-zinc-200 font-bold">STAGE 04 &bull; PLANET</div>
              <p className="text-sm font-bold text-white mt-4">Healthier, sustainable ecosystem states</p>
              <div className="text-xs text-slate-100/70 mt-auto">Sustaining dynamic biological environments for tomorrow.</div>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          Challenges List Section
         ----------------------------------------------------------------- */}
      <section className="py-24" id="challenges-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase font-mono">Active Platform Campaigns</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl">SaaS Campaigns Generating Results</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Check the standard structured challenges accessible on our system. Complete them to build profile rank and score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="challenges-grid">
            
            {/* Play 1 */}
            <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-64 ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="play-one">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/15 px-2 py-0.5 rounded border border-red-500/10">Hard</span>
                <span className="text-xs text-brand-primary font-bold">+300 Points</span>
              </div>
              <div className="my-auto space-y-1.5">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">No Plastic Week</h4>
                <p className="text-xs text-slate-400">Adopt compostable containers, refusing all synthetic carry bags.</p>
              </div>
              <div className="border-t border-gray-400/10 pt-3 flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase">
                <span>1,249 Active Enrolled</span>
                <button onClick={onLaunchApp} className="text-brand-primary hover:underline flex items-center">Join &rarr;</button>
              </div>
            </div>

            {/* Play 2 */}
            <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-64 ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="play-two">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/15 px-2 py-0.5 rounded border border-amber-500/10">Medium</span>
                <span className="text-xs text-brand-primary font-bold">+200 Points</span>
              </div>
              <div className="my-auto space-y-1.5">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Green Commute Trail</h4>
                <p className="text-xs text-slate-400">Ditch single occupant petrol transits for light public EV or cycle rails.</p>
              </div>
              <div className="border-t border-gray-400/10 pt-3 flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase">
                <span>2,842 Active Enrolled</span>
                <button onClick={onLaunchApp} className="text-brand-primary hover:underline flex items-center">Join &rarr;</button>
              </div>
            </div>

            {/* Play 3 */}
            <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-64 ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="play-three">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-[#2563EB] bg-blue-950/15 px-2 py-0.5 rounded border border-blue-500/10">Easy</span>
                <span className="text-xs text-brand-primary font-bold">+150 Points</span>
              </div>
              <div className="my-auto space-y-1.5">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Vampire Draw Slayer</h4>
                <p className="text-xs text-slate-400">Power down all TV, AC standby chargers and screens overnight.</p>
              </div>
              <div className="border-t border-gray-400/10 pt-3 flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase">
                <span>4,105 Active Enrolled</span>
                <button onClick={onLaunchApp} className="text-brand-primary hover:underline flex items-center">Join &rarr;</button>
              </div>
            </div>

            {/* Play 4 */}
            <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-64 ${
              isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-sm'
            }`} id="play-four">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-[#2563EB] bg-blue-950/15 px-2 py-0.5 rounded border border-blue-500/10">Easy</span>
                <span className="text-xs text-brand-primary font-bold">+100 Points</span>
              </div>
              <div className="my-auto space-y-1.5">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Recycling Routine</h4>
                <p className="text-xs text-slate-400">Verify compost sectors and drop plastic to certified municipality hubs.</p>
              </div>
              <div className="border-t border-gray-400/10 pt-3 flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase">
                <span>3,491 Active Enrolled</span>
                <button onClick={onLaunchApp} className="text-brand-primary hover:underline flex items-center">Join &rarr;</button>
              </div>
            </div>

          </div>
        </div>
      </section>

        {/* -----------------------------------------------------------------
        Testimonials Section
         ----------------------------------------------------------------- */}
      <section className={`py-24 border-t ${
        isDarkMode ? 'bg-[#18181B]/10 border-zinc-900/30' : 'bg-zinc-50 border-zinc-200'
      }`} id="testimonials">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Case Reviews</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl">Sovereign Validation From Key Advocates</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Review the direct, real feedback from sustainability coordinators and active planetary stewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="testimonials-grid">
            
            {/* Review 1 */}
            <div className={`p-8 rounded-2xl flex flex-col justify-between space-y-6 text-left ${
              isDarkMode ? 'bg-[#18181B] border border-[#3F3F46]/30' : 'bg-white border border-zinc-200 shadow-sm'
            }`}>
              <div className="flex space-x-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(x => <Star key={x} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-750'}`}>
                "CarbonIQ is easily the most polished environmental tracking app I have seen. The direct regional calculations are extremely reliable, and their PDF statements allow us to present dynamic targets instantly."
              </p>
              <div className="flex items-center space-x-3.5 border-t border-gray-450/10 pt-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 text-xs font-bold text-brand-primary flex items-center justify-center border border-brand-primary/20">
                  MC
                </div>
                <div>
                  <h5 className="font-bold text-xs">Marcus Vance</h5>
                  <p className="text-[10px] text-gray-400">Sustainability Architect, SF Board</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className={`p-8 rounded-2xl flex flex-col justify-between space-y-6 text-left ${
              isDarkMode ? 'bg-[#18181B] border border-[#3F3F46]/30' : 'bg-white border border-zinc-200 shadow-sm'
            }`}>
              <div className="flex space-x-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(x => <Star key={x} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-750'}`}>
                "Having a server-side AI interface integrated to analyze commute metrics changed how our household targets fuel reduction. Our annual projected score dropped by 45% in 3 months."
              </p>
              <div className="flex items-center space-x-3.5 border-t border-gray-450/10 pt-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 text-xs font-bold text-brand-primary flex items-center justify-center border border-brand-primary/20">
                  LN
                </div>
                <div>
                  <h5 className="font-bold text-xs">Leah Novella</h5>
                  <p className="text-[10px] text-gray-400">Coordinator, Eco-Network Berlin</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className={`p-8 rounded-2xl flex flex-col justify-between space-y-6 text-left ${
              isDarkMode ? 'bg-[#18181B] border border-[#3F3F46]/30' : 'bg-white border border-zinc-200 shadow-sm'
            }`}>
              <div className="flex space-x-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(x => <Star key={x} className="w-4.5 h-4.5 fill-current" />)}
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-755'}`}>
                "Our employees competed weekly in the 'Green Commute' and 'Vampire Draw' campaigns. The gamified point mechanics made environmental compliance exciting and straightforward."
              </p>
              <div className="flex items-center space-x-3.5 border-t border-gray-450/10 pt-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 text-xs font-bold text-brand-primary flex items-center justify-center border border-brand-primary/20">
                  DK
                </div>
                <div>
                  <h5 className="font-bold text-xs">Devon Kincaide</h5>
                  <p className="text-[10px] text-gray-400">Chief Impact Officer, Novas Inc.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------
          FAQ Section (Expandable accordions)
         ----------------------------------------------------------------- */}
      <section className="py-24" id="faq">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-4">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase font-mono">Platform FAQ Care</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl">Common Inquiries Solved</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Check the structural questions surrounding calculation metrics, secure profiles, and platform use.
            </p>
          </div>

          <div className="space-y-4" id="faq-accordions-stack">
            {[
              {
                q: "What is a carbon footprint and how does CarbonIQ calculate it?",
                a: "A carbon footprint is the total greenhouse gas emissions caused directly and indirectly by an individual or organization, expressed in metric tons of carbon dioxide equivalent (CO2e). CarbonIQ utilizes highly validated EPA and IPCC geographic emission factors to calculate footprint totals instantly from transportation mileage, electrical kilowatt-hours, nutrition style and shopping materials."
              },
              {
                q: "How precise and accurate are the AI insights and recommendations?",
                a: "All strategic recommendations are powered server-side. The system checks your calculated category intensities against local demographic targets, ensuring that recommendations correspond to actionable pathways with real-world savings estimates based on verified alternative carbon costs."
              },
              {
                q: "Is my personal data protected and secure?",
                a: "Absolutely. CarbonIQ implements standard client and backend protection structures. Your demographic parameters, calculations and profile records are kept confidential and are never sold or distributed."
              },
              {
                q: "Can I download fully detailed carbon reports?",
                a: "Yes. In the dashboard view, simply click the 'Download Report' button to generate a clean, production-grade PDF compiling your exact demographics, sustainability score, structured category breakdown charts, and active campaign objectives instantly."
              },
              {
                q: "Do I have to pay to use the basic features?",
                a: "No, CarbonIQ includes a high-fidelity 'Try Demo' mode that is completely free of charge, running on pre-configured demographic profiles so visitors can view interface structures before creating their own profiles."
              }
            ].map((item, idx) => {
              const isOpen = faqOpenIdx === idx;
              return (
                <div 
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all text-left ${
                    isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200'
                  }`}
                  id={`faq-accordion-${idx}`}
                >
                  <button
                    onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                    className="w-full p-5 flex justify-between items-center font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 uppercase tracking-wide hover:bg-blue-500/5 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#2563EB]" /> : <ChevronDown className="w-4 h-4 text-[#2563EB]" />}
                  </button>
                  
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-[#3F3F46]/15 font-medium text-xs sm:text-sm text-gray-400 leading-relaxed bg-zinc-50/50 dark:bg-zinc-800/20">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* -----------------------------------------------------------------
          Contact Section
         ----------------------------------------------------------------- */}
      <section className={`py-24 border-t ${
        isDarkMode ? 'bg-[#09090B] border-[#3F3F46]/20 font-bold' : 'bg-[#FAFAF9] border-zinc-200'
      }`} id="contact">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4" id="contact-header">
            <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase font-mono">Transmission Terminal</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl" id="contact-title" style={{ color: isDarkMode ? '#FFFFFF' : '#111827' }}>Connect With Our Climate Lab</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-650'}`}>
              Have questions about carbon metrics, enterprise api keys, regional factors, or need account assistance? Emit a message directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch" id="contact-main">
            
            {/* Left side: Coordinates info */}
            <div className="lg:col-span-5 flex flex-col justify-between text-left space-y-8" id="contact-details-col">
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">Enterprise Communications Office</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our core data systems are managed and analyzed securely. If you are representing a municipality, educational sector, or sustainability NGO, declare your subject category to reach the specialized terminal.
                </p>

                <div className="space-y-4 text-xs font-semibold" id="contact-coordinates-list">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                      <Globe className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Global Lab Headquarters</p>
                      <p className="text-zinc-900 dark:text-zinc-100">One Maritime Plaza, San Francisco, CA 94111, United States</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Direct Communication Terminal</p>
                      <p className="text-zinc-900 dark:text-zinc-100">support@carboniq.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status block */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-zinc-50 border-zinc-200'
              }`} id="contact-status-pnl">
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-[#2563EB] font-bold">&bull; LAB_STATUS: ONLINE</span>
                  <span className="text-gray-400">LATENCY: &lt;14ms</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Support terminals are actively processing. General queries receive comprehensive, human audits within 1 hour.
                </p>
              </div>

            </div>

            {/* Right side: Form card */}
            <div className="lg:col-span-7" id="contact-form-col">
              <div className={`p-8 rounded-3xl border text-left ${
                isDarkMode ? 'bg-[#18181B] border-[#3F3F46]/30' : 'bg-white border-zinc-200 shadow-md'
              }`} id="contact-form-card">
                
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Name</label>
                      <input 
                        type="text"
                        placeholder="John Doe"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/50 ${
                          isDarkMode 
                            ? 'bg-[#18181B]/40 border-[#3F3F46]/40 text-white placeholder-slate-650' 
                            : 'bg-slate-50 border-zinc-250 text-zinc-900 placeholder-gray-400'
                        }`}
                        disabled={contactSubmitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Email Address</label>
                      <input 
                        type="email"
                        placeholder="john.doe@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/50 ${
                          isDarkMode 
                            ? 'bg-[#18181B]/40 border-[#3F3F46]/40 text-white placeholder-slate-650' 
                            : 'bg-slate-50 border-zinc-250 text-zinc-900 placeholder-gray-400'
                        }`}
                        disabled={contactSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Message Category</label>
                    <select 
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/50 ${
                        isDarkMode 
                          ? 'bg-zinc-900 border-[#3F3F46]/60 text-zinc-100' 
                          : 'bg-slate-50 border-zinc-250 text-zinc-900'
                      }`}
                      style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                      disabled={contactSubmitting}
                    >
                      <option value="general">💼 General Communication / Support</option>
                      <option value="enterprise">🏢 Enterprise NGO / Corporate Accounts</option>
                      <option value="api">🔌 API Keys & Calculations Integrations</option>
                      <option value="corrections">🏛️ Regional Factors Updates / Corrections</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Message Content</label>
                    <textarea 
                      rows={4}
                      placeholder="Enter your message parameters here (minimum 10 characters)..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/50 resize-none ${
                        isDarkMode 
                          ? 'bg-[#18181B]/40 border-[#3F3F46]/40 text-white placeholder-slate-650' 
                          : 'bg-slate-50 border-zinc-250 text-zinc-900 placeholder-gray-400'
                      }`}
                      disabled={contactSubmitting}
                    />
                  </div>

                  {/* Feedback notices */}
                  {contactError && (
                    <div className="p-3.5 rounded-xl bg-red-950/15 border border-red-500/15 text-red-400 text-xs font-medium">
                      ⚠️ {contactError}
                    </div>
                  )}

                  {contactSuccess && (
                     <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/15 text-emerald-400 text-xs font-medium flex items-center gap-2">
                       <Check className="w-4 h-4 flex-shrink-0" />
                       <span>Transmission completed! Your message has been routed secure-end via CarbonIQ Labs.</span>
                     </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    disabled={contactSubmitting}
                  >
                    {contactSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting secure-end...</span>
                      </>
                    ) : (
                      <>
                        <span>Emit Secure Message</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                </form>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* -----------------------------------------------------------------
          Powerful Call to Action Area (Glow accent card)
         ----------------------------------------------------------------- */}
      <section className="py-20" id="call-to-action-sec font-bold">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-10 sm:p-16 text-center space-y-8 shadow-2xl" id="cta-glow-card">
            
            {/* Ambient vector lights backdrop */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <span className="text-xs font-bold tracking-widest text-[#2563EB] uppercase font-mono">Planetary Stewardship</span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight">
                Ready to understand your environmental impact?
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Configure your demographic profiles, calculate high-integrity emission parameters, adopt targeted community missions, and save metric tons of carbon starting today.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 relative z-10" id="cta-button-block">
              <button
                onClick={onLaunchApp}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4.5 rounded-xl shadow-[0_5px_25px_rgba(37,99,235,0.35)] transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onTryDemo}
                className="bg-[#18181B] hover:bg-zinc-850 text-white border border-zinc-750 font-bold text-xs uppercase tracking-widest px-8 py-4.5 rounded-xl transition-colors cursor-pointer"
              >
                Explore Demo Instance
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* -----------------------------------------------------------------
          Corporate Sitemap Footer  
         ----------------------------------------------------------------- */}
      <footer className={`py-16 border-t ${
        isDarkMode ? 'bg-[#09090B] border-[#3F3F46]/25 text-zinc-400' : 'bg-[#FAFAF9] border-zinc-200 text-zinc-800'
      }`} id="app-footer">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-zinc-800/15" id="footer-sitemap-grid">
            
            {/* Col 1 Brand descriptive */}
            <div className="md:col-span-4 space-y-5 text-left" id="sitemap-brand">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-[#2563EB] rounded-xl flex items-center justify-center">
                  <Leaf className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight text-[#2563EB] font-display">CarbonIQ</span>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed">
                Our high-integrity SaaS platform targets direct daily carbon tracking, leveraging secure server-side neural optimizations to formulate quantified Reduction Strategies for planetary health inside modern urban regions.
              </p>

              <div className="flex space-x-3" id="footer-social-icons">
                <span className="text-xs font-mono text-[#2563EB] font-bold">@CARBONIQ_INTEL</span>
              </div>
            </div>

            {/* Col 2 features links */}
            <div className="md:col-span-2 text-left" id="sitemap-features">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-[#2563EB] mb-4 font-mono">Core Apps</h5>
              <ul className="space-y-3 text-xs text-gray-400 font-semibold uppercase">
                <li><a onClick={onLaunchApp} className="hover:text-white transition-colors cursor-pointer">Calculator</a></li>
                <li><a onClick={onLaunchApp} className="hover:text-white transition-colors cursor-pointer">AI Insights</a></li>
                <li><a onClick={onLaunchApp} className="hover:text-white transition-colors cursor-pointer">Leaderboards</a></li>
                <li><a onClick={onLaunchApp} className="hover:text-white transition-colors cursor-pointer">SaaS Camps</a></li>
              </ul>
            </div>

            {/* Col 3 company info */}
            <div className="md:col-span-2 text-left" id="sitemap-company">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-[#2563EB] mb-4 font-mono">Ecosystem</h5>
              <ul className="space-y-3 text-xs text-gray-400 font-semibold uppercase">
                <li><a href="#stats" className="hover:text-white transition-colors">Global Index</a></li>
                <li><a href="#about-carboniq-sec" className="hover:text-white transition-colors">Paradigm</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Stewardship</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Faq Support</a></li>
              </ul>
            </div>

            {/* Col 4 legal stuff */}
            <div className="md:col-span-4 text-left" id="sitemap-regulatory">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-[#2563EB] mb-4 font-mono">Regulatory Statements</h5>
              <p className="text-[11px] text-gray-400 leading-normal mb-3">
                Calculations are mapped directly to standard geographical parameters without private resale or distribution actions.
              </p>
              <div className="flex flex-wrap gap-3.5 text-[10px] font-mono text-gray-500 uppercase">
                <a className="hover:text-white cursor-pointer" onClick={onLaunchApp}>Privacy Policy</a>
                <span>&bull;</span>
                <a className="hover:text-white cursor-pointer" onClick={onLaunchApp}>Terms of Care</a>
                <span>&bull;</span>
                <a className="hover:text-white cursor-pointer" onClick={onLaunchApp}>Sovereign Standards</a>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-[11px] text-gray-500 font-semibold" id="footer-bottom-copyright">
            <p>
              &copy; {new Date().getFullYear()} CarbonIQ Inc. Developed on high-fidelity server-side environmental logic systems.
            </p>
            <p className="font-mono text-[10px] text-brand-primary/60 uppercase select-none">
              SECURE_ENCRYPTION_CONNECTED_SHA256
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
