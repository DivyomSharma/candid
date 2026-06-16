"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type WeatherData = {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
};

// WMO Weather interpretation codes
function getWeatherDetails(code: number, isDay: boolean) {
  const details = {
    0: { label: "Clear sky", icon: isDay ? Sun : Moon },
    1: { label: "Mainly clear", icon: isDay ? CloudSun : CloudMoon },
    2: { label: "Partly cloudy", icon: isDay ? CloudSun : CloudMoon },
    3: { label: "Overcast", icon: Cloud },
    45: { label: "Fog", icon: CloudFog },
    48: { label: "Depositing rime fog", icon: CloudFog },
    51: { label: "Light drizzle", icon: CloudDrizzle },
    53: { label: "Moderate drizzle", icon: CloudDrizzle },
    55: { label: "Dense drizzle", icon: CloudDrizzle },
    61: { label: "Slight rain", icon: CloudRain },
    63: { label: "Moderate rain", icon: CloudRain },
    65: { label: "Heavy rain", icon: CloudRain },
    71: { label: "Slight snow fall", icon: CloudSnow },
    73: { label: "Moderate snow fall", icon: CloudSnow },
    75: { label: "Heavy snow fall", icon: CloudSnow },
    77: { label: "Snow grains", icon: CloudSnow },
    80: { label: "Slight rain showers", icon: CloudRain },
    81: { label: "Moderate rain showers", icon: CloudRain },
    82: { label: "Violent rain showers", icon: CloudRain },
    85: { label: "Slight snow showers", icon: CloudSnow },
    86: { label: "Heavy snow showers", icon: CloudSnow },
    95: { label: "Thunderstorm", icon: CloudLightning },
    96: { label: "Thunderstorm with light hail", icon: CloudLightning },
    99: { label: "Thunderstorm with heavy hail", icon: CloudLightning },
  };

  return details[code as keyof typeof details] || { label: "Unknown", icon: Cloud };
}

export function WeatherWidget({ lat, lon, city }: { lat: number | null; lon: number | null; city: string | null }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&temperature_unit=celsius`);
        if (!res.ok) throw new Error("Failed to fetch weather");
        const json = await res.json();
        setData({
          temperature: json.current.temperature_2m,
          weatherCode: json.current.weather_code,
          isDay: json.current.is_day === 1,
        });
      } catch (err) {
        console.error("Error fetching weather:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  if (!lat || !lon || loading || !data) return null;

  const { label, icon: Icon } = getWeatherDetails(data.weatherCode, data.isDay);

  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-foreground-secondary/70 font-light block mb-1">
            Current Weather {city ? `in ${city}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-light text-foreground">{Math.round(data.temperature)}°C</span>
            <span className="text-sm font-light text-foreground-secondary">{label}</span>
          </div>
        </div>
        <div className="p-3 rounded-full bg-accent/10 border border-accent/20 text-accent">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
      </CardContent>
    </Card>
  );
}
