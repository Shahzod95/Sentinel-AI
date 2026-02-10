export enum CrimeType {
  THEFT = 'Theft',
  ASSAULT = 'Assault',
  BURGLARY = 'Burglary',
  VANDALISM = 'Vandalism',
  DRUGS = 'Narcotics',
  TRAFFIC = 'Traffic Violation',
  HOMICIDE = 'Homicide'
}

export enum RegionLevel {
  COUNTRY = 'Country',
  REGION = 'Region',
  DISTRICT = 'District',
  NEIGHBORHOOD = 'Neighborhood'
}

export type Language = 'en' | 'uz' | 'ru';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CrimeIncident {
  id: string;
  type: CrimeType;
  date: string; // ISO String
  location: Coordinates;
  region: string;
  district: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface RegionStats {
  regionName: string;
  totalCrimes: number;
  riskScore: number; // 0-100
  trend: 'Up' | 'Down' | 'Stable';
  topCrimeType: CrimeType;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  selectedTypes: CrimeType[];
  searchQuery: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}