
const API_KEY = process.env.OPENWEATHER_API_KEY;

const mapAQI = (aqi: number) => {
  const mapping = [50, 100, 150, 200, 300];
  return mapping[aqi - 1] ?? null;
};

const fetchWeatherAPI = async (url: string) => {
  if (!API_KEY) {
    throw new Error("OPENWEATHER_API_KEY is missing");
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000)
  });

  if (!res.ok) {
    throw new Error(`OpenWeather API failed: HTTP ${res.status}`);
  }

  return await res.json();
};

export const getAirData = async (lat: number, lng: number) => {
  const url =
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${API_KEY}`;

  const data: any = await fetchWeatherAPI(url);

  if (!data.list?.[0]?.main || !data.list?.[0]?.components) {
    throw new Error("Invalid air quality response");
  }

  return {
    aqi: mapAQI(data.list[0].main.aqi),
    pm25: data.list[0].components.pm2_5,
    pm10: data.list[0].components.pm10
  };
};

export const getWeatherData = async (lat: number, lng: number) => {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`;

  const data: any = await fetchWeatherAPI(url);

  if (data.main?.temp == null || data.main?.humidity == null) {
    throw new Error("Invalid weather response");
  }

  return {
    temperature: data.main.temp,
    humidity: data.main.humidity
  };
};
