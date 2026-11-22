import { Hotspot } from '@/lib/types';

// Sample zone predictions shared by every page (via the useHotspots hook).
// Edit the numbers freely. risk_class must be: critical, high, medium or low.
// risk_score is on a 0-1 scale here; change it if your model uses 0-100.
const make = (
  n: number,
  area: string,
  risk_class: string,
  risk_score: number,
  predicted_calls: number,
  lat: number,
  lng: number,
  aqi: number,
  reasons: string[]
) => ({
  id: `demo-${n}`,
  zone_id: `demo_${area.toLowerCase().replace(/\s+/g, '_')}`,
  area,
  zone_name: area,
  risk_class,
  risk_score,
  predicted_calls,
  reasons,
  lat,
  lng,
  aqi,
  pm25: Math.round(aqi * 0.45),
  pm10: Math.round(aqi * 0.8),
  temperature: 19,
  humidity: 58,
  prediction_available: true,
  is_fallback: false,
  timestamp: new Date(Date.now() - n * 60 * 1000).toISOString(),
});

export const DEMO_HOTSPOTS = [
  make(1,  'Connaught Place', 'critical', 0.91, 9, 28.6315, 77.2167, 395, ['Very high AQI', 'Evening peak hours', 'High population density']),
  make(2,  'Chandni Chowk',   'critical', 0.88, 8, 28.6506, 77.2303, 410, ['Very high AQI', 'Dense market area', 'Large elderly population']),
  make(3,  'Karol Bagh',      'high',     0.79, 7, 28.6519, 77.1909, 360, ['High AQI', 'Evening peak hours']),
  make(4,  'Lajpat Nagar',    'high',     0.74, 6, 28.5677, 77.2433, 340, ['High AQI', 'High population density']),
  make(5,  'Nehru Place',     'high',     0.70, 6, 28.5491, 77.2533, 335, ['High AQI', 'Commercial hub traffic']),
  make(6,  'Saket',           'medium',   0.55, 4, 28.5245, 77.2066, 290, ['Elevated AQI']),
  make(7,  'Mayur Vihar',     'medium',   0.52, 4, 28.6081, 77.2943, 285, ['Elevated AQI', 'Residential density']),
  make(8,  'Rohini',          'medium',   0.47, 3, 28.7495, 77.0565, 270, ['Moderate AQI']),
  make(9,  'Pitampura',       'medium',   0.44, 3, 28.6980, 77.1315, 265, ['Moderate AQI']),
  make(10, 'Janakpuri',       'low',      0.28, 2, 28.6219, 77.0878, 210, ['Lower demand expected']),
  make(11, 'Dwarka',          'low',      0.22, 1, 28.5921, 77.0460, 195, ['Lower demand expected']),
  make(12, 'Vasant Kunj',     'low',      0.18, 1, 28.5200, 77.1590, 180, ['Lower demand expected']),
] as unknown as Hotspot[];