import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { DBStore } from './src/database/dbStore.js';
import { CarbonCalculatorData, EmissionsBreakdown, Recommendation } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// Lazy-loaded GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log('Gemini AI Client initialized successfully on server');
    } catch (err) {
      console.error('Error initializing Gemini AI Client:', err);
    }
  }
  return aiClient;
}

// REST API Routes
// ----------------------------------------------------------------------------

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const userRecord = DBStore.getUser(email);
  if (!userRecord) {
    return res.status(401).json({ error: 'User not found. Try register or demo mode.' });
  }

  // Pure login check for demo simplicity
  if (email.toLowerCase() === 'demo@carboniq.com') {
    return res.json({
      profile: userRecord.profile,
      calculations: userRecord.calculations,
      goals: userRecord.goals,
      challenges: userRecord.challenges,
      recommendations: userRecord.recommendations
    });
  }

  // Check matching password
  if (userRecord.passwordHash === password) {
    return res.json({
      profile: userRecord.profile,
      calculations: userRecord.calculations,
      goals: userRecord.goals,
      challenges: userRecord.challenges,
      recommendations: userRecord.recommendations
    });
  }

  res.status(401).json({ error: 'Incorrent password' });
});

app.post('/api/auth/register', (req, res) => {
  const { password, profile } = req.body;
  if (!password || !profile || !profile.email) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const userRecord = DBStore.registerUser(password, profile);
    res.json({
      profile: userRecord.profile,
      calculations: userRecord.calculations,
      goals: userRecord.goals,
      challenges: userRecord.challenges,
      recommendations: userRecord.recommendations
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/profile', (req, res) => {
  const { email, profileUpdates } = req.body;
  if (!email || !profileUpdates) {
    return res.status(400).json({ error: 'Email and profile update params required' });
  }

  const updatedProfile = DBStore.updateUserProfile(email, profileUpdates);
  if (!updatedProfile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(updatedProfile);
});

app.post('/api/auth/reset', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const success = DBStore.resetUser(email);
  if (success) {
    return res.json({ success: true, message: 'Simulation database reset successfully.' });
  }
  res.status(404).json({ error: 'User not found' });
});

// Calculations engine
app.post('/api/calculator/calculate', (req, res) => {
  const { email, calculatorData, date } = req.body;
  if (!email || !calculatorData) {
    return res.status(400).json({ error: 'Missing calculation inputs' });
  }

  const data: CarbonCalculatorData = calculatorData;

  // Real Carbon Footprint calculations (measured in kg CO2 per month)
  
  // 1. Transportation
  let transportEmissions = 0;
  const transportMethod = data.vehicleType || 'Public';
  let factorPerKm = 0.18; // Gas vehicle standard
  
  if (transportMethod === 'Electric') {
    factorPerKm = 0.04;
  } else if (transportMethod === 'Hybrid') {
    factorPerKm = 0.10;
  } else if (transportMethod === 'Public') {
    factorPerKm = 0.06;
  } else if (transportMethod === 'Walk/Bike') {
    factorPerKm = 0.00;
  } else if (transportMethod === 'Gasoline') {
    factorPerKm = 0.20;
  }

  // Monthly car emissions
  const monthDist = (data.dailyDistance || 0) * 30;
  transportEmissions += monthDist * factorPerKm;

  // Add flight emissions (annual flights times avg 400kg CO2 per short/mid flight, divided by 12)
  const monthlyFlightEmissions = ((data.flightsPerYear || 0) * 450) / 12;
  transportEmissions += monthlyFlightEmissions;

  // 2. Electricity
  let electricityEmissions = 0;
  // standard factor: 0.42 kg CO2 per kWh
  let gridFactor = 0.42;
  if (data.renewableEnergy) {
    gridFactor = 0.06; // 85% clean offset
  }
  electricityEmissions += (data.monthlyConsumption || 0) * gridFactor;

  // AC Factor
  const acPower = data.acUsage || 'None';
  if (acPower === 'High') {
    electricityEmissions += 45;
  } else if (acPower === 'Medium') {
    electricityEmissions += 25;
  } else if (acPower === 'Low') {
    electricityEmissions += 12;
  }

  // 3. Food
  let foodEmissions = 0;
  const diet = data.dietType || 'Meat Lover';
  if (diet === 'Meat Lover') {
    foodEmissions += 210;
  } else if (diet === 'Flexitarian') {
    foodEmissions += 135;
  } else if (diet === 'Vegetarian') {
    foodEmissions += 85;
  } else if (diet === 'Vegan') {
    foodEmissions += 45;
  }

  const dairy = data.dairyConsumption || 'Medium';
  if (dairy === 'High') foodEmissions += 30;
  else if (dairy === 'Medium') foodEmissions += 15;
  else if (dairy === 'Low') foodEmissions += 5;

  const waste = data.foodWaste || 'Medium';
  if (waste === 'High') foodEmissions += 25;
  else if (waste === 'Medium') foodEmissions += 12;
  else if (waste === 'Low') foodEmissions += 4;

  // 4. Lifestyle
  let lifestyleEmissions = 0;
  const shop = data.shoppingFrequency || 'Occasionally';
  if (shop === 'Frequently') lifestyleEmissions += 95;
  else if (shop === 'Occasionally') lifestyleEmissions += 45;
  else if (shop === 'Rarely') lifestyleEmissions += 12;

  // Electronics (each item manufactured averages ~80kg carbon load distributed over year)
  lifestyleEmissions += ((data.electronicsPurchases || 0) * 80) / 12;

  const recycling = data.recyclingHabits || 'Sometimes';
  if (recycling === 'Never') {
    lifestyleEmissions += 25;
  } else if (recycling === 'Sometimes') {
    lifestyleEmissions += 10;
  } else if (recycling === 'Always') {
    lifestyleEmissions -= 15; // recycling offset
  }

  transportEmissions = Math.max(0, Math.round(transportEmissions));
  electricityEmissions = Math.max(0, Math.round(electricityEmissions));
  foodEmissions = Math.max(0, Math.round(foodEmissions));
  lifestyleEmissions = Math.max(0, Math.round(lifestyleEmissions));

  const totalEmissions = transportEmissions + electricityEmissions + foodEmissions + lifestyleEmissions;

  // Calculate Sustainability Score (Higher is better, scale 0 to 100)
  // Standard target is ~150 kg carbon impact per month. High is >1000kg.
  let score = 100 - (totalEmissions / 12);
  score = Math.max(10, Math.min(100, Math.round(score)));

  // Package breakdown
  const reportDate = date || 'Jun 2026';
  const calculationRecord: EmissionsBreakdown = {
    date: reportDate,
    transportation: transportEmissions,
    electricity: electricityEmissions,
    food: foodEmissions,
    lifestyle: lifestyleEmissions,
    total: totalEmissions,
    sustainabilityScore: score
  };

  const updatedCalcs = DBStore.saveCalculations(email, calculationRecord);
  res.json({
    latestCalculation: calculationRecord,
    history: updatedCalcs,
    sustainabilityScore: score
  });
});

// Goals
app.post('/api/goals', (req, res) => {
  const { email, action, goalId, goalData } = req.body;
  if (!email || !action) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    let list = [];
    if (action === 'add' && goalData) {
      list = DBStore.addGoal(email, goalData);
    } else if (action === 'update' && goalId) {
      list = DBStore.updateGoal(email, goalId, goalData || {});
    } else if (action === 'delete' && goalId) {
      list = DBStore.deleteGoal(email, goalId);
    } else {
      const u = DBStore.getUser(email);
      list = u ? u.goals : [];
    }
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Challenges
app.post('/api/challenges', (req, res) => {
  const { email, action, challengeId } = req.body;
  if (!email || !action || !challengeId) {
    return res.status(400).json({ error: 'Missing challenge parameters' });
  }

  try {
    let list = [];
    if (action === 'join') {
      list = DBStore.joinChallenge(email, challengeId);
    } else if (action === 'leave') {
      list = DBStore.leaveChallenge(email, challengeId);
    } else if (action === 'complete') {
      list = DBStore.completeChallenge(email, challengeId);
    } else {
      const u = DBStore.getUser(email);
      list = u ? u.challenges : [];
    }
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const email = (req.query.email as string) || '';
  res.json(DBStore.getLeaderboard(email));
});

// AI Insights Generator powered by Gemini 3.5 Flash
app.post('/api/insights/generate', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const userRecord = DBStore.getUser(email);
  if (!userRecord) {
    return res.status(404).json({ error: 'User record not found' });
  }

  const lastCalc = userRecord.calculations[userRecord.calculations.length - 1] || {
    transportation: 150,
    electricity: 180,
    food: 120,
    lifestyle: 90,
    total: 540,
    sustainabilityScore: 75
  };

  const client = getGeminiClient();

  if (client) {
    try {
      console.log(`Querying Gemini AI for carbon insights tailored for ${email}...`);
      const prompt = `Analyze this user's carbon calculator profile and monthly greenhouse gas emissions to generate exactly 3 highly actionable, expert-level carbon reducing recommendations.

User Demographic & Profile:
- Name: ${userRecord.profile.firstName}
- City: ${userRecord.profile.city}, State: ${userRecord.profile.state}, Country: ${userRecord.profile.country}
- Diets: ${userRecord.profile.dietType}
- Common Transport Mode: ${userRecord.profile.primaryTransport}
- Household Size: ${userRecord.profile.householdSize}

Current Monthly Emissions Breakdown:
- Transportation emissions: ${lastCalc.transportation} kg CO₂/month
- Electricity emissions: ${lastCalc.electricity} kg CO₂/month
- Diet/Food emissions: ${lastCalc.food} kg CO₂/month
- Shopping/Lifestyle emissions: ${lastCalc.lifestyle} kg CO₂/month
- Monthly Total: ${lastCalc.total} kg CO₂/month
- App Carbon Sustainability Score: ${lastCalc.sustainabilityScore}/100

Generate exactly 3 recommendation structures. Tailor it SPECIFICALLY to decrease their major emission sectors. Design realistic, quantified carbon reduction estimates. Return a JSON array matching our exact model configuration types.`;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are CarbonIQ AI, a senior environmental scientist specializing in carbon accounting and individual decarbonization strategies. You formulate clean, highly quantified recommendations representing real-world CO2 savings numbers.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING, description: 'Short catchy action headline, e.g., "Install low-flow smart valves"' },
                description: { type: Type.STRING, description: 'Technical context on WHY this works for their exact state/lifestyle and how to implement it.' },
                category: { type: Type.STRING, description: 'Must be one of: transportation, electricity, food, or lifestyle' },
                co2Savings: { type: Type.NUMBER, description: 'Estimated carbon saved per YEAR in kg CO2' },
                difficulty: { type: Type.STRING, description: 'Must be: Easy, Medium, or Hard' },
                impactScore: { type: Type.NUMBER, description: 'SaaS impact ranking from 1 to 100' }
              },
              required: ['id', 'title', 'description', 'category', 'co2Savings', 'difficulty', 'impactScore']
            }
          }
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        const recommendations: Recommendation[] = JSON.parse(responseText.trim());
        DBStore.saveRecommendations(email, recommendations);
        return res.json({ recommendations, aiPowered: true });
      }
    } catch (err) {
      console.error('Gemini API call failed, shifting to premium intelligent offline recommendations', err);
    }
  }

  // Decoy/Offline Intelligent recommendations if Gemini is unconfigured or failed
  console.log('Using robust custom localized carbon intelligence engine...');
  const offlineRecommendations: Recommendation[] = [];

  // Tailored recommendations sorted dynamically by user's highest categories
  const categories = [
    { name: 'transportation', val: lastCalc.transportation },
    { name: 'electricity', val: lastCalc.electricity },
    { name: 'food', val: lastCalc.food },
    { name: 'lifestyle', val: lastCalc.lifestyle }
  ].sort((a, b) => b.val - a.val);

  categories.slice(0, 3).forEach((sector, idx) => {
    if (sector.name === 'transportation') {
      offlineRecommendations.push({
        id: `off-transport-${idx}`,
        title: userRecord.profile.primaryTransport === 'Electric' 
          ? 'Optimize Electric Charging Window'
          : 'Alternative Green Commute Switch',
        description: userRecord.profile.primaryTransport === 'Electric'
          ? 'Charge your EV strictly during off-peak hours (11 PM - 6 AM) when grid electricity is sourced primarily from renewables instead of coal peaker plants.'
          : 'Swap gasoline mileage for walking/biking or public transit on 2 specific commuter days every week. Eliminates fuel burn rates dramatically.',
        category: 'transportation',
        co2Savings: userRecord.profile.primaryTransport === 'Electric' ? 140 : 520,
        difficulty: userRecord.profile.primaryTransport === 'Electric' ? 'Easy' : 'Medium',
        impactScore: userRecord.profile.primaryTransport === 'Electric' ? 62 : 88
      });
    } else if (sector.name === 'electricity') {
      offlineRecommendations.push({
        id: `off-electric-${idx}`,
        title: userRecord.profile.renewableEnergy ? 'Eliminate Vampire Load Overhead' : 'Join Green Power Tariff',
        description: userRecord.profile.renewableEnergy
          ? 'Over 10% of standard home electrical consumption is wasted by vampire draws. Connect electronics to smart power strips that auto-shut off when in standby.'
          : 'Request a green electricity plan transition from your utility provider. Sourcing your local grid tier entirely from wind and solar offsets load intensity instantly.',
        category: 'electricity',
        co2Savings: userRecord.profile.renewableEnergy ? 110 : 640,
        difficulty: 'Easy',
        impactScore: userRecord.profile.renewableEnergy ? 52 : 92
      });
    } else if (sector.name === 'food') {
      offlineRecommendations.push({
        id: `off-food-${idx}`,
        title: userRecord.profile.dietType === 'Meat Lover' ? 'Adopt Flexitarian Eating Schedules' : 'Compost Organic Kitchen Scraps',
        description: userRecord.profile.dietType === 'Meat Lover'
          ? 'Substituting beef or pork for plant-based high-protein sources on weekdays reduces land, fertilizer, and gas use footprint associated with animal husbandry by up to 35%.'
          : 'Food waste rotting in municipal trash bags triggers landfill anaerobic decay generating heavy methane. Line-dry or backyard compost all fruit and veggie scraps.',
        category: 'food',
        co2Savings: userRecord.profile.dietType === 'Meat Lover' ? 440 : 150,
        difficulty: 'Easy',
        impactScore: 84
      });
    } else if (sector.name === 'lifestyle') {
      offlineRecommendations.push({
        id: `off-lifestyle-${idx}`,
        title: 'Adopt Circular Appliance Lifecycle',
        description: 'Extend the useful lifespan of heavy household electronics by another 2 years. Re-manufacture emissions constitute the single biggest load for modern goods.',
        category: 'lifestyle',
        co2Savings: 210,
        difficulty: 'Medium',
        impactScore: 70
      });
    }
  });

  // Ensure we always have exactly 3 recommendations
  while (offlineRecommendations.length < 3) {
    offlineRecommendations.push({
      id: `off-filler-${offlineRecommendations.length}`,
      title: 'Maintain Eco Heating Settings',
      description: 'Lower thermostat heating settings by exactly 1°C in cold weather. Standardizes carbon load efficiency.',
      category: 'electricity',
      co2Savings: 180,
      difficulty: 'Easy',
      impactScore: 68
    });
  }

  DBStore.saveRecommendations(email, offlineRecommendations);
  res.json({ recommendations: offlineRecommendations, aiPowered: false });
});

// Delete account
app.post('/api/auth/delete-account', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const done = DBStore.deleteAccount(email);
  if (done) return res.json({ success: true, message: 'Account deleted successfully' });
  res.status(404).json({ error: 'User not found' });
});

// Serve frontend SPA through Vite or standard built bundle
// ----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware integrated with Express');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarbonIQ Server successfully running on http://localhost:${PORT}`);
  });
}

startServer();
