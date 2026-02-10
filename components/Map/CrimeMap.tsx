import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, GeoJSON, useMapEvents } from 'react-leaflet';
import { CrimeIncident, Language } from '../../types';
import { CRIME_COLORS, INITIAL_MAP_CENTER, INITIAL_ZOOM } from '../../constants';
import { AlertTriangle, MapPin } from 'lucide-react';
import { UZBEKISTAN_BORDER, REGIONS_GEOJSON, DISTRICTS_GEOJSON, NEIGHBORHOODS_GEOJSON } from '../../services/geoData';
import { TRANSLATIONS } from '../../services/translations';

interface CrimeMapProps {
  crimes: CrimeIncident[];
  language: Language;
}

// Component to handle zoom events
const ZoomHandler = ({ setZoom }: { setZoom: (z: number) => void }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });
  return null;
};

const CrimeMap: React.FC<CrimeMapProps> = ({ crimes, language }) => {
  const [currentZoom, setCurrentZoom] = useState(INITIAL_ZOOM);
  const t = TRANSLATIONS[language];
  const getRegionLabel = (properties: Record<string, any>) =>
    properties?.name || properties?.ADM1_UZ || properties?.ADM1_EN || properties?.ADM1_RU || 'Unknown';

  // Styling functions for different layers
  const countryStyle = {
    color: '#64748b', // Slate 500
    weight: 4,
    fillOpacity: 0,
    fillColor: 'transparent'
  };

  const regionStyle = {
    color: '#60a5fa', // Light blue (blue-400)
    weight: 1.5,
    fillOpacity: 0,
    fillColor: 'transparent',
    opacity: 0.6
  };

  const districtStyle = {
    color: '#60a5fa', // Light blue (blue-400)
    weight: 1,
    fillOpacity: 0,
    fillColor: 'transparent',
    opacity: 0.5
  };

  const neighborhoodStyle = {
    color: '#f59e0b', // Amber 500
    weight: 1,
    fillOpacity: 0,
    fillColor: 'transparent',
    opacity: 0.4,
    dashArray: '2, 4'
  };

  // Hover handlers for interactive effects
  const onEachRegion = (feature: any, layer: any) => {
    layer.bindTooltip(getRegionLabel(feature.properties), {
      direction: 'center',
      className: 'bg-slate-800/90 border border-blue-500/50 text-blue-300 font-bold shadow-lg px-2 py-1 rounded',
      permanent: false
    });

    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2.5,
          color: '#3b82f6',
          fillOpacity: 0.15,
          fillColor: '#3b82f6',
          opacity: 1
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(regionStyle);
      }
    });
  };

  const onEachDistrict = (feature: any, layer: any) => {
    layer.bindTooltip(feature.properties.name, {
      direction: 'center',
      className: 'bg-slate-800/90 border border-blue-500/50 text-blue-300 font-semibold text-xs shadow-lg px-2 py-1 rounded',
      permanent: false
    });

    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#3b82f6',
          fillOpacity: 0.2,
          fillColor: '#3b82f6',
          opacity: 1
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(districtStyle);
      }
    });
  };

  // Logic for displaying layers based on zoom
  const showCountry = currentZoom < 10;
  const showRegions = currentZoom < 14;
  const showDistricts = currentZoom >= 10;
  const showNeighborhoods = currentZoom >= 14;

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
      <MapContainer
        center={INITIAL_MAP_CENTER}
        zoom={INITIAL_ZOOM}
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
      >
        <ZoomHandler setZoom={setCurrentZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Administrative Boundaries Layers */}
        {/* {showCountry && (
          <GeoJSON key="uz-borders" data={UZBEKISTAN_BORDER as any} style={countryStyle} />
        )} */}

        {showRegions && (
          <GeoJSON
            key="regions"
            data={REGIONS_GEOJSON as any}
            style={regionStyle}
            onEachFeature={onEachRegion}
          />
        )}

        {showDistricts && (
          <GeoJSON
            key="districts"
            data={DISTRICTS_GEOJSON as any}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        )}

        {showNeighborhoods && (
          <GeoJSON key="neighborhoods" data={NEIGHBORHOODS_GEOJSON as any} style={neighborhoodStyle} onEachFeature={(feature, layer) => {
            layer.bindTooltip(feature.properties.name, { direction: 'center', className: 'bg-transparent border-0 text-amber-400 text-[10px] shadow-none' });
          }} />
        )}

        {/* Crime Incidents Layer */}
        {crimes.map((crime) => (
          <CircleMarker
            key={crime.id}
            center={[crime.location.lat, crime.location.lng]}
            pathOptions={{
              color: CRIME_COLORS[crime.type],
              fillColor: CRIME_COLORS[crime.type],
              fillOpacity: 0.8,
              weight: 1
            }}
            radius={currentZoom > 13 ? 12 : 6} // Resize markers based on zoom
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded text-white"
                    style={{ backgroundColor: CRIME_COLORS[crime.type] }}
                  >
                    {crime.type}
                  </span>
                  <span className="text-slate-500 text-xs">{new Date(crime.date).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{crime.district}</h3>
                <p className="text-slate-600 text-xs mb-2">{crime.description}</p>
                <div className="flex items-center text-xs font-medium text-slate-500">
                  <AlertTriangle size={12} className="mr-1" />
                  {t.col_severity}: <span className={`ml-1 ${crime.severity === 'Critical' ? 'text-red-600' : 'text-slate-600'}`}>{crime.severity}</span>
                </div>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span className="font-bold text-xs">{crime.type}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Zoom Indicator for Debug/UX */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1 rounded-lg z-[1000] text-xs text-slate-400 font-mono">
        {t.map_zoom}: {currentZoom}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg z-[1000] text-xs">
        <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-2"><MapPin size={14} /> {t.map_legend}</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(CRIME_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-slate-400">{type}</span>
            </div>
          ))}
          <div className="col-span-2 mt-2 pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-1 bg-slate-500"></div> <span className="text-slate-500">{t.legend_country}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-1 bg-blue-500 border-dashed border-t border-blue-500"></div> <span className="text-blue-500">{t.legend_region}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-1 bg-emerald-500"></div> <span className="text-emerald-500">{t.legend_district}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-amber-500 border-dashed border-t border-amber-500"></div> <span className="text-amber-500">{t.legend_mahalla}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrimeMap;
