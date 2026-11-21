import { Hotspot } from '@/lib/types';

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60 * 1000).toISOString();

// Sample data shown ONLY when live predictions are unavailable.
// Edit the numbers freely. Keep risk_class one of: critical, high, medium, low.
// risk_score is on a 0-1 scale here; change it if your model uses 0-100.
export const DEMO_HOTSPOTS = [
  { id: 'demo-1',  zone_id: 'demo_connaught_place', area: 'Connaught Place', zone_name: 'Connaught Place', risk_class: 'critical', risk_score: 0.91, predicted_calls: 9, timestamp: minsAgo(2) },
  { id: 'demo-2',  zone_id: 'demo_chandni_chowk',   area: 'Chandni Chowk',   zone_name: 'Chandni Chowk',   risk_class: 'critical', risk_score: 0.88, predicted_calls: 8, timestamp: minsAgo(3) },
  { id: 'demo-3',  zone_id: 'demo_karol_bagh',      area: 'Karol Bagh',      zone_name: 'Karol Bagh',      risk_class: 'high',     risk_score: 0.79, predicted_calls: 7, timestamp: minsAgo(4) },
  { id: 'demo-4',  zone_id: 'demo_lajpat_nagar',    area: 'Lajpat Nagar',    zone_name: 'Lajpat Nagar',    risk_class: 'high',     risk_score: 0.74, predicted_calls: 6, timestamp: minsAgo(5) },
  { id: 'demo-5',  zone_id: 'demo_nehru_place',     area: 'Nehru Place',     zone_name: 'Nehru Place',     risk_class: 'high',     risk_score: 0.70, predicted_calls: 6, timestamp: minsAgo(6) },
  { id: 'demo-6',  zone_id: 'demo_saket',           area: 'Saket',           zone_name: 'Saket',           risk_class: 'medium',   risk_score: 0.55, predicted_calls: 4, timestamp: minsAgo(7) },
  { id: 'demo-7',  zone_id: 'demo_mayur_vihar',     area: 'Mayur Vihar',     zone_name: 'Mayur Vihar',     risk_class: 'medium',   risk_score: 0.52, predicted_calls: 4, timestamp: minsAgo(8) },
  { id: 'demo-8',  zone_id: 'demo_rohini',          area: 'Rohini',          zone_name: 'Rohini',          risk_class: 'medium',   risk_score: 0.47, predicted_calls: 3, timestamp: minsAgo(9) },
  { id: 'demo-9',  zone_id: 'demo_pitampura',       area: 'Pitampura',       zone_name: 'Pitampura',       risk_class: 'medium',   risk_score: 0.44, predicted_calls: 3, timestamp: minsAgo(10) },
  { id: 'demo-10', zone_id: 'demo_janakpuri',       area: 'Janakpuri',       zone_name: 'Janakpuri',       risk_class: 'low',      risk_score: 0.28, predicted_calls: 2, timestamp: minsAgo(11) },
  { id: 'demo-11', zone_id: 'demo_dwarka',          area: 'Dwarka',          zone_name: 'Dwarka',          risk_class: 'low',      risk_score: 0.22, predicted_calls: 1, timestamp: minsAgo(12) },
  { id: 'demo-12', zone_id: 'demo_vasant_kunj',     area: 'Vasant Kunj',     zone_name: 'Vasant Kunj',     risk_class: 'low',      risk_score: 0.18, predicted_calls: 1, timestamp: minsAgo(13) }
] as unknown as Hotspot[];