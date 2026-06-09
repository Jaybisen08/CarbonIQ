import React, { useState } from 'react';
import { EmissionsBreakdown } from '../types';
import { Leaf, Flame, Shield, ArrowUpRight, ArrowDownRight, TrendingDown, DollarSign, Award, Info, Zap } from 'lucide-react';

interface DashboardProps {
  calculations: EmissionsBreakdown[];
  isDarkMode: boolean;
  onNavigate: (view: string) => void;
  userName: string;
  isDemoMode?: boolean;
}

export default function Dashboard({
  calculations,
  isDarkMode,
  onNavigate,
  userName,
  isDemoMode = false
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'transport' | 'electricity' | 'food' | 'lifestyle'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Fallback if no calculations exist
  const hasData = calculations && calculations.length > 0;
  const currentCalc: EmissionsBreakdown = hasData 
    ? calculations[calculations.length - 1] 
    : { date: 'N/A', transportation: 0, electricity: 0, food: 0, lifestyle: 0, total: 0, sustainabilityScore: 0 };

  // Calculate stats based on real history
  const monthlyFootprint = currentCalc.total;
  const annualFootprint = monthlyFootprint * 12;
  const sustainabilityScore = currentCalc.sustainabilityScore || 0;

  // Progress relative to first calculation
  let reductionPercent = 0;
  let isReduction = true;
  if (calculations && calculations.length > 1) {
    const startVal = calculations[0].total;
    const endVal = currentCalc.total;
    const diff = startVal - endVal;
    reductionPercent = Math.round((diff / (startVal || 1)) * 100);
    if (reductionPercent < 0) {
      isReduction = false;
      reductionPercent = Math.abs(reductionPercent);
    }
  }

  // Emission categories structure 
  const breakdownRatios = [
    { name: 'Transportation', amount: currentCalc.transportation, color: '#2563EB', text: 'Daily driving and airline travel' },
    { name: 'Electricity', amount: currentCalc.electricity, color: '#06B6D4', text: 'HVAC systems and lighting' },
    { name: 'Diet & Nutrition', amount: currentCalc.food, color: '#22C55E', text: 'Groceries, waste and diets' },
    { name: 'Lifestyle/Comms', amount: currentCalc.lifestyle, color: '#8B5CF6', text: 'Shopping and home appliances' }
  ];

  const totalSum = breakdownRatios.reduce((acc, r) => acc + r.amount, 0) || 1;

  // Custom SVG line/area charts coordinates builder (scaled cleanly for width 640 and height 240)
  const drawLineAreaChart = () => {
    if (calculations.length < 2) {
      // Return a clean graphic overview with simple baseline lines
      return (
        <div className="h-48 flex items-center justify-center border border-dashed rounded-xl border-gray-400/20 text-center p-6" id="chart-no-history">
          <div className="space-y-2">
            <TrendingDown className="w-8 h-8 text-brand-primary mx-auto opacity-70" />
            <p className="text-sm font-semibold">Longitudinal Curves Initializing</p>
            <p className="text-xs text-gray-400 max-w-sm">Complete your carbon questionnaire to construct custom historical tracking graphs.</p>
          </div>
        </div>
      );
    }

    const width = 640;
    const height = 200;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 25;

    // Scale helpers
    const maxVal = Math.max(...calculations.map((c) => c.total), 300) * 1.15;
    const count = calculations.length;

    const getX = (index: number) => {
      const graphWidth = width - paddingLeft - paddingRight;
      return paddingLeft + (index / (count - 1)) * graphWidth;
    };

    const getY = (value: number) => {
      const graphHeight = height - paddingTop - paddingBottom;
      return paddingTop + graphHeight - (value / maxVal) * graphHeight;
    };

    // Construct line paths
    let pathObj = '';
    let areaObj = '';

    calculations.forEach((c, idx) => {
      const x = getX(idx);
      const y = getY(c.total);
      if (idx === 0) {
        pathObj += `M ${x} ${y}`;
        areaObj += `M ${x} ${height - paddingBottom} L ${x} ${y}`;
      } else {
        pathObj += ` L ${x} ${y}`;
        areaObj += ` L ${x} ${y}`;
      }
      
      if (idx === count - 1) {
        areaObj += ` L ${x} ${height - paddingBottom} Z`;
      }
    });

    const gridlines = [0.25, 0.5, 0.75, 1];

    return (
      <div className="relative w-full" id="svg-analytics-chart">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none" id="carbon-curves-svg">
          {/* Subtle definitions */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridlines.map((p, gIdx) => {
            const val = maxVal * p;
            const y = getY(val);
            return (
              <g key={`grid-${gIdx}`} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke={isDarkMode ? 'rgba(216,243,220,0.06)' : 'rgba(0,0,0,0.05)'} 
                  strokeDasharray="2,4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 3} 
                  fontSize="8" 
                  fontFamily="monospace" 
                  fill={isDarkMode ? '#D8F3DC' : '#6b7280'} 
                  textAnchor="end"
                >
                  {Math.round(val)}kg
                </text>
              </g>
            );
          })}

          {/* Render Area Filled Gradient */}
          <path d={areaObj} fill="url(#areaGrad)" />

          {/* Render Main Curve Line */}
          <path d={pathObj} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Highlight Circles on curve */}
          {calculations.map((c, idx) => {
            const x = getX(idx);
            const y = getY(c.total);
            const isHovered = hoveredPoint === idx;

            return (
              <g 
                key={`pt-${idx}`} 
                onMouseEnter={() => setHoveredPoint(idx)} 
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Big glow marker if hovered */}
                {isHovered && (
                  <circle cx={x} cy={y} r="8" fill="#2563EB" fillOpacity="0.3" className="animate-ping" />
                )}
                <circle 
                  cx={x} 
                  cy={y} 
                  r={isHovered ? '5' : '3.5'} 
                  fill={isDarkMode ? '#09090B' : '#ffffff'} 
                  stroke="#2563EB" 
                  strokeWidth="2.5" 
                />
                
                {/* Months ticks labels along Bottom axis */}
                <text 
                  x={x} 
                  y={height - 8} 
                  fontSize="9" 
                  fill={isDarkMode ? '#D8F3DC' : '#6b7280'} 
                  fontWeight="500" 
                  textAnchor="middle"
                >
                  {c.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Interactive Tooltip */}
        {hoveredPoint !== null && calculations[hoveredPoint] && (
          <div 
            className={`absolute z-10 bottom-full mb-2 p-3 rounded-lg border text-xs shadow-md transition-all ${isDarkMode ? 'bg-brand-dark-surface border-brand-dark-surface-sec text-white' : 'bg-white border-gray-200 text-gray-800'}`}
            style={{
              left: `${Math.min(85, Math.max(10, (hoveredPoint / (calculations.length - 1)) * 100))}%`,
              transform: 'translateX(-50%)'
            }}
            id="chart-tooltip"
          >
            <p className="font-bold underline text-[11px] text-brand-primary">{calculations[hoveredPoint].date} Assessment</p>
            <div className="space-y-1 mt-1 font-mono">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Total footprint:</span>
                <span className="font-bold">{calculations[hoveredPoint].total} kg CO₂</span>
              </div>
              <div className="flex justify-between gap-4 text-brand-primary text-[10px]">
                <span>Score index:</span>
                <span className="font-bold">{calculations[hoveredPoint].sustainabilityScore}/100</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8" id="dashboard-view">
      
      {isDemoMode && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left animate-pulse" id="demo-mode-headline-banner">
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-display font-semibold text-sm text-amber-500/95">Demo Mode Active</p>
              <p className="text-xs text-amber-500/75">Demo Mode - This data is for demonstration purposes only.</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('profile')}
            className="text-xs bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all self-start sm:self-auto uppercase tracking-wider"
          >
            Register / Sign Up
          </button>
        </div>
      )}
      
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="dash-heading">
        <div>
          <h1 className="text-2xl font-bold font-display">Welcome Back, {userName || 'Sarah Chen'}</h1>
          <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
            Audit your carbon intelligence, monitor longitudinal metrics, and execute reduction recommendations.
          </p>
        </div>

        <div className="flex gap-3" id="dash-head-actions">
          <button 
            onClick={() => onNavigate('calculator')}
            className="text-xs bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
            id="dash-btn-calc"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>New Calculation</span>
          </button>
          
          <button 
            onClick={() => {
              if (hasData) {
                onNavigate('reports');
              }
            }}
            disabled={!hasData}
            title={!hasData ? "Complete your assessment to generate your personalized report." : "Download your PDF report"}
            className={`text-xs font-semibold py-2.5 px-4 rounded-lg border transition-all ${
              !hasData 
                ? 'opacity-60 cursor-not-allowed bg-gray-500/5 text-gray-500 border-gray-400/20' 
                : isDarkMode 
                  ? 'border-brand-dark-surface hover:bg-brand-dark-surface text-white' 
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700'
            }`}
            id="dash-btn-report"
          >
            {!hasData ? "Complete your assessment to generate your personalized report." : "📄 Download Report"}
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="dash-kpi-grid">
        
        {/* KPI 1: Monthly Footprint */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/50 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-sm'}`} id="kpi-monthly">
          <div className="flex justify-between items-center" id="kpi-m1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-400'}`}>Monthly Footprint</span>
            <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4" id="kpi-m1-val">
            <p className="text-3xl font-bold tracking-tight font-display">{hasData ? monthlyFootprint : '—'} <span className="text-sm font-mono text-gray-400">kg CO₂e</span></p>
            {hasData ? (
              <p className="text-xs text-gray-400 mt-1">Equivalent to driving {(monthlyFootprint * 5).toLocaleString()} km in a standard car.</p>
            ) : (
              <p className="text-xs text-red-400 mt-1">Zero assessments logged. Compute footprint now.</p>
            )}
          </div>
        </div>

        {/* KPI 2: Annual Extrapolated Footprint */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/50 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-sm'}`} id="kpi-annual">
          <div className="flex justify-between items-center" id="kpi-m2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-400'}`}>Extrapolated Annual</span>
            <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4" id="kpi-m2-val">
            <p className="text-3xl font-bold tracking-tight font-display">
              {hasData ? (annualFootprint / 1000).toFixed(1) : '—'} <span className="text-sm font-mono text-gray-400">metric tons</span>
            </p>
            {hasData ? (
              <p className="text-xs text-brand-primary mt-1">Global safe carbon cap budget targets ~2.0 tons per individual.</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Estimates scale following your first calculator input.</p>
            )}
          </div>
        </div>

        {/* KPI 3: Sustainability Index Score */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/50 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-sm'}`} id="kpi-score">
          <div className="flex justify-between items-center" id="kpi-m3">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-400'}`}>Sustainability Index</span>
            <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4" id="kpi-m3-val">
            <p className="text-3xl font-bold tracking-tight font-display">{hasData ? `${sustainabilityScore}` : '—'}<span className="text-lg font-mono text-gray-400">/100</span></p>
            {hasData ? (
              <div className="flex items-center space-x-1 mt-1 text-xs text-brand-primary">
                <Award className="w-3.5 h-3.5" />
                <span>Excellent compliance. Level: Gold</span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Weighted metric balancing your lifestyle offsets.</p>
            )}
          </div>
        </div>

        {/* KPI 4: Category Decarbonization Change Progress */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/50 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-sm'}`} id="kpi-progress">
          <div className="flex justify-between items-center" id="kpi-m4">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-400'}`}>Reductions Rate</span>
            <div className="bg-brand-primary/10 text-brand-primary p-1.5 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4" id="kpi-m4-val">
            {calculations.length >= 2 ? (
              <>
                <p className={`text-3xl font-bold tracking-tight font-display flex items-center ${isReduction ? 'text-brand-primary' : 'text-red-400'}`}>
                  {isReduction ? '-' : '+'}{reductionPercent}%
                  {isReduction ? <ArrowDownRight className="w-5 h-5 ml-1" /> : <ArrowUpRight className="w-5 h-5 ml-1" />}
                </p>
                <p className="text-xs text-gray-400 mt-1">Compared to your first calculated baseline audit.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold mt-1">Awaiting secondary audit</p>
                <p className="text-xs text-gray-400 mt-1">Requires at least 2 historical calculations to map trends.</p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Main Panel grid: Chart curves on left, breakdowns segment details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dash-analytics-grid">
        
        {/* Left Side: Long-term trend curves */}
        <div className={`lg:col-span-8 p-6 rounded-2xl border ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-sm'}`} id="panel-chart">
          <div className="flex justify-between items-center mb-6" id="chart-heading">
            <div>
              <h3 className="font-display font-semibold text-lg">Decarbonization Over Time</h3>
              <p className="text-xs text-gray-400">Refining carbon performance curves mapped across preceding active periods.</p>
            </div>
            
            <div className="flex bg-gray-500/10 rounded-lg p-0.5 border border-gray-400/10 text-[10px] font-semibold" id="chart-filters">
              <button onClick={() => setActiveTab('all')} className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'all' ? 'bg-brand-primary text-brand-dark-bg font-bold' : 'text-gray-400 hover:text-white'}`}>All-Time</button>
            </div>
          </div>

          {drawLineAreaChart()}
        </div>

        {/* Right Side: Proportions Split Doughnut bars */}
        <div className={`lg:col-span-4 p-6 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-sm'}`} id="panel-breakdown">
          <div id="breakdown-details-header">
            <h3 className="font-display font-semibold text-lg mb-1">Carbon Ratios Split</h3>
            <p className="text-xs text-gray-400">Current proportional impact of lifestyle categories.</p>
          </div>

          {/* Proportional breakdown cards stacked */}
          <div className="space-y-4 my-6" id="breakdown-cards">
            {breakdownRatios.map((item, idx) => {
              const proportion = Math.max(1, Math.round((item.amount / totalSum) * 100));
              return (
                <div key={`br-${idx}`} className="space-y-1.5" id={`ratio-stacked-${idx}`}>
                  <div className="flex justify-between text-xs font-medium" id="stacked-names">
                    <span className="flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="font-mono">{item.amount} kg ({proportion}%)</span>
                  </div>
                  
                  {/* Styled horizontal progress track */}
                  <div className={`w-full h-1.5 rounded-full relative ${isDarkMode ? 'bg-brand-dark-surface' : 'bg-gray-100'}`} id="bar-track">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: hasData ? `${proportion}%` : '0%',
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Environmental contextual alert line */}
          <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/10 flex items-start space-x-2 text-[10px] text-gray-400" id="environmental-context">
            <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
            <p className="leading-normal">
              {calculations.length > 0 && currentCalc.transportation > currentCalc.electricity ? (
                <span><strong>Priority focus:</strong> Transportation is your leading sector. Visit the <strong>AI Insights</strong> menu to discover ways to offset driving expenses and flight weights.</span>
              ) : (
                <span>Optimize home electrical cooling times. Setting AC thermostats 1°C lower saves 10% on grid emissions annually.</span>
              )}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
