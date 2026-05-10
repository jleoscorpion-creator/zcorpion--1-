
export enum Category {
  NEEDS = 'NEEDS',
  WANTS = 'WANTS',
  SAVINGS = 'SAVINGS'
}

export enum Frequency {
  MONTHLY = 'MONTHLY',
  BIWEEKLY = 'BIWEEKLY',
  WEEKLY = 'WEEKLY'
}

export interface ReminderConfig {
  enabled: boolean;
  time: string; // HH:mm
  frequency: 'DAILY' | 'WEEKLY';
  customMessage?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
  isFixed?: boolean;
  frequency?: Frequency;
}

export interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  logo?: string;
  name?: string;
}

export interface Movement {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note: string;
}

export interface UserProfile {
  username: string;
  income: number;
  frequency: Frequency;
  currency: string;
  streak: number;
  lastLoginDate: string;
  lastStreakDate?: string;
  reminders?: ReminderConfig;
  // Gamificación
  xp: number;
  lives: number;
  level: number;
  lastLifeRegenTime?: string; // ISO string
  completedLessons: string[];
  isPremium: boolean;
  chatCount?: number;
  lastChatReset?: number;
  diamonds: number;
  claimedLessonTier1?: boolean;
  claimedLessonTier2?: boolean;
  lastCycleRewardId?: string; // ID del ciclo actual para el que se reclamó recompensa
  // Social
  friends: string[];
  friendRequests: string[];
  onboardingSeen?: string[];
  portfolio?: Position[];
  watchlist?: string[];
  isVariableIncome?: boolean;
  // Finanzas persistence
  walletBalance: number;
  movements: Movement[];
  lastResetDate: string;
  spent: number;
  budgetSplit?: BudgetSplit;
  savingsGoals?: SavingsGoal[];
}

export interface BudgetSplit {
  needs: number;
  wants: number;
  savings: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: string;
}

export interface SocialMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}
