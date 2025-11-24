'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fiks for manglende markør-ikon i Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// En liten hjelper for å flytte kartet når vi finner adressen
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export default function Map({ adresse }: { adresse: string }) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const finnKoordinater = async () => {
      try {
        // Vi søker opp adressen via OpenStreetMap (Nominatim)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          // Fallback til Trondheim sentrum hvis vi ikke finner adressen
          setCoords([63.4305, 10.3951]); 
        }
      } catch (error) {
        console.error("Klarte ikke finne kart:", error);
        setCoords([63.4305, 10.3951]);
      }
      setLoading(false);
    };

    if (adresse) finnKoordinater();
  }, [adresse]);

  if (loading) return <div style={{height:'100%', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', color:'#94a3b8', fontSize:'12px'}}>Laster kart...</div>;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {coords && (
        <MapContainer center={coords} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={coords}>
            <Popup>{adresse}</Popup>
          </Marker>
          <ChangeView center={coords} />
        </MapContainer>
      )}
    </div>
  )
}