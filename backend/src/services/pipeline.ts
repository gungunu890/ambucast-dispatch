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

export const buildZonePayloads = async () => {
    const time = getTimeData();
    const entries = Object.entries(zones);

    // Step 1: Build zone data with air & weather
    
// Step 1: Build zone data with air & weather
const results = await Promise.all(
    entries.map(async ([zone_id, zone]: any) => {
        const [airResult, weatherResult] = await Promise.allSettled([
            getAirData(zone.lat, zone.lng),
            getWeatherData(zone.lat, zone.lng)
        ]);

        const airAvailable = airResult.status === "fulfilled";
        const weatherAvailable = weatherResult.status === "fulfilled";

        const air: any = airAvailable ? airResult.value : {};
        const weather: any = weatherAvailable ? weatherResult.value : {};

        if (!airAvailable) {
            console.warn(`Air quality unavailable for ${zone.name}`);
        }

        if (!weatherAvailable) {
            console.warn(`Weather unavailable for ${zone.name}`);
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

    // Step 2: Get ML predictions ← ADD THIS BLOCK
    
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
