'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Loader2 } from 'lucide-react';

export default function Weather({ adresse, datoTekst }: { adresse: string, datoTekst: string }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const parseNorwegianDate = (str: string) => {
    try {
      if (!str) return null;
      const currentYear = new Date().getFullYear();
      const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
      const parts = str.split(' ');
      if (parts.length < 4) return null;
      const dayStr = parts.find(p => /^\d+\.?$/.test(p));
      if (!dayStr) return null;
      const day = parseInt(dayStr.replace('.', ''));
      const monthStr = parts.find(p => months.includes(p.toLowerCase()));
      if (!monthStr) return null;
      const monthIndex = months.indexOf(monthStr.toLowerCase());
      const timeStr = parts.find(p => p.includes(':'));
      const hour = timeStr ? parseInt(timeStr.split(':')[0]) : 12;
      const date = new Date(currentYear, monthIndex, day, hour);
      if (date < new Date() && monthIndex < new Date().getMonth()) date.setFullYear(currentYear + 1);
      return date;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      const date = parseNorwegianDate(datoTekst);
      if (!date) { setLoading(false); return; }
      const diffTime = date.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays > 9 || diffDays < 0) { setLoading(false); return; }

      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) { setLoading(false); return; }
        const weatherRes = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${geoData[0].lat}&lon=${geoData[0].lon}`);
        const weatherData = await weatherRes.json();
        const targetTime = date.toISOString().slice(0, 13);
        const forecast = weatherData.properties.timeseries.find((t: any) => t.time.startsWith(targetTime)) || weatherData.properties.timeseries[0];
        setWeather({
            temp: forecast.data.instant.details.air_temperature,
            symbol: forecast.data.next_1_hours?.summary?.symbol_code || forecast.data.next_6_hours?.summary?.symbol_code
        });
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    if (adresse && datoTekst) fetchWeather(); else setLoading(false);
  }, [adresse, datoTekst]);

  if (loading) return null;
  if (!weather) return null;

  const getIcon = (code: string) => {
      if (code?.includes('rain')) return <CloudRain size={32} className="text-blue-500"/>;
      if (code?.includes('snow')) return <CloudSnow size={32} className="text-blue-300"/>;
      if (code?.includes('cloud')) return <Cloud size={32} className="text-slate-400"/>;
      return <Sun size={32} className="text-amber-500"/>;
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>Værmelding</p>
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
            Melding for {adresse.split(',')[0]} den {datoTekst.split('kl')[0]}:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {getIcon(weather.symbol)}
            <div>
                <span style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>{weather.temp}°</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b', marginLeft: '4px', textTransform: 'capitalize' }}>
                    {weather.symbol?.replace(/_/g, ' ')}
                </span>
            </div>
        </div>
    </div>
  );
}
