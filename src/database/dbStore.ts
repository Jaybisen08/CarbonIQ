import fs from 'fs';
import path from 'path';
import { UserProfile, CarbonCalculatorData, EmissionsBreakdown, Goal, Challenge, Recommendation, LeaderboardEntry } from '../types';

interface DBStructure {
  users: Record<string, {
    profile: UserProfile;
    passwordHash: string;
    calculations: EmissionsBreakdown[];
    goals: Goal[];
    challenges: Challenge[];
    recommendations: Recommendation[];
  }>;
}

const DB_FILE = path.join(process.cwd(), 'src', 'database', 'db.json');

// Ensure database directory exists
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initial default challenges
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

// Initial default leaderboard (premium-grade users to look highly realistic)
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Elena Rostova', points: 2450, avatarSeed: 'elena', badges: ['Eco Titan', 'Carbon Neutralist', 'Goal Crusher'], sustainabilityScore: 94 },
  { rank: 2, name: 'Marcus Sterling', points: 2180, avatarSeed: 'marcus', badges: ['Grid Warrior', 'Green Commuter'], sustainabilityScore: 91 },
  { rank: 3, name: 'Siddharth Mehta', points: 1950, avatarSeed: 'sid', badges: ['Zero Waste Champ', 'Plant-Powered'], sustainabilityScore: 89 },
  { rank: 4, name: 'Chloë Lefevre', points: 1720, avatarSeed: 'chloe', badges: ['Carbon Neutralist', 'Warm Wash Banter'], sustainabilityScore: 86 },
  { rank: 5, name: 'Kai Takahashi', points: 1510, avatarSeed: 'kai', badges: ['Renewable Pro'], sustainabilityScore: 82 }
];

function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading file database, returning initial clean format', err);
  }
  return { users: {} };
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing file database', err);
  }
}

// Add a demo user immediately to make sure they can explore with gorgeous data without registering!
const DEMO_EMAIL = 'demo@carboniq.com';
const db = readDB();

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
    badges: ['Grid Explorer', 'Eco Pioneer', 'Challenge Champion']
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

  db.users[DEMO_EMAIL] = {
    profile: demoProfile,
    passwordHash: 'demosecret', // In production, hash this properly.
    calculations: demoCalculations,
    goals: demoGoals,
    challenges: [...DEFAULT_CHALLENGES],
    recommendations: demoRecommendations
  };
  
  // Make Sarah Chen part of standard challenges
  db.users[DEMO_EMAIL].challenges[2].joined = true; // Slayer joined
  db.users[DEMO_EMAIL].challenges[3].joined = true; // Veggie power joined and completed
  db.users[DEMO_EMAIL].challenges[3].completed = true;

  writeDB(db);
}

export const DBStore = {
  getUsers() { return readDB().users; },

  getUser(email: string) {
    const db = readDB();
    return db.users[email.toLowerCase()] || null;
  },

  registerUser(password: string, profile: UserProfile) {
    const db = readDB();
    const emailKey = profile.email.toLowerCase();
    if (db.users[emailKey]) {
      throw new Error('Email is already registered');
    }
    db.users[emailKey] = {
      profile,
      passwordHash: password, // Store password as string for simplify in sandbox environments
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
      challenges: [...DEFAULT_CHALLENGES],
      recommendations: []
    };
    writeDB(db);
    return db.users[emailKey];
  },

  updateUserProfile(email: string, profileUpdate: Partial<UserProfile>) {
    const db = readDB();
    const emailKey = email.toLowerCase();
    if (db.users[emailKey]) {
      db.users[emailKey].profile = {
        ...db.users[emailKey].profile,
        ...profileUpdate
      };
      writeDB(db);
      return db.users[emailKey].profile;
    }
    return null;
  },

  saveCalculations(email: string, calculation: EmissionsBreakdown) {
    const db = readDB();
    const emailKey = email.toLowerCase();
    if (db.users[emailKey]) {
      // Keep calculations array limited to the last 12 months, or append
      // If user logs identical date, replace, else append
      const existingIdx = db.users[emailKey].calculations.findIndex(c => c.date === calculation.date);
      if (existingIdx !== -1) {
        db.users[emailKey].calculations[existingIdx] = calculation;
      } else {
        db.users[emailKey].calculations.push(calculation);
      }
      
      // Update User profile Sustainability Score based on the newest calculation
      db.users[emailKey].profile.sustainabilityScore = calculation.sustainabilityScore;
      
      writeDB(db);
      return db.users[emailKey].calculations;
    }
    return [];
  },

  addGoal(email: string, goal: Omit<Goal, 'id' | 'completed' | 'currentValue'>) {
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
  },

  updateGoal(email: string, goalId: string, updates: Partial<Goal>) {
    const db = readDB();
    const emailKey = email.toLowerCase();
    if (db.users[emailKey]) {
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
      // award points on complete
      const isNewlyCompleted = db.users[emailKey].goals.some(g => g.id === goalId && g.completed && !updates.completed);
      if (isNewlyCompleted) {
        db.users[emailKey].profile.points += 100;
        if (!db.users[emailKey].profile.badges.includes('Goal Crusher')) {
          db.users[emailKey].profile.badges.push('Goal Crusher');
        }
      }
      writeDB(db);
      return db.users[emailKey].goals;
    }
    return [];
  },

  deleteGoal(email: string, goalId: string) {
    const db = readDB();
    const emailKey = email.toLowerCase();
    if (db.users[emailKey]) {
      db.users[emailKey].goals = db.users[emailKey].goals.filter(g => g.id !== goalId);
      writeDB(db);
      return db.users[emailKey].goals;
    }
    return [];
  },

  joinChallenge(email: string, challengeId: string) {
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
  },

  leaveChallenge(email: string, challengeId: string) {
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
  },

  completeChallenge(email: string, challengeId: string) {
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
      return db.users[emailKey].challenges;
    }
    return [];
  },

  getLeaderboard(email: string) {
    const db = readDB();
    // Gather all users + DEFAULT_LEADERBOARD
    const allUsersEntries: LeaderboardEntry[] = Object.values(db.users).map(u => ({
      rank: 0,
      name: `${u.profile.firstName} ${u.profile.lastName}`,
      points: u.profile.points,
      avatarSeed: u.profile.firstName.substring(0, 4).toLowerCase(),
      badges: u.profile.badges,
      sustainabilityScore: u.profile.sustainabilityScore || 60
    }));

    // Merge registered with default matching profiles
    const merged = [...DEFAULT_LEADERBOARD];
    allUsersEntries.forEach(ent => {
      // If name is already in default, skip or replace, otherwise put it in
      if (!merged.some(m => m.name === ent.name)) {
        merged.push(ent);
      }
    });

    // Sort by points desc
    merged.sort((a, b) => b.points - a.points);
    // Assign ranks
    return merged.map((e, idx) => ({
      ...e,
      rank: idx + 1
    }));
  },

  saveRecommendations(email: string, rects: Recommendation[]) {
    const db = readDB();
    const emailKey = email.toLowerCase();
    if (db.users[emailKey]) {
      db.users[emailKey].recommendations = rects;
      writeDB(db);
    }
  },

  deleteAccount(email: string) {
    const db = readDB();
    const emailKey = email.toLowerCase();
    if (db.users[emailKey]) {
      delete db.users[emailKey];
      writeDB(db);
      return true;
    }
    return false;
  }
};
