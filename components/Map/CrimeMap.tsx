import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, CircleMarker, Popup, Tooltip, GeoJSON, useMapEvents, useMap } from 'react-leaflet';
import { CrimeIncident, CrimeType, Language } from '../../types';
import { CRIME_COLORS, crimeTypeLabels, INITIAL_MAP_CENTER, INITIAL_ZOOM } from '../../constants';
import { AlertTriangle, MapPin } from 'lucide-react';
import { REGIONS_GEOJSON, getDistrictsGeoJson, NEIGHBORHOODS_GEOJSON } from '../../services/geoData';
import uzbekistanBorder from '../../services/uzbekistan.json';
import { TRANSLATIONS } from '../../services/translations';

interface CrimeMapProps {
  crimes: CrimeIncident[];
  language: Language;
  datasetLabel: string;
}

const ZoomHandler = ({ setZoom }: { setZoom: (z: number) => void }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });
  return null;
};

const MapController = ({
  reset
}: {
  reset: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    // Standard Leaflet fix for maps that might have been hidden/uncentered on mount
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  useEffect(() => {
    if (reset) {
      map.setView([INITIAL_MAP_CENTER.lat, INITIAL_MAP_CENTER.lng], 5, {
        animate: true,
        duration: 1.5
      });
    }
  }, [reset, map]);

  return null;
};

const CrimeMap: React.FC<CrimeMapProps> = ({ crimes, language, datasetLabel }) => {
  const [currentZoom, setCurrentZoom] = useState(INITIAL_ZOOM);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [resetToggle, setResetToggle] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);

  const t = TRANSLATIONS[language];

  const groupedCrimes = useMemo(() => {
    const byDistrict: Record<string, {
      count: number;
      latSum: number;
      lngSum: number;
      sample: CrimeIncident;
    }> = {};

    crimes.forEach((crime) => {
      if (!byDistrict[crime.district]) {
        byDistrict[crime.district] = {
          count: 0,
          latSum: 0,
          lngSum: 0,
          sample: crime,
        };
      }

      byDistrict[crime.district].count += 1;
      byDistrict[crime.district].latSum += crime.location.lat;
      byDistrict[crime.district].lngSum += crime.location.lng;
    });

    return Object.entries(byDistrict).map(([district, data]) => ({
      id: `group-${district}`,
      district,
      count: data.count,
      location: {
        lat: data.latSum / data.count,
        lng: data.lngSum / data.count,
      },
      sample: data.sample,
    }));
  }, [crimes]);

  const getRegionLabel = (properties: Record<string, any>) =>
    properties?.name || properties?.ADM1_EN || properties?.ADM1_RU || properties?.ADM1_UZ || 'Unknown';

  const regionStyle = {
    color: '#60a5fa',
    weight: 1.5,
    fillOpacity: 0,
    fillColor: 'transparent',
    opacity: 0.6,
  };

  const districtStyle = {
    color: '#60a5fa',
    weight: 1,
    fillOpacity: 0,
    fillColor: 'transparent',
    opacity: 0.5,
  };

  const neighborhoodStyle = {
    color: '#f59e0b',
    weight: 1,
    fillOpacity: 0,
    fillColor: 'transparent',
    opacity: 0.4,
    dashArray: '2, 4',
  };

  // O'zbekiston tashqi chegarasi — har doim ko'rinadi, region/zoom ga bog'liq emas
  const uzbekistanBorderStyle = {
    color: '#94a3b8',   // Slate-400 — aniq ko'rinadigan kulrang
    weight: 3,
    opacity: 1,
    fillOpacity: 0,
    fillColor: 'transparent',
  };

  const onEachRegion = (feature: any, layer: any) => {
    const regionName = getRegionLabel(feature.properties);

    layer.bindTooltip(regionName, {
      direction: 'center',
      className: 'bg-slate-800/90 border border-blue-500/50 text-blue-300 font-bold shadow-lg px-2 py-1 rounded',
      permanent: false,
    });

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          weight: 2.5,
          color: '#3b82f6',
          fillOpacity: 0.15,
          fillColor: '#3b82f6',
          opacity: 1,
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle(regionStyle);
      },
      click: (e: any) => {
        const bounds = e.target.getBounds();
        e.target._map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 10,
          animate: true,
          duration: 1.2
        });
        setSelectedRegion(regionName);
      },
    });
  };

  const onEachDistrict = (feature: any, layer: any) => {
    layer.bindTooltip(feature.properties.name, {
      direction: 'center',
      className: 'bg-slate-800/90 border border-blue-500/50 text-blue-300 font-semibold text-xs shadow-lg px-2 py-1 rounded',
      permanent: false,
    });

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          weight: 2,
          color: '#3b82f6',
          fillOpacity: 0.2,
          fillColor: '#3b82f6',
          opacity: 1,
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle(districtStyle);
      },
    });
  };

  const showRegions = selectedRegion === null;
  const showDistricts = selectedRegion !== null;
  const showNeighborhoods = selectedRegion !== null && currentZoom >= 14;

  const currentDistricts = selectedRegion ? getDistrictsGeoJson(selectedRegion) : null;
  const hasDistricts = currentDistricts && (currentDistricts as any).features.length > 0;

  // Agar distriktlar bo'sh bo'lsa — debug uchun
  if (selectedRegion && !hasDistricts) {
    console.warn(`[CrimeMap] "${selectedRegion}" uchun districtlar topilmadi.`);
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
      <MapContainer
        center={INITIAL_MAP_CENTER}
        zoom={INITIAL_ZOOM}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        ref={setMapRef}
      >
        <ZoomHandler setZoom={setCurrentZoom} />
        <MapController
          reset={resetToggle}
        />

        {/* TileLayer olib tashlandi — boshqa davlatlar ko'rinmasligi uchun */}

        {/* O'zbekiston tashqi chegarasi — HAR DOIM ko'rinadi */}
        <GeoJSON
          key="uzbekistan-border"
          data={uzbekistanBorder as any}
          style={uzbekistanBorderStyle}
        />

        {/* Region chegaralari — faqat hech qaysi region tanlanmaganda */}
        {showRegions && (
          <GeoJSON
            key="regions"
            data={REGIONS_GEOJSON as any}
            style={regionStyle}
            onEachFeature={onEachRegion}
          />
        )}

        {/* District chegaralari — FAQAT region bosilganda va FAQAT o'sha regionniki */}
        {showDistricts && hasDistricts && (
          <GeoJSON
            key={`districts-${selectedRegion}`}
            data={currentDistricts as any}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        )}

        {/* Mahalla chegaralari — region tanlanganda va yaqin zoomda */}
        {showNeighborhoods && (
          <GeoJSON
            key="neighborhoods"
            data={NEIGHBORHOODS_GEOJSON as any}
            style={neighborhoodStyle}
            onEachFeature={(feature, layer) => {
              layer.bindTooltip(feature.properties.name, {
                direction: 'center',
                className: 'bg-transparent border-0 text-amber-400 text-[10px] shadow-none',
              });
            }}
          />
        )}

        {/* Jinoyat nuqtalari (hudud bo'yicha agregatsiya) */}
        {groupedCrimes.map((crimeGroup) => (
          <CircleMarker
            key={crimeGroup.id}
            center={[crimeGroup.location.lat, crimeGroup.location.lng]}
            pathOptions={{
              color: CRIME_COLORS[crimeGroup.sample.type],
              fillColor: CRIME_COLORS[crimeGroup.sample.type],
              fillOpacity: 0.8,
              weight: 1,
            }}
            radius={Math.min(18, Math.max(currentZoom > 13 ? 8 : 6, 5 + Math.log2(crimeGroup.count + 1) * 2))}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded text-white"
                    style={{ backgroundColor: CRIME_COLORS[crimeGroup.sample.type] }}
                  >
                    {datasetLabel}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {new Date(crimeGroup.sample.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{crimeGroup.district}</h3>
                <p className="text-slate-600 text-xs mb-2">{crimeGroup.sample.description}</p>
                {/* <div className="flex items-center text-xs font-medium text-slate-500">
                  <AlertTriangle size={12} className="mr-1" />
                  {t.col_severity}:{' '}
                  <span className={`ml-1 ${crimeGroup.sample.severity === 'Critical' ? 'text-red-600' : 'text-slate-600'}`}>
                    {crimeGroup.sample.severity}
                  </span>
                </div> */}
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span className="font-bold text-xs">{crimeGroup.district}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Orqaga qaytish tugmasi */}
      {selectedRegion && (
        <button
          onClick={() => {
            setSelectedRegion(null);
            setResetToggle(prev => !prev);
          }}
          className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-blue-500/50 px-4 py-2 rounded-lg z-[1000] text-sm text-blue-300 font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-lg flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t.map_back || 'Back to Regions'}
        </button>
      )}

      {/* Zoom indikatori */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1 rounded-lg z-[1000] text-xs text-slate-400 font-mono">
        {t.map_zoom}: {currentZoom}
      </div>

      {/* Xarita legendasi */}
      {/* <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg z-[1000] text-xs">
        <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-2">
          <MapPin size={14} /> {t.map_legend}
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(CRIME_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-slate-400">{crimeTypeLabels[language][type as CrimeType]}</span>
            </div>
          ))}
          <div className="col-span-2 mt-2 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-1 bg-slate-500"></div>
              <span className="text-slate-500">{t.legend_country}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-1 bg-blue-500"></div>
              <span className="text-blue-500">{t.legend_region}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-1 bg-emerald-500"></div>
              <span className="text-emerald-500">{t.legend_district}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-amber-500"></div>
              <span className="text-amber-500">{t.legend_mahalla}</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default CrimeMap;
