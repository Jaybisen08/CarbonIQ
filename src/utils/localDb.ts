import { UserProfile, CarbonCalculatorData, EmissionsBreakdown, Goal, Challenge, Recommendation, LeaderboardEntry } from '../types';

export const DEMO_EMAIL = 'demo@carboniq.com';

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Zero Waste Week',
    description: 'Eliminate single-use plastics and compost food food scrap for 7 days.',
    points: 150,
    duration: '7 Days',
    category: 'lifestyle',
    joined: false,
    completed: false
  },
  {
    id: 'ch-2',
    title: 'Green Commute',
    description: 'Walk, cycle, or use public transit for all travel under 10km.',
    points: 250,
    duration: '14 Days',
    category: 'transportation',
    joined: false,
    completed: false
  },
  {
    id: 'ch-3',
    title: 'Vampire Draw Slayer',
    description: 'Unplug all unused appliances and chargers before going to bed.',
    points: 100,
    duration: '5 Days',
    category: 'electricity',
    joined: false,
    completed: false
  },
  {
    id: 'ch-4',
    title: 'Veggie Power',
    description: 'Adopt a plant-based diet without meat and dairy for a clean environmental footprint.',
    points: 180,
    duration: '7 Days',
    category: 'food',
    joined: false,
    completed: false
  },
  {
    id: 'ch-5',
    title: 'Cold Wash Campaign',
    description: 'Wash all clothes using cold water cycles and line-dry them.',
    points: 120,
    duration: '10 Days',
    category: 'electricity',
    joined: false,
    completed: false
  }
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Elena Rostova', points: 2450, avatarSeed: 'elena', badges: ['Eco Titan', 'Carbon Neutralist', 'Goal Crusher'], sustainabilityScore: 94 },
  { rank: 2, name: 'Marcus Sterling', points: 2180, avatarSeed: 'marcus', badges: ['Grid Warrior', 'Green Commuter'], sustainabilityScore: 91 },
  { rank: 3, name: 'Siddharth Mehta', points: 1950, avatarSeed: 'sid', badges: ['Zero Waste Champ', 'Plant-Powered'], sustainabilityScore: 89 },
  { rank: 4, name: 'Chloë Lefevre', points: 1720, avatarSeed: 'chloe', badges: ['Carbon Neutralist', 'Warm Wash Banter'], sustainabilityScore: 86 },
  { rank: 5, name: 'Kai Takahashi', points: 1510, avatarSeed: 'kai', badges: ['Renewable Pro'], sustainabilityScore: 82 }
];

interface UserStructure {
  profile: UserProfile;
  passwordHash: string;
  calculations: EmissionsBreakdown[];
  goals: Goal[];
  challenges: Challenge[];
  recommendations: Recommendation[];
}

interface LocalDBStructure {
  users: Record<string, UserStructure>;
}

// Read database from localStorage
function readDB(): LocalDBStructure {
  try {
    const data = localStorage.getItem('carboniq_local_database');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.users) {
        return parsed as LocalDBStructure;
      }
    }
  } catch (err) {
    console.error('Error parsing local database, returning empty', err);
  }
  return { users: {} };
}

// Write database to localStorage
function writeDB(data: LocalDBStructure) {
  try {
    localStorage.setItem('carboniq_local_database', JSON.stringify(data));
  } catch (err) {
    console.error('Error writing local database', err);
  }
}

// Initialize seed data if not present
export function initializeLocalDB() {
  const db = readDB();

  // If we don't have the demo user, populate Sarah Chen
  if (!db.users[DEMO_EMAIL]) {
    const demoProfile: UserProfile = {
      firstName: 'Sarah',
      lastName: 'Chen',
      age: 28,
      gender: 'Female',
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      email: DEMO_EMAIL,
      occupation: 'Sustainability Lead',
      isStudent: false,
      dietType: 'Vegetarian',
      householdSize: 2,
      primaryTransport: 'Electric',
      prefSustainabilityTips: true,
      prefEmailNotifications: false,
      points: 850,
      badges: ['Grid Explorer', 'Eco Pioneer', 'Challenge Champion'],
      hasCompletedAssessment: true
    };

    const demoCalculations: EmissionsBreakdown[] = [
      {
        date: 'Jan 2026',
        transportation: 140,
        electricity: 180,
        food: 110,
        lifestyle: 95,
        total: 525,
        sustainabilityScore: 78
      },
      {
        date: 'Feb 2026',
        transportation: 135,
        electricity: 165,
        food: 110,
        lifestyle: 90,
        total: 500,
        sustainabilityScore: 80
      },
      {
        date: 'Mar 2026',
        transportation: 110,
        electricity: 140,
        food: 95,
        lifestyle: 85,
        total: 430,
        sustainabilityScore: 84
      },
      {
        date: 'Apr 2026',
        transportation: 98,
        electricity: 120,
        food: 95,
        lifestyle: 70,
        total: 383,
        sustainabilityScore: 87
      },
      {
        date: 'May 2026',
        transportation: 80,
        electricity: 105,
        food: 80,
        lifestyle: 65,
        total: 330,
        sustainabilityScore: 90
      }
    ];

    const demoGoals: Goal[] = [
      {
        id: 'g-1',
        title: 'Minimize Laundry Footprint',
        description: 'Use cold water washes & reduce washer loads to twice per week.',
        category: 'electricity',
        targetValue: 45,
        currentValue: 32,
        completed: false,
        deadline: '2026-07-15'
      },
      {
        id: 'g-2',
        title: 'Meat-Free Fortnight',
        description: 'Reduce red meat intake entirely for two successive weeks.',
        category: 'food',
        targetValue: 30,
        currentValue: 30,
        completed: true,
        deadline: '2026-05-31'
      }
    ];

    const demoRecommendations: Recommendation[] = [
      {
        id: 'r-1',
        title: 'Upgrade to Smart Thermostat',
        description: 'Automate temperature scaling based on occupancy, reducing electrical cooling overhead by 15%.',
        category: 'electricity',
        co2Savings: 310,
        difficulty: 'Easy',
        impactScore: 82
      },
      {
        id: 'r-2',
        title: 'Commit to Walk/Car-pooling',
        description: 'Carpooling for work trips over 15km removes vehicle occupancy load.',
        category: 'transportation',
        co2Savings: 580,
        difficulty: 'Medium',
        impactScore: 91
      },
      {
        id: 'r-3',
        title: 'Repurpose Vegetable Scraps',
        description: 'Making stocks or home-composting food waste eliminates standard landfill methane emissions.',
        category: 'food',
        co2Savings: 120,
        difficulty: 'Easy',
        impactScore: 68
      }
    ];

    const challengesWithDemoState = DEFAULT_CHALLENGES.map((ch, index) => {
      if (index === 2) {
        return { ...ch, joined: true };
      }
      if (index === 3) {
        return { ...ch, joined: true, completed: true };
      }
      return ch;
    });

    db.users[DEMO_EMAIL] = {
      profile: demoProfile,
      passwordHash: 'demosecret',
      calculations: demoCalculations,
      goals: demoGoals,
      challenges: challengesWithDemoState,
      recommendations: demoRecommendations
    };

    writeDB(db);
  }
}

// Safe wrapper to guarantee DB initialization is complete
export function getLocalUser(email: string): UserStructure | null {
  initializeLocalDB();
  const db = readDB();
  return db.users[email.toLowerCase()] || null;
}

export function saveLocalUser(email: string, userRecord: UserStructure) {
  const db = readDB();
  db.users[email.toLowerCase()] = userRecord;
  writeDB(db);
}

// 1. Authenticate / Login
export function loginLocalUser(email: string, passwordHash: string): UserStructure {
  initializeLocalDB();
  const db = readDB();
  const emailKey = email.toLowerCase();
  
  // For demo flow as user requested: allows any password for simulated accounts, or signs them up on the fly if needed
  if (!db.users[emailKey]) {
    // If it's the standard demo address, re-init it
    if (emailKey === DEMO_EMAIL) {
      initializeLocalDB();
      return readDB().users[DEMO_EMAIL];
    }
    // Auto-create profile to keep the demo extremely fast and seamless
    return registerLocalUser(passwordHash, {
      firstName: emailKey.substring(0, emailKey.indexOf('@')) || 'User',
      lastName: 'Eco',
      age: 30,
      gender: 'Male',
      city: 'Seattle',
      state: 'WA',
      country: 'United States',
      email: email,
      occupation: 'Green Evangelist',
      isStudent: false,
      dietType: 'Vegan',
      householdSize: 1,
      primaryTransport: 'Walk/Bike',
      prefSustainabilityTips: true,
      prefEmailNotifications: true,
      points: 100,
      badges: ['Eco Rookie'],
      hasCompletedAssessment: false
    });
  }

  // Allow simple demo password matching, or proceed anyway for seamless offline experience
  return db.users[emailKey];
}

// 2. Register
export function registerLocalUser(password: string, profile: UserProfile): UserStructure {
  initializeLocalDB();
  const db = readDB();
  const emailKey = profile.email.toLowerCase();

  const newUser: UserStructure = {
    profile: {
      ...profile,
      hasCompletedAssessment: false,
      points: profile.points || 250,
      badges: profile.badges || ['Green Core']
    },
    passwordHash: password,
    calculations: [],
    goals: [
      {
        id: 'g-init-1',
        title: 'Reduce flight counts',
        description: 'Try substituting minor domestic flights with rail transit where available.',
        category: 'transportation',
        targetValue: 120,
        currentValue: 0,
        completed: false,
        deadline: '2026-12-31'
      },
      {
        id: 'g-init-2',
        title: 'Install Energy-Efficient LEDs',
        description: 'Swap standard high wattage bulbs for sustainable smart energy certified smart LEDs.',
        category: 'electricity',
        targetValue: 50,
        currentValue: 0,
        completed: false,
        deadline: '2026-08-30'
      }
    ],
    challenges: DEFAULT_CHALLENGES.map(ch => ({ ...ch })),
    recommendations: []
  };

  db.users[emailKey] = newUser;
  writeDB(db);
  return newUser;
}

// 3. Update Profile
export function updateLocalProfile(email: string, profileUpdates: Partial<UserProfile>): UserProfile {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (db.users[emailKey]) {
    db.users[emailKey].profile = {
      ...db.users[emailKey].profile,
      ...profileUpdates
    };
    writeDB(db);
    return db.users[emailKey].profile;
  }
  throw new Error('User not found');
}

// 4. Reset User Data
export function resetLocalUser(email: string): boolean {
  localStorage.removeItem('authenticated_user');
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (db.users[emailKey]) {
    if (emailKey === DEMO_EMAIL) {
      delete db.users[emailKey];
      writeDB(db);
      initializeLocalDB();
      return true;
    }

    db.users[emailKey].calculations = [];
    db.users[emailKey].recommendations = [];
    db.users[emailKey].goals = [
      {
        id: 'g-init-1',
        title: 'Reduce flight counts',
        description: 'Try substituting minor domestic flights with rail transit where available.',
        category: 'transportation',
        targetValue: 120,
        currentValue: 0,
        completed: false,
        deadline: '2026-12-31'
      },
      {
        id: 'g-init-2',
        title: 'Install Energy-Efficient LEDs',
        description: 'Swap standard high wattage bulbs for sustainable smart energy certified smart LEDs.',
        category: 'electricity',
        targetValue: 50,
        currentValue: 0,
        completed: false,
        deadline: '2026-08-30'
      }
    ];
    db.users[emailKey].challenges = DEFAULT_CHALLENGES.map(ch => ({ ...ch }));
    db.users[emailKey].profile.points = 0;
    db.users[emailKey].profile.badges = [];
    db.users[emailKey].profile.hasCompletedAssessment = false;
    db.users[emailKey].profile.sustainabilityScore = undefined;
    writeDB(db);
    return true;
  }
  return false;
}

// 5. Calculate Emissions
export function calculateLocalEmissions(email: string, calculatorData: CarbonCalculatorData, dateStr?: string): {
  latestCalculation: EmissionsBreakdown;
  history: EmissionsBreakdown[];
} {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (!db.users[emailKey]) {
    throw new Error('User not logged in');
  }

  let transportEmissions = 0;
  const transportMethod = calculatorData.vehicleType || 'Public';
  let factorPerKm = 0.18;
  
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

  const monthDist = (calculatorData.dailyDistance || 0) * 30;
  transportEmissions += monthDist * factorPerKm;

  const monthlyFlightEmissions = ((calculatorData.flightsPerYear || 0) * 450) / 12;
  transportEmissions += monthlyFlightEmissions;

  let electricityEmissions = 0;
  let gridFactor = 0.42;
  if (calculatorData.renewableEnergy) {
    gridFactor = 0.06;
  }
  electricityEmissions += (calculatorData.monthlyConsumption || 0) * gridFactor;

  const acPower = calculatorData.acUsage || 'None';
  if (acPower === 'High') {
    electricityEmissions += 45;
  } else if (acPower === 'Medium') {
    electricityEmissions += 25;
  } else if (acPower === 'Low') {
    electricityEmissions += 12;
  }

  let foodEmissions = 0;
  const diet = calculatorData.dietType || 'Meat Lover';
  if (diet === 'Meat Lover') {
    foodEmissions += 210;
  } else if (diet === 'Flexitarian') {
    foodEmissions += 135;
  } else if (diet === 'Vegetarian') {
    foodEmissions += 85;
  } else if (diet === 'Vegan') {
    foodEmissions += 45;
  }

  const dairy = calculatorData.dairyConsumption || 'Medium';
  if (dairy === 'High') foodEmissions += 30;
  else if (dairy === 'Medium') foodEmissions += 15;
  else if (dairy === 'Low') foodEmissions += 5;

  const waste = calculatorData.foodWaste || 'Medium';
  if (waste === 'High') foodEmissions += 25;
  else if (waste === 'Medium') foodEmissions += 12;
  else if (waste === 'Low') foodEmissions += 4;

  let lifestyleEmissions = 0;
  const shop = calculatorData.shoppingFrequency || 'Occasionally';
  if (shop === 'Frequently') lifestyleEmissions += 95;
  else if (shop === 'Occasionally') lifestyleEmissions += 45;
  else if (shop === 'Rarely') lifestyleEmissions += 12;

  lifestyleEmissions += ((calculatorData.electronicsPurchases || 0) * 80) / 12;

  const recycling = calculatorData.recyclingHabits || 'Sometimes';
  if (recycling === 'Never') {
    lifestyleEmissions += 25;
  } else if (recycling === 'Sometimes') {
    lifestyleEmissions += 10;
  } else if (recycling === 'Always') {
    lifestyleEmissions -= 15;
  }

  transportEmissions = Math.max(0, Math.round(transportEmissions));
  electricityEmissions = Math.max(0, Math.round(electricityEmissions));
  foodEmissions = Math.max(0, Math.round(foodEmissions));
  lifestyleEmissions = Math.max(0, Math.round(lifestyleEmissions));

  const totalEmissions = transportEmissions + electricityEmissions + foodEmissions + lifestyleEmissions;

  let score = 100 - (totalEmissions / 12);
  score = Math.max(10, Math.min(100, Math.round(score)));

  const reportDate = dateStr || 'Jun 2026';
  const calculationRecord: EmissionsBreakdown = {
    date: reportDate,
    transportation: transportEmissions,
    electricity: electricityEmissions,
    food: foodEmissions,
    lifestyle: lifestyleEmissions,
    total: totalEmissions,
    sustainabilityScore: score
  };

  const existingIdx = db.users[emailKey].calculations.findIndex(c => c.date === calculationRecord.date);
  if (existingIdx !== -1) {
    db.users[emailKey].calculations[existingIdx] = calculationRecord;
  } else {
    db.users[emailKey].calculations.push(calculationRecord);
  }

  db.users[emailKey].profile.sustainabilityScore = score;
  db.users[emailKey].profile.hasCompletedAssessment = true;

  writeDB(db);

  return {
    latestCalculation: calculationRecord,
    history: db.users[emailKey].calculations
  };
}

// 6. Generate Recommendations (client-side intelligence)
export function generateLocalRecommendations(email: string): Recommendation[] {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (!db.users[emailKey]) {
    throw new Error('User not found');
  }

  const lastCalc = db.users[emailKey].calculations[db.users[emailKey].calculations.length - 1] || {
    transportation: 150,
    electricity: 180,
    food: 120,
    lifestyle: 90,
    total: 540,
    sustainabilityScore: 75
  };

  const offlineRecommendations: Recommendation[] = [];

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
        title: db.users[emailKey].profile.primaryTransport === 'Electric' 
          ? 'Optimize Electric Charging Window'
          : 'Alternative Green Commute Switch',
        description: db.users[emailKey].profile.primaryTransport === 'Electric'
          ? 'Charge your EV strictly during off-peak hours (11 PM - 6 AM) when grid electricity is sourced primarily from renewables instead of coal peaker plants.'
          : 'Swap gasoline mileage for walking/biking or public transit on 2 specific commuter days every week. Eliminates fuel burn rates dramatically.',
        category: 'transportation',
        co2Savings: db.users[emailKey].profile.primaryTransport === 'Electric' ? 140 : 520,
        difficulty: db.users[emailKey].profile.primaryTransport === 'Electric' ? 'Easy' : 'Medium',
        impactScore: db.users[emailKey].profile.primaryTransport === 'Electric' ? 62 : 88
      });
    } else if (sector.name === 'electricity') {
      offlineRecommendations.push({
        id: `off-electric-${idx}`,
        title: 'Formulate Vampire Load Strips',
        description: 'Over 10% of standard home electrical consumption is wasted by vampire draws. Connect electronics to smart power strips that auto-shut off when in standby.',
        category: 'electricity',
        co2Savings: 110,
        difficulty: 'Easy',
        impactScore: 52
      });
    } else if (sector.name === 'food') {
      offlineRecommendations.push({
        id: `off-food-${idx}`,
        title: db.users[emailKey].profile.dietType === 'Meat Lover' ? 'Adopt Flexitarian Eating Schedules' : 'Compost Organic Kitchen Scraps',
        description: db.users[emailKey].profile.dietType === 'Meat Lover'
          ? 'Substituting beef or pork for plant-based high-protein sources on weekdays reduces land, fertilizer, and gas use footprint associated with animal husbandry by up to 35%.'
          : 'Food waste rotting in municipal trash bags triggers landfill anaerobic decay generating heavy methane. Line-dry or backyard compost all fruit and veggie scraps.',
        category: 'food',
        co2Savings: db.users[emailKey].profile.dietType === 'Meat Lover' ? 440 : 150,
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

  db.users[emailKey].recommendations = offlineRecommendations;
  writeDB(db);
  return offlineRecommendations;
}

// 7. Goals Addition / Modification / Deletion
export function addLocalGoal(email: string, goal: Omit<Goal, 'id' | 'completed' | 'currentValue'>): Goal[] {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (db.users[emailKey]) {
    const newGoal: Goal = {
      ...goal,
      id: `g-${Date.now()}`,
      currentValue: 0,
      completed: false
    };
    db.users[emailKey].goals.push(newGoal);
    writeDB(db);
    return db.users[emailKey].goals;
  }
  return [];
}

export function updateLocalGoal(email: string, goalId: string, updates: Partial<Goal>): {
  goals: Goal[];
  newPoints: number;
  newBadges: string[];
} {
  const db = readDB();
  const emailKey = email.toLowerCase();
  let updatedPoints = 0;
  let updatedBadges: string[] = [];

  if (db.users[emailKey]) {
    const wasCompleted = db.users[emailKey].goals.find(g => g.id === goalId)?.completed || false;
    
    db.users[emailKey].goals = db.users[emailKey].goals.map(g => {
      if (g.id === goalId) {
        const fresh = { ...g, ...updates };
        if (fresh.currentValue >= fresh.targetValue) {
          fresh.completed = true;
        }
        return fresh;
      }
      return g;
    });

    const isNowCompleted = db.users[emailKey].goals.find(g => g.id === goalId)?.completed || false;
    
    if (isNowCompleted && !wasCompleted) {
      db.users[emailKey].profile.points += 100;
      if (!db.users[emailKey].profile.badges.includes('Goal Crusher')) {
        db.users[emailKey].profile.badges.push('Goal Crusher');
      }
    }

    writeDB(db);
    return {
      goals: db.users[emailKey].goals,
      newPoints: db.users[emailKey].profile.points,
      newBadges: db.users[emailKey].profile.badges
    };
  }
  return { goals: [], newPoints: 0, newBadges: [] };
}

export function deleteLocalGoal(email: string, goalId: string): Goal[] {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (db.users[emailKey]) {
    db.users[emailKey].goals = db.users[emailKey].goals.filter(g => g.id !== goalId);
    writeDB(db);
    return db.users[emailKey].goals;
  }
  return [];
}

// 8. Join / Leave / Complete Campaign Challenges
export function joinLocalChallenge(email: string, challengeId: string): Challenge[] {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (db.users[emailKey]) {
    db.users[emailKey].challenges = db.users[emailKey].challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, joined: true };
      }
      return c;
    });
    writeDB(db);
    return db.users[emailKey].challenges;
  }
  return [];
}

export function leaveLocalChallenge(email: string, challengeId: string): Challenge[] {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (db.users[emailKey]) {
    db.users[emailKey].challenges = db.users[emailKey].challenges.map(c => {
      if (c.id === challengeId) {
        return { ...c, joined: false, completed: false };
      }
      return c;
    });
    writeDB(db);
    return db.users[emailKey].challenges;
  }
  return [];
}

export function completeLocalChallenge(email: string, challengeId: string): {
  challenges: Challenge[];
  newPoints: number;
  newBadges: string[];
} {
  const db = readDB();
  const emailKey = email.toLowerCase();
  if (db.users[emailKey]) {
    let pointsAwarded = 0;
    db.users[emailKey].challenges = db.users[emailKey].challenges.map(c => {
      if (c.id === challengeId && c.joined && !c.completed) {
        pointsAwarded = c.points;
        return { ...c, completed: true };
      }
      return c;
    });

    if (pointsAwarded > 0) {
      db.users[emailKey].profile.points += pointsAwarded;
      if (!db.users[emailKey].profile.badges.includes('Eco Commando')) {
        db.users[emailKey].profile.badges.push('Eco Commando');
      }
    }

    writeDB(db);
    return {
      challenges: db.users[emailKey].challenges,
      newPoints: db.users[emailKey].profile.points,
      newBadges: db.users[emailKey].profile.badges
    };
  }
  return { challenges: [], newPoints: 0, newBadges: [] };
}

// 9. Get Dynamic Leaderboard
export function getLocalLeaderboard(email: string): LeaderboardEntry[] {
  const db = readDB();
  const allUsersEntries: LeaderboardEntry[] = Object.values(db.users).map(u => ({
    rank: 0,
    name: `${u.profile.firstName} ${u.profile.lastName}`,
    points: u.profile.points,
    avatarSeed: u.profile.firstName.substring(0, 4).toLowerCase(),
    badges: u.profile.badges,
    sustainabilityScore: u.profile.sustainabilityScore || 60
  }));

  const merged = [...DEFAULT_LEADERBOARD];
  allUsersEntries.forEach(ent => {
    const idx = merged.findIndex(m => m.name === ent.name);
    if (idx === -1) {
      merged.push(ent);
    } else {
      // replace if actual active registered has different points
      merged[idx] = {
        ...merged[idx],
        points: ent.points,
        badges: ent.badges,
        sustainabilityScore: ent.sustainabilityScore
      };
    }
  });

  merged.sort((a, b) => b.points - a.points);
  return merged.map((e, idx) => ({
    ...e,
    rank: idx + 1
  }));
}
