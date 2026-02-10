// Approximated and simplified GeoJSON data for demonstration purposes
// Corrected structure for Uzbekistan's complex borders including exclaves
import regions from '../data/regions.js';
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

const normalizeRegions = (fc: any) => ({
  type: 'FeatureCollection',
  features: (fc?.features ?? []).map((f: any) => ({
    ...f,
    geometry: normalizeGeometry(f.geometry),
  })).filter((f: any) => !!f.geometry),
});

// Merge all region data sources
const mergeRegionData = () => {
  const allRegions = [
    regions,
    andijon,
    buxoro,
    fargona,
    jizzax,
    namangan,
    navoiy,
    qashqadaryo,
    qoraqalpogiston,
    samarqand,
    sirdaryo,
    surxondaryo,
    toshkent,
    xorazm
  ];

  const allFeatures = allRegions.flatMap((region: any) => region?.features ?? []);

  return {
    type: 'FeatureCollection',
    features: allFeatures
  };
};

// Real regions data (viloyatlar) sourced from local data files
export const REGIONS_GEOJSON = normalizeRegions(mergeRegionData() as any);

// Districts within Tashkent City
export const DISTRICTS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Chilonzor" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [69.18, 41.28], [69.24, 41.28], [69.24, 41.25], [69.18, 41.25], [69.18, 41.28]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Yunusobod" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [69.25, 41.35], [69.30, 41.35], [69.30, 41.30], [69.25, 41.30], [69.25, 41.35]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Mirzo Ulugbek" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [69.30, 41.34], [69.35, 41.34], [69.35, 41.29], [69.30, 41.29], [69.30, 41.34]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Yashnobod" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [69.28, 41.29], [69.34, 41.29], [69.34, 41.25], [69.28, 41.25], [69.28, 41.29]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Sergeli" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [69.18, 41.24], [69.25, 41.24], [69.25, 41.20], [69.18, 41.20], [69.18, 41.24]
        ]]
      }
    }
  ]
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
