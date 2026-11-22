import { Hotspot, Ambulance } from '@/lib/types';

// Sample data shared by every page (via the useHotspots / useAmbulances hooks).
// Edit the numbers freely.

// The 12 zones, defined once and reused for both hotspots and ambulances.
const ZONES = [
  { area: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { area: 'Chandni Chowk',   lat: 28.6506, lng: 77.2303 },
  { area: 'Karol Bagh',      lat: 28.6519, lng: 77.1909 },
  { area: 'Lajpat Nagar',    lat: 28.5677, lng: 77.2433 },
  { area: 'Nehru Place',     lat: 28.5491, lng: 77.2533 },
  { area: 'Saket',           lat: 28.5245, lng: 77.2066 },
  { area: 'Mayur Vihar',     lat: 28.6081, lng: 77.2943 },
  { area: 'Rohini',          lat: 28.7495, lng: 77.0565 },
  { area: 'Pitampura',       lat: 28.6980, lng: 77.1315 },
  { area: 'Janakpuri',       lat: 28.6219, lng: 77.0878 },
  { area: 'Dwarka',          lat: 28.5921, lng: 77.0460 },
  { area: 'Vasant Kunj',     lat: 28.5200, lng: 77.1590 },
];

const zoneIdOf = (area: string) => `demo_${area.toLowerCase().replace(/\s+/g, '_')}`;

// ─── Hotspots (zone predictions) ───
// risk_class must be: critical, high, medium or low.
// risk_score is on a 0-1 scale here; change it if your model uses 0-100.
const makeHotspot = (
  n: number,
  zoneIndex: number,
  risk_class: string,
  risk_score: number,
  predicted_calls: number,
  aqi: number,
  reasons: string[]
) => {
  const zone = ZONES[zoneIndex];
  return {
    id: `demo-${n}`,
    zone_id: zoneIdOf(zone.area),
    area: zone.area,
    zone_name: zone.area,
    risk_class,
    risk_score,
    predicted_calls,
    reasons,
    lat: zone.lat,
    lng: zone.lng,
    location: { lat: zone.lat, lng: zone.lng },
    aqi,
    pm25: Math.round(aqi * 0.45),
    pm10: Math.round(aqi * 0.8),
    temperature: 19,
    humidity: 58,
    prediction_available: true,
    is_fallback: false,
    timestamp: new Date(Date.now() - n * 60 * 1000).toISOString(),
  };
};

export const DEMO_HOTSPOTS = [
  makeHotspot(1,  0,  'critical', 0.91, 9, 395, ['Very high AQI', 'Evening peak hours', 'High population density']),
  makeHotspot(2,  1,  'critical', 0.88, 8, 410, ['Very high AQI', 'Dense market area', 'Large elderly population']),
  makeHotspot(3,  2,  'high',     0.79, 7, 360, ['High AQI', 'Evening peak hours']),
  makeHotspot(4,  3,  'high',     0.74, 6, 340, ['High AQI', 'High population density']),
  makeHotspot(5,  4,  'high',     0.70, 6, 335, ['High AQI', 'Commercial hub traffic']),
  makeHotspot(6,  5,  'medium',   0.55, 4, 290, ['Elevated AQI']),
  makeHotspot(7,  6,  'medium',   0.52, 4, 285, ['Elevated AQI', 'Residential density']),
  makeHotspot(8,  7,  'medium',   0.47, 3, 270, ['Moderate AQI']),
  makeHotspot(9,  8,  'medium',   0.44, 3, 265, ['Moderate AQI']),
  makeHotspot(10, 9,  'low',      0.28, 2, 210, ['Lower demand expected']),
  makeHotspot(11, 10, 'low',      0.22, 1, 195, ['Lower demand expected']),
  makeHotspot(12, 11, 'low',      0.18, 1, 180, ['Lower demand expected']),
] as unknown as Hotspot[];

// ─── Ambulances ───
// 27 ambulances: 9 AVAILABLE and 18 MOVING, spread around the 12 zones.
// Positions are fixed (no randomness) so the map doesn't jump around between renders.
const nowIso = new Date().toISOString();

export const DEMO_AMBULANCES = Array.from({ length: 27 }, (_, i) => {
  const zone = ZONES[i % ZONES.length];
  const latOffset = (((i * 7) % 5) - 2) * 0.003;
  const lngOffset = (((i * 11) % 5) - 2) * 0.003;
  return {
    id: `AMB-${String(i + 1).padStart(2, '0')}`,
    name: `Ambulance ${i + 1}`,
    lat: zone.lat + latOffset,
    lng: zone.lng + lngOffset,
    status: i % 3 === 0 ? 'AVAILABLE' : 'MOVING',
    zoneId: zoneIdOf(zone.area),
    zone: zone.area,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}) as unknown as Ambulance[];