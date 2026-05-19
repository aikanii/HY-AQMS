import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: '🌦️' },
  55: { label: 'Dense Drizzle', icon: '🌦️' },
  61: { label: 'Slight Rain', icon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  80: { label: 'Rain Showers', icon: '🌦️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Iligan City Coordinates: 8.2280, 124.2452
        const url = `https://api.open-meteo.com/v1/forecast?latitude=8.2280&longitude=124.2452&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto&forecast_days=3`;
        const res = await axios.get(url);
        setWeather(res.data);
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="weather-skeleton">Loading Forecast...</div>;
  if (!weather) return null;

  const current = weather.current;
  const daily = weather.daily;
  const currentInfo = WEATHER_CODES[current.weather_code] || { label: 'Unknown', icon: '🌡️' };

  return (
    <div className="weather-widget glass-panel">
      <div className="weather-main">
        <div className="weather-city-label">
          <span className="pulse-dot"></span> ILIGAN CITY WEATHER
        </div>
        
        <div className="weather-primary">
          <div className="weather-big-icon">{currentInfo.icon}</div>
          <div className="weather-temp-group">
            <div className="weather-current-temp">{Math.round(current.temperature_2m)}°C</div>
            <div className="weather-condition">{currentInfo.label}</div>
          </div>
        </div>

        <div className="weather-metrics">
          <div className="metric">
            <span className="metric-label">WIND</span>
            <span className="metric-value">{current.wind_speed_10m} <small>km/h</small></span>
          </div>
          <div className="metric">
            <span className="metric-label">HUMIDITY</span>
            <span className="metric-value">{current.relative_humidity_2m}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">FEELS LIKE</span>
            <span className="metric-value">{Math.round(current.apparent_temperature)}°C</span>
          </div>
        </div>
      </div>

      <div className="weather-forecast">
        {daily.time.slice(1).map((date, idx) => {
          const dayInfo = WEATHER_CODES[daily.weather_code[idx + 1]] || { label: '---', icon: '🌡️' };
          const dayName = new Date(date).toLocaleDateString([], { weekday: 'short' });
          return (
            <div key={date} className="forecast-day">
              <div className="forecast-name">{dayName.toUpperCase()}</div>
              <div className="forecast-icon">{dayInfo.icon}</div>
              <div className="forecast-temps">
                <span className="max">{Math.round(daily.temperature_2m_max[idx + 1])}°</span>
                <span className="min">{Math.round(daily.temperature_2m_min[idx + 1])}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherWidget;
