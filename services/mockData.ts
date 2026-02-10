import { CrimeIncident, CrimeType, RegionStats } from '../types';

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