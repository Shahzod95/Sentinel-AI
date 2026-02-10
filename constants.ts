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

// Center of Tashkent, Uzbekistan
export const INITIAL_MAP_CENTER = { lat: 41.311081, lng: 69.240562 };
export const INITIAL_ZOOM = 12;
