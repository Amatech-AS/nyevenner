'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Loader2 } from 'lucide-react';

export default function Weather({ adresse, datoTekst }: { adresse: string, datoTekst: string }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const parseNorwegianDate = (str: string) => {
    try {
      if (!str) return null;
      const currentYear = new Date().getFullYear();
      const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
      
      // Forventer format "Lørdag 20. desember kl 12:00" eller lignende
      const parts = str.split(' ');
      if (parts.length < 4) return null;

      // Finn dagen (fjerner punktum hvis det er der)
      const dayStr = parts.find(p => /^\d+\.?$/.test(p));
      if (!dayStr) return null;
      const day = parseInt(dayStr.replace('.', ''));

      // Finn måneden
      const monthStr = parts.find(p => months.includes(p.toLowerCase()));
      if (!monthStr) return null;
      const monthIndex = months.indexOf(monthStr.toLowerCase());

      // Finn tiden
      const timeStr = parts.find(p => p.includes(':'));
      const hour = timeStr ? parseInt(timeStr.split(':')[0]) : 12;

      const date = new Date(currentYear, monthIndex, day, hour);
      
      // Hvis datoen har passert i år (f.eks vi er i desember og aktiviteten er i januar), legg til et år
      if (date < new Date() && monthIndex < new Date().getMonth()) {
        date.setFullYear(currentYear + 1);
      }
      return date;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      const date = parseNorwegianDate(datoTekst);
      
      if (!date) {
        setLoading(false);
        return;
      }

      // Sjekk om det er mer enn 10 dager til (Met.no har begrensninger)
      const diffTime = date.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 9 || diffDays < 0) {
        setLoading(false);
        return; // Vis ingenting hvis det er for lenge til
      }

      try {
        // 1. Finn Lat/Lon
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
        const geoData = await geoRes.json();
        
        if (!geoData || geoData.length === 0) {
            setLoading(false);
            return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        // 2. Hent Vær fra Met.no
        const weatherRes = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`);
        const weatherData = await weatherRes.json();

        // 3. Finn værmeldingen nærmest tidspunktet
        const timeseries = weatherData.properties.timeseries;
        const targetTime = date.toISOString().slice(0, 13); // Matcher på time
        
        const forecast = timeseries.find((t: any) => t.time.startsWith(targetTime)) || timeseries[0];

        setWeather({
            temp: forecast.data.instant.details.air_temperature,
            symbol: forecast.data.next_1_hours?.summary?.symbol_code || forecast.data.next_6_hours?.summary?.symbol_code
        });

      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    if (adresse && datoTekst) fetchWeather();
    else setLoading(false);
  }, [adresse, datoTekst]);

  if (loading) return <div className="flex gap-2 items-center text-xs text-slate-400 h-10"><Loader2 className="animate-spin" size={14}/> Henter vær...</div>;
  if (!weather) return null;

  const getIcon = (code: string) => {
      if (code?.includes('rain')) return <CloudRain size={20} className="text-blue-500"/>;
      if (code?.includes('snow')) return <CloudSnow size={20} className="text-blue-300"/>;
      if (code?.includes('cloud')) return <Cloud size={20} className="text-slate-400"/>;
      return <Sun size={20} className="text-amber-500"/>;
  };

  return (
    <div className="inline-flex items-center gap-3 bg-blue-50/80 border border-blue-100 px-4 py-2 rounded-xl mt-4 shadow-sm">
        {getIcon(weather.symbol)}
        <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-slate-400 uppercase">Været</span>
            <span className="text-lg font-black text-slate-900">{weather.temp}°</span>
        </div>
    </div>
  );
}
