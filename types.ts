
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

export interface UserProfile {
  username: string;
  income: number;
  frequency: Frequency;
  currency: string;
  streak: number;
  lastLoginDate: string;
  reminders?: ReminderConfig;
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
