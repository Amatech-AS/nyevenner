'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Thermometer, Loader2 } from 'lucide-react';

export default function Weather({ adresse, datoTekst }: { adresse: string, datoTekst: string }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hjelpefunksjon for å tolke norsk datostreng til JS Date objekt
  // Eks: "Lørdag 20. desember kl 12:00"
  const parseNorwegianDate = (str: string) => {
    try {
      const currentYear = new Date().getFullYear();
      const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
      
      const parts = str.split(' ');
      // parts[1] = "20." (dag), parts[2] = "desember" (måned), parts[4] = "12:00" (tid)
      if (parts.length < 5) return null;

      const day = parseInt(parts[1].replace('.', ''));
      const monthIndex = months.indexOf(parts[2].toLowerCase());
      const timeParts = parts[4].split(':');
      
      const date = new Date(currentYear, monthIndex, day, parseInt(timeParts[0]), parseInt(timeParts[1]));
      
      // Hvis datoen har passert i år, antar vi neste år (f.eks januar aktiviteter sett i desember)
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

      // Sjekk om det er mer enn 4 dager til (Met.no gir best data for de neste dagene)
      const diffTime = date.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 4 || diffDays < 0) {
        setError('Værmelding er kun tilgjengelig 4 dager i forveien.');
        setLoading(false);
        return;
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
        // Vi leter etter et tidspunkt som matcher aktiviteten
        const targetTime = date.toISOString().slice(0, 13); // "2023-12-20T12"
        
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

    fetchWeather();
  }, [adresse, datoTekst]);

  if (error) return null; // Vis ingenting hvis det er for lenge til
  if (loading) return <div className="flex gap-2 text-xs text-slate-400"><Loader2 className="animate-spin" size={16}/> Henter vær...</div>;
  if (!weather) return null;

  // Velg ikon basert på symbolkode
  const getIcon = (code: string) => {
      if (code?.includes('rain')) return <CloudRain size={24} className="text-blue-500"/>;
      if (code?.includes('snow')) return <CloudSnow size={24} className="text-blue-300"/>;
      if (code?.includes('cloud')) return <Cloud size={24} className="text-slate-400"/>;
      return <Sun size={24} className="text-amber-500"/>;
  };

  return (
    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
        <div className="bg-white p-2 rounded-full shadow-sm">
            {getIcon(weather.symbol)}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Værvarsel</p>
            <p className="text-lg font-black text-slate-900 flex items-center gap-1">
                {weather.temp}°C 
                <span className="text-sm font-medium text-slate-600 capitalize">
                    {weather.symbol?.replace(/_/g, ' ')}
                </span>
            </p>
        </div>
    </div>
  );
}
