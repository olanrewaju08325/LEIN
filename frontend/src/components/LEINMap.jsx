import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import gsap from 'gsap';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Raw SVG strings for map icons to avoid ReactDOMServer overhead in Leaflet
const createIcon = (svg, color) => new L.DivIcon({
  className: 'map-marker-pin',
  html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;border:2px solid #fff;box-shadow:0 0 16px ${color}88;">${svg}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const SVGS = {
  Medical: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  Fire: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  Security: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  Accident: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>`,
  Hospital: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>`,
  Responder: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`
};

const TYPE_COLORS = { Medical: '#3B82F6', Fire: '#E5484D', Security: '#D4AF37', Accident: '#F59E0B' };

const getIncidentIcon = (t) => createIcon(SVGS[t] || SVGS.Medical, TYPE_COLORS[t] || '#3B82F6');
const hospIcon = createIcon(SVGS.Hospital, '#10B981');
const respIcon = createIcon(SVGS.Responder, '#2E6BE6');

function MapAnimator() {
  const map = useMap();
  useEffect(() => {
    gsap.from(map.getContainer(), { opacity: 0, duration: 1.5, ease: 'power2.out' });
  }, [map]);
  return null;
}

export default function LEINMap({ incidents, hospitals, responders, setSelectedIncident }) {
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: 'rgba(2,8,23,0.8)', padding: '8px 16px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe-green)', boxShadow: '0 0 8px var(--safe-green)' }} />
        LAGOS TACTICAL OVERVIEW
      </div>
      <MapContainer center={[6.5244, 3.3792]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' />
        <MapAnimator />

        {incidents.map(inc => (
          <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={getIncidentIcon(inc.type)} eventHandlers={{ click: () => setSelectedIncident(inc) }}>
            <Popup><div style={{ background: '#000', padding: 8, color: '#fff', fontSize: 12 }}><strong>{inc.type}</strong><br/>{inc.lga} LGA</div></Popup>
          </Marker>
        ))}

        {hospitals.map(h => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={hospIcon}>
            <Popup><div style={{ background: '#000', padding: 8, color: '#fff', fontSize: 12 }}><strong>{h.name}</strong><br/>CAPACITY: {h.capacity}%</div></Popup>
          </Marker>
        ))}

        {responders.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={respIcon}>
            <Popup><div style={{ background: '#000', padding: 8, color: '#fff', fontSize: 12 }}><strong>{r.name}</strong><br/>STATUS: {r.status}</div></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
