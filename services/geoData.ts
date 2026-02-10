// Approximated and simplified GeoJSON data for demonstration purposes
// Corrected structure for Uzbekistan's complex borders including exclaves
import regions from '../data/regions.json';
import andijon from '../data/andijon.js';
import buxoro from '../data/buxoro.js';
import fargona from '../data/fargona.js';
import jizzax from '../data/jizzax.js';
import namangan from '../data/namangan.js';
import navoiy from '../data/navoiy.js';
import qashqadaryo from '../data/qashqadaryo.js';
import qoraqalpogiston from '../data/qoraqalpogiston.js';
import samarqand from '../data/samarqand.js';
import sirdaryo from '../data/sirdaryo.js';
import surxondaryo from '../data/surxondaryo.js';
import toshkent from '../data/toshkent.js';
import xorazm from '../data/xorazm.js';

export const UZBEKISTAN_BORDER = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Uzbekistan" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          // Main Body
          [[
            [56.0, 45.0], [73.0, 45.0], [73.0, 37.0], [56.0, 37.0], [56.0, 45.0]
          ]],
          // Exclave simulation (e.g., Sokh)
          [[
            [71.800885, 40.003191], [71.78075, 40.02075], [71.777815, 40.021125],
            [71.776313, 40.019487], [71.810816, 40.003772], [71.800885, 40.003191]
          ]],
          // Exclave simulation (e.g., Shohimardan)
          [[
            [71.007037, 40.182499], [70.99962, 40.184521], [71.041789, 40.181824],
            [71.02095, 40.178147], [71.007037, 40.182499]
          ]]
        ]
      }
    }
  ]
};

// mapping of region names to their respective district data
const DISTRICT_DATA_MAP: Record<string, any> = {
  "Andijon viloyati": andijon,
  "Buxoro viloyati": buxoro,
  "Farg'ona viloyati": fargona,
  "Jizzax viloyati": jizzax,
  "Namangan viloyati": namangan,
  "Navoiy viloyati": navoiy,
  "Qashqadaryo viloyati": qashqadaryo,
  "Qoraqalpogʻiston Respublikasi": qoraqalpogiston,
  "Samarqand viloyati": samarqand,
  "Sirdaryo viloyati": sirdaryo,
  "Surxondaryo viloyati": surxondaryo,
  "Toshkent viloyati": toshkent,
  "Toshkent sh.": toshkent, // Tashkent City districts are in toshkent.js
  "Xorazm viloyati": xorazm
};

// Normalize GeometryCollections (Leaflet can be picky with them)
const normalizeGeometry = (geometry: any) => {
  if (!geometry) return geometry;
  if (geometry.type === 'GeometryCollection' && Array.isArray(geometry.geometries)) {
    const polys = geometry.geometries.filter((g: any) => g?.type === 'Polygon' || g?.type === 'MultiPolygon');
    if (polys.length === 1) return polys[0];
    if (polys.length > 1) {
      const coordinates = polys.flatMap((g: any) =>
        g.type === 'Polygon' ? [g.coordinates] : g.coordinates
      );
      return { type: 'MultiPolygon', coordinates };
    }
  }
  return geometry;
};

const normalizeFeatureCollection = (fc: any) => ({
  type: 'FeatureCollection',
  features: (fc?.features ?? []).map((f: any) => ({
    ...f,
    geometry: normalizeGeometry(f.geometry),
  })).filter((f: any) => !!f.geometry),
});

// Real regions data (viloyatlar) - now using ONLY the top-level regions file
export const REGIONS_GEOJSON = normalizeFeatureCollection(regions);

export const getDistrictsGeoJson = (regionName: string) => {
  // Try to find matching data in our map
  // Note: regionName should match the 'name' property in regions.json
  const data = DISTRICT_DATA_MAP[regionName];
  if (!data) return { type: "FeatureCollection", features: [] };
  return normalizeFeatureCollection(data);
};




// Neighborhoods (Mahallas) - Simulated for Chilonzor district
const generateMahallas = () => {
  const features = [];
  const startLat = 41.25;
  const startLng = 69.18;
  const rows = 3;
  const cols = 3;
  const latStep = 0.01;
  const lngStep = 0.02;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const bLat = startLat + (i * latStep);
      const bLng = startLng + (j * lngStep);
      features.push({
        type: "Feature",
        properties: { name: `Mahalla-${i}-${j}` },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [bLng, bLat + latStep],
            [bLng + lngStep, bLat + latStep],
            [bLng + lngStep, bLat],
            [bLng, bLat],
            [bLng, bLat + latStep]
          ]]
        }
      });
    }
  }
  return features;
};

export const NEIGHBORHOODS_GEOJSON = {
  type: "FeatureCollection",
  features: generateMahallas()
};
