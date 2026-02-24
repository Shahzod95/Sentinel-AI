import { CrimeIncident, CrimeType, Language, RegionStats } from '../types';
import aniqlanadiganJinoyatlar from '../mockData/jinoyat_turlari/aniqlanadigan_jinoyatlar.json';
import kiberJinoyat from '../mockData/jinoyat_turlari/kiber_jinoyat.json';
import oldiniOlish from '../mockData/jinoyat_turlari/oldini_olish.json';

const generateRandomCoordinate = (centerLat: number, centerLng: number, radiusKm: number) => {
  const r = radiusKm / 111.32; // Convert km to degrees roughly
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  return {
    lat: centerLat + x,
    lng: centerLng + y / Math.cos(centerLat)
  };
};

const SEVERITY_MAP: Record<CrimeType, 'Low' | 'Medium' | 'High' | 'Critical'> = {
  [CrimeType.THEFT]: 'Low',
  [CrimeType.ASSAULT]: 'High',
  [CrimeType.BURGLARY]: 'Medium',
  [CrimeType.VANDALISM]: 'Low',
  [CrimeType.DRUGS]: 'Medium',
  [CrimeType.TRAFFIC]: 'Low',
  [CrimeType.HOMICIDE]: 'Critical',
};

export type MapDatasetKey = 'aniqlanadigan' | 'kiber' | 'oldini_olish';

export const MAP_DATASET_LABELS: Record<Language, Record<MapDatasetKey, string>> = {
  en: {
    aniqlanadigan: 'Detectable Crimes',
    kiber: 'Cyber Crimes',
    oldini_olish: 'Preventable Crimes',
  },
  uz: {
    aniqlanadigan: 'Aniqlanadigan jinoyatlar',
    kiber: 'Kiber jinoyatlar',
    oldini_olish: 'Oldini olish mumkin bo`lgan jinoyatlar',
  },
  ru: {
    aniqlanadigan: 'Выявляемые преступления',
    kiber: 'Киберпреступления',
    oldini_olish: 'Предотвращаемые преступления',
  },
};

const REGION_CENTER_MAP: Record<string, { lat: number; lng: number }> = {
  'Toshkent sh.': { lat: 41.3111, lng: 69.2797 },
  'Toshkent viloyati': { lat: 41.0027, lng: 69.2372 },
  'Samarqand viloyati': { lat: 39.6542, lng: 66.9597 },
  'Sirdaryo viloyati': { lat: 40.838, lng: 68.6617 },
  'Jizzax viloyati': { lat: 40.1158, lng: 67.8422 },
  'Buxoro viloyati': { lat: 39.7747, lng: 64.4286 },
  'Navoiy viloyati': { lat: 40.0844, lng: 65.3792 },
  "Farg'ona viloyati": { lat: 40.3734, lng: 71.7978 },
  'Andijon viloyati': { lat: 40.7837, lng: 72.3439 },
  'Namangan viloyati': { lat: 41.0058, lng: 71.6436 },
  'Surxondaryo viloyati': { lat: 37.9409, lng: 67.5709 },
  'Qashqadaryo viloyati': { lat: 38.8411, lng: 65.7888 },
  'Xorazm viloyati': { lat: 41.55, lng: 60.63 },
  'Qoraqalpogʻiston Respublikasi': { lat: 43.7683, lng: 59.0214 },
};

const RAW_REGION_TO_GEO: Record<string, string> = {
  Toshkent_shahri: 'Toshkent sh.',
  Toshkent_viloyati: 'Toshkent viloyati',
  Samarqand: 'Samarqand viloyati',
  Sirdaryo: 'Sirdaryo viloyati',
  Jizzax: 'Jizzax viloyati',
  Buxoro: 'Buxoro viloyati',
  Navoiy: 'Navoiy viloyati',
  Fargona: "Farg'ona viloyati",
  Andijon: 'Andijon viloyati',
  Namangan: 'Namangan viloyati',
  Surxondaryo: 'Surxondaryo viloyati',
  Qashqadaryo: 'Qashqadaryo viloyati',
  Xorazm: 'Xorazm viloyati',
  Qoraqalpogiston_Respublikasi: 'Qoraqalpogʻiston Respublikasi',
};

const DATASET_CRIME_TYPE: Record<MapDatasetKey, CrimeType> = {
  aniqlanadigan: CrimeType.THEFT,
  kiber: CrimeType.TRAFFIC,
  oldini_olish: CrimeType.BURGLARY,
};

const INCIDENT_SCALE = 100;

// Tashkent Districts
const DISTRICTS = [
  'Chilonzor', 
  'Yunusobod', 
  'Mirzo Ulugbek', 
  'Yashnobod', 
  'Sergeli', 
  'Shayxontohur', 
  'Olmazor', 
  'Uchtepa', 
  'Bektemir', 
  'Mirobod', 
  'Yakkasaray',
  'Yangihayot'
];

export const generateMockCrimes = (count: number): CrimeIncident[] => {
  const crimes: CrimeIncident[] = [];
  const baseDate = new Date();

  for (let i = 0; i < count; i++) {
    const type = Object.values(CrimeType)[Math.floor(Math.random() * Object.values(CrimeType).length)];
    const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
    const date = new Date(baseDate);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

    // Tashkent center
    let centerLat = 41.311081;
    let centerLng = 69.240562;
    
    // Slight shifts for different districts to create clusters
    if (district === 'Yunusobod') { centerLat += 0.05; }
    if (district === 'Sergeli') { centerLat -= 0.05; }
    if (district === 'Yashnobod') { centerLng += 0.05; }
    if (district === 'Chilonzor') { centerLng -= 0.04; }

    crimes.push({
      id: `UZ-${1000 + i}`,
      type,
      date: date.toISOString(),
      location: generateRandomCoordinate(centerLat, centerLng, 3.5),
      region: 'Tashkent',
      district,
      description: `Reported incident of ${type.toLowerCase()} in ${district}.`,
      severity: SEVERITY_MAP[type],
    });
  }
  return crimes;
};

export const MOCK_CRIMES = generateMockCrimes(200);

const parseDataset = (jsonData: Record<string, any>) => {
  const entries = Object.entries(jsonData).find(([key]) => key !== 'jami_respublika');
  if (!entries) return {};
  return entries[1] as Record<string, number>;
};

const generateDatasetCrimes = (datasetKey: MapDatasetKey, jsonData: Record<string, any>): CrimeIncident[] => {
  const regionCounts = parseDataset(jsonData);
  const type = DATASET_CRIME_TYPE[datasetKey];
  const crimes: CrimeIncident[] = [];
  let index = 1;

  Object.entries(regionCounts).forEach(([rawRegion, total]) => {
    const mappedRegion = RAW_REGION_TO_GEO[rawRegion];
    if (!mappedRegion || !REGION_CENTER_MAP[mappedRegion]) return;

    const center = REGION_CENTER_MAP[mappedRegion];
    const pointsCount = Math.max(1, Math.round(total / INCIDENT_SCALE));

    for (let i = 0; i < pointsCount; i++) {
      const point = generateRandomCoordinate(center.lat, center.lng, 18);
      crimes.push({
        id: `${datasetKey.toUpperCase()}-${String(index++).padStart(5, '0')}`,
        type,
        date: new Date().toISOString(),
        location: point,
        region: 'Uzbekistan',
        district: mappedRegion,
        description: `${mappedRegion}: ${total} ta holat`,
        severity: total > 5000 ? 'Critical' : total > 2500 ? 'High' : total > 1200 ? 'Medium' : 'Low',
      });
    }
  });

  return crimes;
};

export const MAP_DATASET_CRIMES: Record<MapDatasetKey, CrimeIncident[]> = {
  aniqlanadigan: generateDatasetCrimes('aniqlanadigan', aniqlanadiganJinoyatlar as Record<string, any>),
  kiber: generateDatasetCrimes('kiber', kiberJinoyat as Record<string, any>),
  oldini_olish: generateDatasetCrimes('oldini_olish', oldiniOlish as Record<string, any>),
};

const extractRegionTotals = (jsonData: Record<string, any>) => {
  const rawTotals = parseDataset(jsonData);
  return Object.entries(rawTotals)
    .map(([rawRegion, total]) => {
      const mappedRegion = RAW_REGION_TO_GEO[rawRegion];
      if (!mappedRegion) return null;
      return { regionName: mappedRegion, totalCrimes: total };
    })
    .filter((item): item is { regionName: string; totalCrimes: number } => item !== null);
};

export const MAP_DATASET_REGION_TOTALS: Record<MapDatasetKey, { regionName: string; totalCrimes: number }[]> = {
  aniqlanadigan: extractRegionTotals(aniqlanadiganJinoyatlar as Record<string, any>),
  kiber: extractRegionTotals(kiberJinoyat as Record<string, any>),
  oldini_olish: extractRegionTotals(oldiniOlish as Record<string, any>),
};

export const calculateRegionStatsFromTotals = (
  totals: { regionName: string; totalCrimes: number }[],
  defaultCrimeType: CrimeType = CrimeType.THEFT
): RegionStats[] => {
  const maxTotal = Math.max(...totals.map((item) => item.totalCrimes), 1);
  return totals.map((item) => ({
    regionName: item.regionName,
    totalCrimes: item.totalCrimes,
    riskScore: Math.min(100, Math.round((item.totalCrimes / maxTotal) * 100)),
    trend: 'Stable',
    topCrimeType: defaultCrimeType,
  }));
};

export const calculateRegionStats = (crimes: CrimeIncident[]): RegionStats[] => {
  const districtCounts: Record<string, { total: number; types: Record<string, number> }> = {};

  crimes.forEach(crime => {
    if (!districtCounts[crime.district]) {
      districtCounts[crime.district] = { total: 0, types: {} };
    }
    districtCounts[crime.district].total++;
    districtCounts[crime.district].types[crime.type] = (districtCounts[crime.district].types[crime.type] || 0) + 1;
  });

  return Object.keys(districtCounts).map(district => {
    const data = districtCounts[district];
    const topType = Object.entries(data.types).sort((a, b) => b[1] - a[1])[0][0] as CrimeType;
    
    // Simple mock logic for risk score
    let riskScore = Math.min(100, Math.floor((data.total / crimes.length) * 400)); 
    
    return {
      regionName: district,
      totalCrimes: data.total,
      riskScore,
      trend: Math.random() > 0.5 ? 'Up' : 'Down',
      topCrimeType: topType,
    };
  });
};
