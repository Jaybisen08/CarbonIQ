import React, { useState } from 'react';
import { CarbonCalculatorData, EmissionsBreakdown } from '../types';
import { safeFetchJson } from '../utils/api';
import { Car, Zap, Utensils, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle, Calculator, ChevronRight, RefreshCw, Flame, Shield, Award } from 'lucide-react';

interface CarbonCalculatorProps {
  userEmail: string;
  isDarkMode: boolean;
  onCalculationCompleted: (data: EmissionsBreakdown, history: EmissionsBreakdown[]) => void;
  currentProfileDiet?: string;
  currentProfileTransport?: string;
}

export default function CarbonCalculator({
  userEmail,
  isDarkMode,
  onCalculationCompleted,
  currentProfileDiet,
  currentProfileTransport
}: CarbonCalculatorProps) {
  // Step indicator
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Completed result view state
  const [assessmentResult, setAssessmentResult] = useState<EmissionsBreakdown | null>(null);

  // Form states matching calculator fields
  const [formData, setFormData] = useState<CarbonCalculatorData>({
    vehicleType: (currentProfileTransport as any) || 'Gasoline',
    fuelType: 'Regular',
    dailyDistance: 25,
    flightsPerYear: 2,
    monthlyConsumption: 240,
    acUsage: 'Medium',
    renewableEnergy: false,
    dietType: (currentProfileDiet as any) || 'Flexitarian',
    dairyConsumption: 'Medium',
    foodWaste: 'Medium',
    shoppingFrequency: 'Occasionally',
    electronicsPurchases: 3,
    recyclingHabits: 'Sometimes'
  });

  const nextStep = () => setStep((s) => Math.min(5, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // Handle calculator submission to backend Express carbon engine
  const handleCalculateEmissions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Determine calendar date label for reporting
      const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
      const formattedDate = new Date().toLocaleDateString('en-US', dateOptions);

      const response = await fetch('/api/calculator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          calculatorData: formData,
          date: formattedDate
        })
      });

      const data = await safeFetchJson(response);

      setAssessmentResult(data.latestCalculation);
      onCalculationCompleted(data.latestCalculation, data.history);
      setStep(5); // Go to results step successfully
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection offline');
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setAssessmentResult(null);
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="calculator-section">
      
      {/* Title */}
      <div id="calculator-head">
        <h1 className="text-2xl font-bold font-display">Carbon Intelligence Calculator</h1>
        <p className={`text-xs ${isDarkMode ? 'text-brand-dark-text-sec' : 'text-gray-500'}`}>
          Input verified lifestyle configurations below. CarbonIQ performs precise weighted accounting calculations to construct your carbon signature.
        </p>
      </div>

      {/* Step Indicators Top Bar */}
      {step < 5 && (
        <div className={`grid grid-cols-4 gap-2 pb-2 border-b border-gray-400/10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} id="calculator-timeline">
          {[
            { sNum: 1, label: 'Transportation', icon: Car },
            { sNum: 2, label: 'Electricity Grid', icon: Zap },
            { sNum: 3, label: 'Diet & Food', icon: Utensils },
            { sNum: 4, label: 'Lifestyle', icon: ShoppingBag }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.sNum;
            const isCompleted = step > s.sNum;

            return (
              <div 
                key={s.sNum} 
                className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs transition-all ${
                  isActive 
                    ? 'border-brand-primary bg-brand-primary/10 font-bold text-brand-primary' 
                    : isCompleted 
                      ? 'border-brand-primary/40 bg-brand-primary/5 text-gray-400' 
                      : 'border-transparent text-gray-500'
                }`}
                id={`timeline-step-${s.sNum}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl font-mono text-center" id="calculator-error">
          Exception flagged: {errorMsg}
        </div>
      )}

      {/* STEP 1: TRANSPORTATION SECTION */}
      {step === 1 && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="step-transport">
          <div className="flex space-x-3 items-center" id="st-head">
            <div className="bg-brand-primary/15 text-brand-primary p-2 rounded-xl"><Car className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-semibold text-lg">Step 1: Transportation & Vehicle Auditing</h3>
              <p className="text-xs text-gray-400">Specify your main transit configurations and commute lengths.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="st-fields">
            {/* Vehicle Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Primary Commuter vehicle</label>
              <select 
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white focus:border-brand-primary' : 'bg-gray-50 border-gray-200 focus:border-brand-secondary'}`}
                id="select-vehicle-type"
              >
                <option value="Gasoline">Standard Gas Vehicle (Internal Combustion)</option>
                <option value="Hybrid">Hybrid Vehicle (Efficient electric/gas combo)</option>
                <option value="Electric">Battery Electric Vehicle (Zero Tailpipe emissions)</option>
                <option value="Public">Public Rails/Buses Transit</option>
                <option value="Walk/Bike">Walking, Running, or Bicycling (Zero Emissions)</option>
              </select>
            </div>

            {/* Daily Distance Input */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider">Average Daily Distance (km)</label>
                <span className="text-xs font-mono text-brand-primary font-bold">{formData.dailyDistance} km/day</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                value={formData.dailyDistance}
                onChange={(e) => setFormData({ ...formData, dailyDistance: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-500/20 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                id="range-daily-distance"
              />
              <p className="text-[10px] text-gray-400">Accumulates to roughly {formData.dailyDistance * 30} km of travel per month.</p>
            </div>

            {/* Flights Per Year Input */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider">Flights per calendar year</label>
                <span className="text-xs font-mono text-brand-primary font-bold">{formData.flightsPerYear} flights/year</span>
              </div>
              <input 
                type="number" 
                min="0" 
                max="50"
                value={formData.flightsPerYear}
                onChange={(e) => setFormData({ ...formData, flightsPerYear: Number(e.target.value) })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="num-flights-year"
              />
              <p className="text-[10px] text-gray-400">Includes short, medium, and intercontinental round-trip flight assessments.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4" id="st-nav">
            <button 
              onClick={nextStep}
              className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all flex items-center space-x-1"
              id="st-btn-next"
            >
              <span>Next Step: Grid Electricity</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ELECTRICITY SECTION */}
      {step === 2 && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="step-electricity">
          <div className="flex space-x-3 items-center" id="se-head">
            <div className="bg-brand-primary/15 text-brand-primary p-2 rounded-xl"><Zap className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-semibold text-lg">Step 2: Electricity Grid & AC Consumption</h3>
              <p className="text-xs text-gray-400">Evaluate utility power sourcing metrics and air conditioning utilization weights.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="se-fields">
            {/* Monthly consumption input */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider">Monthly Grid Electricity (kWh)</label>
                <span className="text-xs font-mono text-brand-primary font-bold">{formData.monthlyConsumption} kWh</span>
              </div>
              <input 
                type="number" 
                min="0" 
                max="2000"
                value={formData.monthlyConsumption}
                onChange={(e) => setFormData({ ...formData, monthlyConsumption: Number(e.target.value) })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="num-monthly-kwh"
              />
              <p className="text-[10px] text-gray-400">Average households consume around 150 kWh to 450 kWh per month.</p>
            </div>

            {/* AC Usage selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Air Conditioning (AC) Sizing</label>
              <select 
                value={formData.acUsage}
                onChange={(e) => setFormData({ ...formData, acUsage: e.target.value as any })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="select-ac-usage"
              >
                <option value="None">None / Off Entirely</option>
                <option value="Low">Low (Used occasionally during heatwaves)</option>
                <option value="Medium">Medium (Standard cooling schedules)</option>
                <option value="High">High (Operates 24/7 or heavy industrial AC grids)</option>
              </select>
            </div>

            {/* Renewable Energy toggle */}
            <div className="space-y-4 md:col-span-2 p-4 rounded-xl border border-dashed border-gray-400/20" id="renewable-container">
              <div className="flex items-center justify-between" id="renewable-row">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider">Utilize Renewable Energy Sourcing</h4>
                  <p className="text-xs text-gray-400 max-w-lg mt-0.5">Your power tariff is connected to a green solar grid tier or has rooftop photovoltaic cells. Saves 85% of standard grid intensities.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, renewableEnergy: !formData.renewableEnergy })}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-all outline-none ${
                    formData.renewableEnergy ? 'bg-brand-primary justify-end' : 'bg-gray-600 justify-start'
                  }`}
                  id="btn-renewable-toggle"
                >
                  <span className="bg-white w-5 h-5 rounded-full shadow"></span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-400/10" id="se-nav">
            <button 
              onClick={prevStep}
              className="text-xs font-semibold py-2.5 px-4 rounded-lg border flex items-center space-x-1 shadow-sm hover:bg-gray-500/10 transition-colors"
              id="se-btn-back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button 
              onClick={nextStep}
              className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all flex items-center space-x-1"
              id="se-btn-next"
            >
              <span>Next Step: Diet & Food</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FOOD SECTION */}
      {step === 3 && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="step-food">
          <div className="flex space-x-3 items-center" id="sf-head">
            <div className="bg-brand-primary/15 text-brand-primary p-2 rounded-xl"><Utensils className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-semibold text-lg">Step 3: Dietary Profile & Food Management</h3>
              <p className="text-xs text-gray-400">Calibrate carbon implications tied to diet types and household waste disposal rates.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="sf-fields">
            {/* Diet Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Dietary Profile Archetype</label>
              <select 
                value={formData.dietType}
                onChange={(e) => setFormData({ ...formData, dietType: e.target.value as any })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="select-diet"
              >
                <option value="Meat Lover">Meat Lover (Relies heavily on beef, pork, poultry)</option>
                <option value="Flexitarian">Flexitarian (Mixed diet with low meat consumption)</option>
                <option value="Vegetarian">Vegetarian (No meat, consumes dairy & eggs)</option>
                <option value="Vegan">Vegan (Strictly plant-based organic nutrition)</option>
              </select>
            </div>

            {/* Dairy Consumption */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Dairy Intake Levels</label>
              <select 
                value={formData.dairyConsumption}
                onChange={(e) => setFormData({ ...formData, dairyConsumption: e.target.value as any })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="select-dairy"
              >
                <option value="None">None</option>
                <option value="Low">Low (Minimal milks/cheese additives)</option>
                <option value="Medium">Medium (Balanced daily intake)</option>
                <option value="High">High (Heavy dairy incorporation)</option>
              </select>
            </div>

            {/* Food Waste */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Average Food Scrap Waste Rate</label>
              <select 
                value={formData.foodWaste}
                onChange={(e) => setFormData({ ...formData, foodWaste: e.target.value as any })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="select-waste"
              >
                <option value="None">Zero waste (Composting or zero disposal)</option>
                <option value="Low">Low (Repurpose everything, minor scrap loss)</option>
                <option value="Medium">Medium (Average consumer leftovers waste)</option>
                <option value="High">High (Heavy standard landfill dumps)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-400/10" id="sf-nav">
            <button 
              onClick={prevStep}
              className="text-xs font-semibold py-2.5 px-4 rounded-lg border flex items-center space-x-1 shadow-sm hover:bg-gray-500/10 transition-colors"
              id="sf-btn-back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button 
              onClick={nextStep}
              className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all flex items-center space-x-1"
              id="sf-btn-next"
            >
              <span>Next Step: Habits</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: LIFESTYLE & RECYCLING SECTION */}
      {step === 4 && (
        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200'}`} id="step-lifestyle">
          <div className="flex space-x-3 items-center" id="sl-head">
            <div className="bg-brand-primary/15 text-brand-primary p-2 rounded-xl"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <h3 className="font-display font-semibold text-lg">Step 4: Lifestyle Habits & Electronics Lifecycle</h3>
              <p className="text-xs text-gray-400">Evaluate shopping frequencies, manufacturing loads, and municipal recycling offsets.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="sl-fields">
            {/* Shopping Frequency */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Consumer Shopping Frequency</label>
              <select 
                value={formData.shoppingFrequency}
                onChange={(e) => setFormData({ ...formData, shoppingFrequency: e.target.value as any })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="select-shopping"
              >
                <option value="Rarely">Rarely (Repair-first mindsets / sustainable thrifting)</option>
                <option value="Occasionally">Occasionally (Moderate purchase additions)</option>
                <option value="Frequently">Frequently (Heavy online shopping packages)</option>
              </select>
            </div>

            {/* Electronic purchases */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">Heavy Electronics Purchased per Year</label>
              <input 
                type="number" 
                min="0" 
                max="30"
                value={formData.electronicsPurchases}
                onChange={(e) => setFormData({ ...formData, electronicsPurchases: Number(e.target.value) })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="num-electronics"
              />
              <p className="text-[10px] text-gray-400">Includes new smartphones, laptops, smart screens, and electrical kitchen utilities.</p>
            </div>

            {/* Recycling */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider block">General Recycling Habits</label>
              <select 
                value={formData.recyclingHabits}
                onChange={(e) => setFormData({ ...formData, recyclingHabits: e.target.value as any })}
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-brand-dark-bg border-brand-dark-surface-sec text-white' : 'bg-gray-50 border-gray-200'}`}
                id="select-recycling"
              >
                <option value="Always">Always (Full metals, plastics and paper separations)</option>
                <option value="Sometimes">Sometimes (Minor cardboard packaging recycling only)</option>
                <option value="Never">Never (Dispose standard junk mix together)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-400/10" id="sl-nav">
            <button 
              onClick={prevStep}
              className="text-xs font-semibold py-2.5 px-4 rounded-lg border flex items-center space-x-1 shadow-sm hover:bg-gray-500/10 transition-colors"
              id="sl-btn-back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button 
              onClick={handleCalculateEmissions}
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
              id="sl-btn-submit"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Calculations...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Footprint</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CALCULATED SUCCESSFUL SCREEN */}
      {step === 5 && assessmentResult && (
        <div className={`p-8 rounded-2xl border space-y-8 text-center relative overflow-hidden ${isDarkMode ? 'bg-brand-dark-surface/30 border-brand-dark-surface' : 'bg-white border-gray-200 shadow-sm'}`} id="step-results">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary"></div>
          
          <div className="mx-auto bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-brand-primary" id="success-bubble">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2" id="success-head">
            <h3 className="font-display font-bold text-2xl">Carbon Performance Curve Logged</h3>
            <p className="text-xs text-gray-400 max-w-lg mx-auto">Calculations saved in database storage. Sustainability score and category breakdowns updated successfully.</p>
          </div>

          {/* Quantified dashboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto" id="recent-results-cards">
            
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-brand-dark-bg/60 border-brand-dark-surface-sec' : 'bg-gray-50 border-gray-100'}`} id="res-footprint">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">MONTHLY FOOTPRINT</p>
              <p className="text-2xl font-bold font-display text-brand-primary mt-1">{assessmentResult.total} <span className="text-xs font-mono text-gray-400">kg CO₂e</span></p>
              <p className="text-[10px] text-gray-400 mt-2">Mapped following standard GWP multipliers.</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-brand-dark-bg/60 border-brand-dark-surface-sec' : 'bg-gray-50 border-gray-100'}`} id="res-score">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SUSTAINABILITY INDEX</p>
              <p className="text-2xl font-bold font-display text-emerald-400 mt-1">{assessmentResult.sustainabilityScore}<span className="text-xs font-mono text-gray-400">/100</span></p>
              <p className="text-[10px] text-gray-400 mt-2">Weighted average balancing offsets.</p>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-brand-dark-bg/60 border-brand-dark-surface-sec' : 'bg-gray-50 border-gray-100'}`} id="res-split">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">HIGHEST INTENSITY SECTOR</p>
              {(() => {
                const maxVal = Math.max(assessmentResult.transportation, assessmentResult.electricity, assessmentResult.food, assessmentResult.lifestyle);
                let text = 'Lifestyle';
                if (maxVal === assessmentResult.transportation) text = 'Transportation';
                else if (maxVal === assessmentResult.electricity) text = 'Electricity Grid';
                else if (maxVal === assessmentResult.food) text = 'Nutrition';

                return (
                  <p className="text-lg font-bold font-display text-red-400 mt-2 uppercase tracking-wide">
                    {text}
                  </p>
                );
              })()}
              <p className="text-[10px] text-gray-400 mt-2">Primary sector targetted for AI actions.</p>
            </div>

          </div>

          {/* Simple breakdown weights info */}
          <div className="max-w-xl mx-auto rounded-xl p-4 bg-gray-500/5 text-xs text-left grid grid-cols-2 gap-4 font-mono" id="suc-breakdown-subtotals">
            <div>
              <span className="text-gray-400">Transportation:</span> {assessmentResult.transportation} kg
            </div>
            <div>
              <span className="text-gray-400">Electricity Grid:</span> {assessmentResult.electricity} kg
            </div>
            <div>
              <span className="text-gray-400">Diet & Nutrition:</span> {assessmentResult.food} kg
            </div>
            <div>
              <span className="text-gray-400">Lifestyle Habits:</span> {assessmentResult.lifestyle} kg
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4" id="success-actions">
            <button 
              onClick={resetCalculator}
              className={`py-2.5 px-5 rounded-lg border text-xs font-semibold transition-all flex items-center space-x-1.5 ${isDarkMode ? 'border-brand-dark-surface-sec hover:bg-brand-dark-surface-sec' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}
              id="btn-res-recalc"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-calculate</span>
            </button>
            <button 
              onClick={() => onCalculationCompleted(assessmentResult, [])} // triggers default navigate and close
              className="bg-brand-primary hover:bg-brand-accent text-brand-dark-bg font-bold py-2.5 px-6 rounded-lg text-xs flex items-center space-x-1.5"
              id="btn-res-dashboard"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
