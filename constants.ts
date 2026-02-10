import { CrimeType } from './types';

export const CRIME_COLORS: Record<CrimeType, string> = {
  [CrimeType.THEFT]: '#3b82f6', // Blue
  [CrimeType.ASSAULT]: '#ef4444', // Red
  [CrimeType.BURGLARY]: '#f97316', // Orange
  [CrimeType.VANDALISM]: '#eab308', // Yellow
  [CrimeType.DRUGS]: '#a855f7', // Purple
  [CrimeType.TRAFFIC]: '#10b981', // Emerald
  [CrimeType.HOMICIDE]: '#dc2626', // Dark Red
};

// ✅ O'zbekiston butun ko'rinishi uchun — region tanlash imkoni bo'lsin
export const INITIAL_MAP_CENTER = { lat: 41.3775, lng: 63.5 };
export const INITIAL_ZOOM = 6; // Butun O'zbekiston ko'rinadi
