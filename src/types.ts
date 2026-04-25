/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female' | 'other';
  goals: {
    weight: number;
    water: number; // ml
    sleep: number; // hours
  };
  notifications: {
    waterReminder: boolean;
    usageAlert: boolean;
  };
  contacts: Array<{ name: string; tel: string }>;
}

export interface HealthLog {
  id: string;
  type: 'water' | 'food' | 'activity' | 'sleep' | 'weight';
  value: number;
  unit: string;
  timestamp: number;
  note?: string;
  metadata?: any;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  waterTotal: number;
  caloriesTotal: number;
  activeMinutes: number;
  sleepHours: number;
  weight: number;
}
