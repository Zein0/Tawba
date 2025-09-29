export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerType = 'current' | 'qada';

export interface MissedEstimate {
  prayer: PrayerName;
  initialCount: number;
}

export interface PrayerLog {
  id: number;
  date: string;
  prayer: PrayerName;
  type: PrayerType;
  count: number;
  loggedAt: string;
}

export interface Settings {
  language: 'en' | 'ar';
  fontSize: 'small' | 'medium' | 'large';
  startDate: string | null;
  remindersEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  location?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface PrayerSummary {
  prayer: PrayerName;
  remaining: number;
  totalQadaPrayed: number;
  totalCurrentPrayed: number;
  initialCount: number;
  missedTotal: number;
}

export interface ProgressProjection {
  dailyAverage: number;
  projectedCompletionDate: string | null;
}

export type FontScale = 'text-sm' | 'text-base' | 'text-lg';
