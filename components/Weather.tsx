'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Loader2, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';

// Enkel oversettelse av Met.no sine koder
const translations: Record<string, string> = {
  'clearsky': 'Klarvær',
  'cloudy': 'Skyet',
  'fair': 'Lettskyet',
  'fog': 'Tåke',
  'heavyrain': 'Kraftig regn',
  'heavyrainshowers': 'Kraftige regnbyger',
  'heavysnow': 'Kraftig snø',
  'heavysnowshowers': 'Kraftige snøbyger',
  'lightrain': 'Lett regn',
  'lightrainshowers': 'Lette regnbyger',
  'lightsnow': 'Lett snø',
  'lightsnowshowers': 'Lette snøbyger',
  'partlycloudy': 'Delvis skyet',
  'rain': 'Regn',
  'rainshowers': 'Regnbyger',
  'sleet': 'Sludd',
  'sleetshowers': 'Sluddbyger',
  'snow': 'Snø',
  'snowshowers': 'Snøbyger',
  'thunder': 'Torden',
};

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
      
      if (!date) { setLoading(false); return; }

      const diffTime = date.getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays > 9 || diffDays < 0) { setLoading(false); return; }

      try {
        // Bruker bare første del av adressen for søk hvis den er lang
        const searchAddr = adresse.split(',')[0] || adresse; 
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddr)}`);
        const geoData = await geoRes.json();
        
        if (!geoData || geoData.length === 0) { setLoading(false); return; }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        const weatherRes = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`);
        const weatherData = await weatherRes.json();

        const timeseries = weatherData.properties.timeseries;
        const targetTime = date.toISOString().slice(0, 13); 
        
        const forecast = timeseries.find((t: any) => t.time.startsWith(targetTime)) || timeseries[0];
        const symbolCode = forecast.data.next_1_hours?.summary?.symbol_code || forecast.data.next_6_hours?.summary?.symbol_code;
        
        // Fjern _day eller _night suffiks for oversettelse
        const cleanSymbol = symbolCode.split('_')[0];

        setWeather({
            temp: forecast.data.instant.details.air_temperature,
            symbol: symbolCode,
            desc: translations[cleanSymbol] || cleanSymbol // Bruk norsk oversettelse
        });

      } catch (err) { console.error(err); }
      setLoading(false);
    };

    if (adresse && datoTekst) fetchWeather();
    else setLoading(false);
  }, [adresse, datoTekst]);

  if (loading) return <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 flex gap-2 items-center"><Loader2 className="animate-spin" size={14}/> Sjekker været...</div>;
  if (!weather) return null;

  const getIcon = (code: string) => {
      if (code?.includes('rain') || code?.includes('drizzle')) return <CloudRain size={32} className="text-blue-500"/>;
      if (code?.includes('snow') || code?.includes('sleet')) return <CloudSnow size={32} className="text-blue-300"/>;
      if (code?.includes('cloud')) return <Cloud size={32} className="text-slate-400"/>;
      if (code?.includes('fog')) return <CloudFog size={32} className="text-slate-400"/>;
      if (code?.includes('thunder')) return <CloudLightning size={32} className="text-amber-600"/>;
      return <Sun size={32} className="text-amber-500"/>;
  };

  // Formater overskriften: "Værmelding for Sted, Dato:"
  const renDato = datoTekst.split('kl')[0].trim().toLowerCase(); // "lørdag 29. november"
  const headerTekst = `Værmelding for ${adresse}, ${renDato}:`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-xs font-bold text-slate-500 uppercase mb-3 leading-relaxed">
            {headerTekst}
        </p>
        <div className="flex items-center gap-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 w-fit">
            {getIcon(weather.symbol)}
            <div>
                <span className="text-3xl font-black text-slate-900">{Math.round(weather.temp)}°</span>
                <span className="text-sm font-bold text-slate-600 ml-2 capitalize">
                    {weather.desc}
                </span>
            </div>
        </div>
    </div>
  );
}
