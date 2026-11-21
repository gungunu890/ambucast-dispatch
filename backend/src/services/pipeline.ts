import zones from "../data/zones.json" with { type: "json" };
import { getAirData, getWeatherData } from "./dataService.js";
import { getTimeData } from "./timeService.js";
import { getPredictions } from "./mlService.js";
import { getIO } from "../sockets/socket.js";

const normalizeRiskClass = (risk: string | undefined) => {
  const normalized = String(risk || 'unknown').trim().toLowerCase();
  return ['critical', 'high', 'moderate', 'medium', 'low'].includes(normalized)
    ? normalized
    : 'low';
};

// Cache air/weather results so we don't hammer OpenWeather on every run.
// If a fresh call fails (e.g. HTTP 429), we fall back to the last good value.
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map<string, { data: any; ts: number }>();

async function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;

  try {
    const data = await fetcher();
    cache.set(key, { data, ts: Date.now() });
    return data;
  } catch (err) {
    if (hit) return hit.data; // stale data beats no data
    throw err;
  }
}

export const buildZonePayloads = async () => {
  const time = getTimeData();
  const entries = Object.entries(zones);

  // Step 1: Build zone data with air & weather
  const results = await Promise.all(
    entries.map(async ([zone_id, zone]: any) => {
      const [airResult, weatherResult] = await Promise.allSettled([
        cached(`air:${zone_id}`, () => getAirData(zone.lat, zone.lng)),
        cached(`weather:${zone_id}`, () => getWeatherData(zone.lat, zone.lng))
      ]);

      const airAvailable = airResult.status === "fulfilled";
      const weatherAvailable = weatherResult.status === "fulfilled";

      const air: any = airAvailable ? airResult.value : {};
      const weather: any = weatherAvailable ? weatherResult.value : {};

      if (airResult.status === "rejected") {
        console.warn(
          `Air quality unavailable for ${zone.name}:`,
          airResult.reason?.message ?? airResult.reason
        );
      }

      if (weatherResult.status === "rejected") {
        console.warn(
          `Weather unavailable for ${zone.name}:`,
          weatherResult.reason?.message ?? weatherResult.reason
        );
      }

      return {
        zone_id,
        area: zone.name,
        zone_name: zone.name,
        ...air,
        ...weather,
        aqi: air.aqi ?? null,
        pm25: air.pm25 ?? null,
        pm10: air.pm10 ?? null,
        temperature: weather.temperature ?? null,
        humidity: weather.humidity ?? null,
        aqi_available: airAvailable,
        weather_available: weatherAvailable,
        ...time,
        population_density: zone.population_density,
        elderly_pct: zone.elderly_pct
      };
    })
  );

  console.log("Zone payloads built:", results.length, "zones");

  // Step 2: Get ML predictions
  const eligibleZones = results.filter(
    zone => zone.aqi_available && zone.weather_available
  );

  let predictions: any[] = [];

  try {
    if (eligibleZones.length > 0) {
      console.log(`Calling ML API for ${eligibleZones.length} zones...`);
      predictions = await getPredictions(eligibleZones);
      console.log("ML predictions received");
    }
  } catch (error) {
    console.error("ML prediction failed:", error);
  }

  // Step 3: Merge predictions with zone data
  const enrichedResults = results.map(zone => {
    const prediction = predictions.find(
      p => p.zone_id === zone.zone_id
    );

    if (!prediction) {
      return {
        ...zone,
        predicted_calls: null,
        risk_score: null,
        risk_class: "unknown",
        reasons: ["Prediction unavailable"],
        prediction_available: false
      };
    }

    return {
      ...zone,
      ...prediction,
      risk_class: normalizeRiskClass(prediction.risk_class),
      prediction_available: true
    };
  });

  // Step 4: Emit updated data
  try {
    getIO().emit("pipeline:updated", enrichedResults);
  } catch (error: any) {
    console.warn("Socket.IO update failed:", error?.message || error);
  }

  console.log("Pipeline complete:", enrichedResults.length, "zones");
  return enrichedResults;
};