import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = "940ad591d34e1b4a0579f7b9c373c6b8";

const WeatherApp = () => {
  const [city, setCity] = useState(() => localStorage.getItem("city") || "");
  const [forecast, setForecast] = useState(() => {
    const saved = localStorage.getItem("forecast");
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS.load("particles-js", "/particles-config.json", () => {
        console.log("particles.js loaded");
      });
    }

    const flashInterval = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }, 8000 + Math.random() * 12000);

    return () => clearInterval(flashInterval);
  }, []);

  useEffect(() => {
    if (city) fetchForecast(city);
  }, []);

  const fetchForecast = async (searchCity = city) => {
    if (!searchCity.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${API_KEY}&units=metric&cnt=40`
      );
      if (!res.ok) throw new Error("Město nenalezeno");
      const data = await res.json();

      const todayStr = new Date().toISOString().split("T")[0];
      const todayData = data.list.find((entry) =>
        entry.dt_txt.startsWith(todayStr)
      );

      const dailyData = data.list.filter((r) =>
        r.dt_txt.includes("12:00:00")
      );

      const nextDaysData = dailyData
        .filter((d) => !d.dt_txt.startsWith(todayStr))
        .slice(0, 4);

      const slicedData = todayData ? [todayData, ...nextDaysData] : nextDaysData;

      setForecast(slicedData);
      localStorage.setItem("city", searchCity);
      localStorage.setItem("forecast", JSON.stringify(slicedData));
      setCity(searchCity);
    } catch (err) {
      setError(err.message);
      setForecast([]);
      localStorage.removeItem("forecast");
      localStorage.removeItem("city");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchForecast();
  };

  const today = forecast[0];
  const nextDays = forecast.slice(1);

  return (
    <>
      <div id="particles-js"></div>
      <div className={`flash ${flash ? "active" : ""}`}></div>
      <div className="fog"></div>

      <div className="app">
        <header>
          <h1 className="app-title">Weather App</h1>
        </header>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Zadej město..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Zadej město"
            spellCheck="false"
            autoComplete="off"
          />
          <button onClick={() => fetchForecast(city)} aria-label="Hledat počasí">
            🔍︎
          </button>
        </div>

        {loading && <p className="loading">Načítání...</p>}
        {error && <p className="error">{error}</p>}

        {today && (
          <section className="today-forecast" aria-labelledby="today-heading">
            <h2 id="today-heading">
              Dnes –{" "}
              {new Date(today.dt_txt).toLocaleDateString("cs-CZ", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            <img
              src={`https://openweathermap.org/img/wn/${today.weather[0].icon}@4x.png`}
              alt={today.weather[0].description}
              className="today-icon"
            />
            <p className="temp-big">{Math.round(today.main.temp)}°C</p>
            <p className="desc-big">{today.weather[0].description}</p>
          </section>
        )}

        <section className="forecast" aria-label="Předpověď dalších dní">
          {nextDays.map((day, idx) => (
            <article className="forecast-day" key={idx} role="listitem">
              <p className="date">
                {new Date(day.dt_txt).toLocaleDateString("cs-CZ", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt={day.weather[0].description}
                className="forecast-icon"
              />
              <p className="temp">{Math.round(day.main.temp)}°C</p>
              <p className="desc">{day.weather[0].description}</p>
            </article>
          ))}
        </section>
      </div>
    </>
  );
};

export default WeatherApp;
