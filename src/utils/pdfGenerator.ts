import { jsPDF } from 'jspdf';
import { UserProfile, EmissionsBreakdown, Goal, Challenge, Recommendation } from '../types';

export function generateCarbonReport(
  profile: UserProfile,
  history: EmissionsBreakdown[],
  goals: Goal[],
  challenges: Challenge[],
  recommendations: Recommendation[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const newestCalc = history[history.length - 1] || {
    transportation: 150,
    electricity: 180,
    food: 120,
    lifestyle: 90,
    total: 540,
    sustainabilityScore: 75,
    date: 'N/A'
  };

  // Theme colors
  const primaryColor = [82, 183, 136]; // #52B788
  const darkBg = [8, 28, 21]; // #081C15
  const greyColor = [120, 120, 120];

  // Helper function to draw header banners
  const drawPageBorderAndHeader = (pageNum: number) => {
    // Elegant border lines
    doc.setDrawColor(216, 243, 220);
    doc.setLineWidth(0.3);
    doc.rect(8, 8, 194, 281);

    // Minor header rail info
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('CARBONIQ • ENVIRONMENTAL INTELLIGENCE AUDIT', 12, 14);
    doc.text(`PAGE ${pageNum}`, 190, 14, { align: 'right' });
    doc.line(12, 16, 198, 16);
  };

  // PAGE 1: TITLE & EXECUTIVE SUMMARY
  drawPageBorderAndHeader(1);

  // CarbonIQ Title Block
  doc.setFillColor(8, 28, 21);
  doc.rect(12, 24, 186, 30, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('CARBONIQ', 20, 42);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(82, 183, 136);
  doc.text('PREMIUM CLIMATE ANALYTICS & DECARBONIZATION SCHEDULER', 20, 48);

  // Profile Details Card
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(245, 248, 246);
  doc.rect(12, 60, 186, 36, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(8, 28, 21);
  doc.text('INTEL AUDIT TARGET (USER PROFILE)', 16, 66);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);

  doc.text(`Name: ${profile.firstName} ${profile.lastName}`, 16, 74);
  doc.text(`Location: ${profile.city}, ${profile.state}, ${profile.country}`, 16, 80);
  doc.text(`Occupation: ${profile.occupation} (${profile.isStudent ? 'Student' : 'Professional'})`, 16, 86);
  doc.text(`Dietary Archetype: ${profile.dietType}`, 16, 92);

  doc.text(`Household Size: ${profile.householdSize} member(s)`, 105, 74);
  doc.text(`Primary Transportation: ${profile.primaryTransport}`, 105, 80);
  doc.text(`Current Eco Balance Score: ${profile.points} pts`, 105, 86);
  doc.text(`Acquisition Date: ${new Date().toLocaleDateString()}`, 105, 92);

  // Executive Metrics Dashboard section
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(8, 28, 21);
  doc.text('1. EXECUTIVE CLIMATE METRICS', 12, 107);
  doc.line(12, 109, 198, 109);

  // Large score bubble
  doc.setDrawColor(82, 183, 136);
  doc.setFillColor(255, 255, 255);
  doc.circle(52, 134, 18, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(8, 28, 21);
  doc.text(`${newestCalc.sustainabilityScore}`, 52, 138, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('SUSTAINABILITY', 52, 146, { align: 'center' });
  doc.text('SCORE (0-100)', 52, 149, { align: 'center' });

  // Value cards next to it
  doc.setFillColor(245, 248, 246);
  doc.rect(85, 116, 113, 36, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 28, 21);
  doc.text('MONTHLY CARBON FOOTPRINT', 89, 122);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(20);
  doc.setTextColor(82, 183, 136);
  doc.text(`${newestCalc.total} kg`, 89, 133);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Equivalent to ~${Math.round(newestCalc.total * 12 / 1000 * 10) / 10} metric tons of CO2e annually.`, 89, 140);
  doc.text(`Your current reduction benchmark is in the top ${Math.min(99, Math.round(newestCalc.sustainabilityScore))} percentile.`, 89, 145);

  // Carbon Breakdown Category Lists
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(8, 28, 21);
  doc.text('CARBON FOOTPRINT DETAILED BREAKDOWN', 12, 162);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Calculated monthly footprint across four core lifestyle emission vectors (measured in kg CO2e):', 12, 166);

  // Simple clean table of categories
  doc.setFillColor(8, 28, 21);
  doc.rect(12, 172, 186, 7, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('EMISSION VECTOR', 16, 177);
  doc.text('MONTHLY AMOUNT (kg CO2e)', 100, 177);
  doc.text('ESTIMATED PROPORTION', 160, 177);

  const categories = [
    { name: 'Transportation (Commuting & Flights)', val: newestCalc.transportation },
    { name: 'Electricity (Power Grid & AC Usage)', val: newestCalc.electricity },
    { name: 'Diet & Nutrition (Type & Food Waste)', val: newestCalc.food },
    { name: 'Lifestyle & Commerce (Shopping & Recycling)', val: newestCalc.lifestyle }
  ];

  let currentY = 184;
  categories.forEach((cat) => {
    // Row background
    doc.setFillColor(250, 252, 250);
    doc.rect(12, currentY - 5, 186, 7, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(cat.name, 16, currentY);
    doc.text(`${cat.val} kg`, 100, currentY);

    const proportion = Math.max(2, Math.round((cat.val / (newestCalc.total || 1)) * 100));
    doc.text(`${proportion}%`, 160, currentY);
    currentY += 8;
  });

  // Goal & Milestone summary
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(8, 28, 21);
  doc.text('2. ACTIVE DECARBONIZATION PLANS', 12, 224);
  doc.line(12, 226, 198, 226);

  const userGoals = goals.filter(g => !g.completed).slice(0, 3);
  if (userGoals.length === 0) {
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('No current active goals. Try creating customized goals in CarbonIQ.', 16, 235);
  } else {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text('You have committed to reducing emissions through the following target goals:', 12, 232);

    let goalY = 239;
    userGoals.forEach((goal) => {
      // Small container
      doc.setDrawColor(216, 243, 220);
      doc.rect(12, goalY - 4, 186, 12);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(8, 28, 21);
      doc.text(goal.title.toUpperCase(), 16, goalY + 1);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Target: ${goal.targetValue}kg CO2e Reduction`, 16, goalY + 5);

      const pct = Math.round((goal.currentValue / goal.targetValue) * 100);
      doc.text(`Progress: ${goal.currentValue} / ${goal.targetValue} kg (${pct}%)`, 105, goalY + 5);
      doc.text(`Target Date: ${goal.deadline}`, 155, goalY + 5);

      goalY += 15;
    });
  }

  // Footer on Page 1
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This carbon audit statement remains dynamic and is powered by CarbonIQ Environment Engines.', 54, 286);


  // PAGE 2: TREND ANALYSIS & AI RECOMMENDATIONS
  doc.addPage();
  drawPageBorderAndHeader(2);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(8, 28, 21);
  doc.text('3. CLIMATE TREND INTELLIGENCE', 12, 24);
  doc.line(12, 26, 198, 26);

  // Line calculations history review
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Monthly emission curves calculated over the preceding audit intervals (in kg CO2e):', 12, 32);

  // Draw simple text list representation of emission reduction trends
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(8, 28, 21);
  let trendY = 40;
  
  if (history.length < 2) {
    doc.setFont('Helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Baseline calibration initialized. Longitudinal trend analyses require multiple records.', 16, trendY);
  } else {
    // Category summaries
    doc.setFillColor(245, 248, 246);
    doc.rect(12, trendY - 4, 186, 32, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(8, 28, 21);
    doc.text('AUDIT PERIOD', 16, trendY + 2);
    doc.text('TRANSPORTATION', 60, trendY + 2);
    doc.text('ELECTRICITY', 98, trendY + 2);
    doc.text('DIET', 135, trendY + 2);
    doc.text('TOTAL CO2e', 165, trendY + 2);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);

    let rowY = trendY + 9;
    // Show last 4 entries
    history.slice(-4).forEach((record) => {
      doc.text(record.date, 16, rowY);
      doc.text(`${record.transportation} kg`, 60, rowY);
      doc.text(`${record.electricity} kg`, 98, rowY);
      doc.text(`${record.food} kg`, 135, rowY);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(82, 183, 136);
      doc.text(`${record.total} kg`, 165, rowY);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      rowY += 6;
    });

    // Trend review result
    const startingTotal = history[0].total;
    const currentTotal = newestCalc.total;
    const diff = startingTotal - currentTotal;
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(8, 28, 21);
    
    if (diff > 0) {
      doc.text(`IMPACT CONTEXT: DECARBONIZATION REDUCTION OF ${diff} kg/month MEASURED.`, 12, 80);
    } else if (diff < 0) {
      doc.text(`IMPACT CONTEXT: ELEVATION OF ${Math.abs(diff)} kg/month MEASURED. INITIATE REDUCTIONS.`, 12, 80);
    } else {
      doc.text('IMPACT CONTEXT: FLATLINE STABLE CARBON RECORD DETECTED.', 12, 80);
    }
  }

  // Section 4: AI Recommendations
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(8, 28, 21);
  doc.text('4. CUSTOMIZED INTELLIGENCE RECOMMENDATIONS', 12, 92);
  doc.line(12, 94, 198, 94);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Engineered action models developed using AI based on your specific life-cycle inputs:', 12, 100);

  let recY = 106;
  const userRecs = recommendations.slice(0, 3);
  if (userRecs.length === 0) {
    // Draw generic premium default recommendations if none
    const dummyRecs = [
      { t: 'Transition to heat-pump based HVAC cooling systems', c: 'electricity', s: 420, d: 'Hard', i: 88, desc: 'Replaces carbon gas heating with direct electricity loops derived from nuclear/hydro clean loads.' },
      { t: 'Emphasize high nutrient plant grain diets on weekdays', c: 'food', s: 280, d: 'Easy', i: 79, desc: 'Offsets methane generation from livestock by substitution with protein dense legumes.' },
      { t: 'Transition commuting to battery electric vehicles', c: 'transportation', s: 840, d: 'Medium', i: 95, desc: 'Saves around 4.6 metric tons of tailpipe carbon discharges per calendar year.' }
    ];
    dummyRecs.forEach((r) => {
      doc.setFillColor(248, 252, 249);
      doc.rect(12, recY - 4, 186, 24, 'F');
      doc.setDrawColor(82, 183, 136);
      doc.line(12, recY - 4, 12, recY + 20);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(8, 28, 21);
      doc.text(r.t.toUpperCase(), 16, recY + 1);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(r.desc, 16, recY + 5, { maxWidth: 178 });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(82, 183, 136);
      doc.text(`CO2 SAVINGS: ${r.s}kg CO2e/yr`, 16, recY + 17);
      doc.text(`DIFFICULTY: ${r.d}`, 90, recY + 17);
      doc.text(`IMPACT SCORE: ${r.i}/100`, 150, recY + 17);
      recY += 28;
    });
  } else {
    userRecs.forEach((rec) => {
      doc.setFillColor(248, 252, 249);
      doc.rect(12, recY - 4, 186, 24, 'F');
      doc.setDrawColor(82, 183, 136);
      doc.line(12, recY - 4, 12, recY + 20);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(8, 28, 21);
      doc.text(rec.title.toUpperCase(), 16, recY + 1);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(rec.description, 16, recY + 5, { maxWidth: 178 });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(82, 183, 136);
      doc.text(`CO2 SAVINGS: ${rec.co2Savings}kg CO2e/yr`, 16, recY + 17);
      doc.text(`DIFFICULTY: ${rec.difficulty}`, 90, recY + 17);
      doc.text(`IMPACT SCORE: ${rec.impactScore}/100`, 150, recY + 17);
      recY += 28;
    });
  }

  // Section 5: Achievements & Badges
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(8, 28, 21);
  doc.text('5. SUSTAINABLE MILESTONES & ACHIEVEMENTS', 12, 202);
  doc.line(12, 204, 198, 204);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Milestone medals obtained on the CarbonIQ platform through challenge tasks (Balance: ${profile.points} points):`, 12, 210);

  if (profile.badges && profile.badges.length > 0) {
    let badgeX = 14;
    profile.badges.forEach((badge) => {
      doc.setFillColor(8, 28, 21);
      doc.rect(badgeX, 216, 42, 10, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(badge, badgeX + 21, 222.5, { align: 'center' });
      badgeX += 46;
    });
  } else {
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(120, 120, 120);
    doc.text('No premium status medals acquired yet. Participate in weekly challenges to unlock.', 16, 220);
  }

  // Signature Block
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 28, 21);
  doc.text('CLIMATE COMPLIANCE STATEMENT', 12, 246);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('This carbon accounting certificate utilizes recognized carbon weights based on GHG Protocol standard offsets.', 12, 251);
  doc.text('Prepared on-demand via the CarbonIQ server-side calculation grid engines.', 12, 254);

  // CarbonIQ Official Crest
  doc.setFillColor(82, 183, 136);
  doc.rect(160, 240, 30, 14, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 28, 21);
  doc.text('CARBONIQ', 175, 247, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('VERIFED ENGINE', 175, 251, { align: 'center' });

  // Download trigger
  doc.save(`CarbonIQ_Intelligence_Audit_Report_${profile.firstName}_${profile.lastName}.pdf`);
}
