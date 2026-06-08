export interface UserProfile {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  country: string;
  email: string;
  occupation: string;
  isStudent: boolean; // Student vs Professional
  dietType: 'Vegan' | 'Vegetarian' | 'Flexitarian' | 'Meat Lover';
  householdSize: number;
  primaryTransport: 'Electric' | 'Hybrid' | 'Gasoline' | 'Public' | 'Walk/Bike';
  prefSustainabilityTips: boolean;
  prefEmailNotifications: boolean;
  points: number;
  badges: string[];
  renewableEnergy?: boolean;
  sustainabilityScore?: number;
}

export interface CarbonCalculatorData {
  // Transportation
  vehicleType: string;
  fuelType: string;
  dailyDistance: number; // in km
  flightsPerYear: number;

  // Electricity
  monthlyConsumption: number; // in kWh
  acUsage: 'Low' | 'Medium' | 'High' | 'None';
  renewableEnergy: boolean;

  // Food
  dietType: 'Vegan' | 'Vegetarian' | 'Flexitarian' | 'Meat Lover';
  dairyConsumption: 'None' | 'Low' | 'Medium' | 'High';
  foodWaste: 'None' | 'Low' | 'Medium' | 'High';

  // Lifestyle
  shoppingFrequency: 'Rarely' | 'Occasionally' | 'Frequently';
  electronicsPurchases: number; // items per year
  recyclingHabits: 'Always' | 'Sometimes' | 'Never';
}

export interface EmissionsBreakdown {
  id?: string;
  date: string;
  transportation: number; // kg CO2e / month
  electricity: number; // kg CO2e / month
  food: number; // kg CO2e / month
  lifestyle: number; // kg CO2e / month
  total: number; // kg CO2e / month
  sustainabilityScore: number; // 0 - 100
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'transportation' | 'electricity' | 'food' | 'lifestyle';
  co2Savings: number; // kg CO2 / year
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impactScore: number; // 0 - 100
  joined?: boolean;
  completed?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'transportation' | 'electricity' | 'food' | 'lifestyle';
  targetValue: number; // target reduction in kg CO2
  currentValue: number; // current reduction
  completed: boolean;
  deadline: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  duration: string;
  category: 'transportation' | 'electricity' | 'food' | 'lifestyle';
  joined: boolean;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatarSeed: string;
  badges: string[];
  sustainabilityScore: number;
}
