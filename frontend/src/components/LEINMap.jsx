import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import gsap from 'gsap';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createMarkerIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const hospitalIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:green;color:white;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:2px;font-weight:bold;font-size:14px;border:1px solid white;">+</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const responderIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:blue;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const getTypeColor = (type) => {
  switch (type) {
    case 'Medical': return 'var(--accent-blue)';
    case 'Fire': return 'var(--alert-red)';
    case 'Security': return '#F39C12';
    case 'Accident': return '#F1C40F';
    default: return 'gray';
  }
};

function MapAnimator() {
  const map = useMap();
  useEffect(() => {
    gsap.from(map.getContainer(), { opacity: 0, duration: 0.8 });
  }, [map]);
  return null;
}

export default function LEINMap({ incidents, hospitals, responders, selectedIncident, setSelectedIncident }) {
  const defaultCenter = [6.5244, 3.3792]; // Lagos

  return (
    <div className="map-wrapper">
      <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapAnimator />

        {incidents.map(incident => (
          <Marker 
            key={`inc-${incident.id}`} 
            position={[incident.lat, incident.lng]}
            icon={createMarkerIcon(getTypeColor(incident.type))}
            eventHandlers={{ click: () => setSelectedIncident(incident) }}
          >
            <Popup>
              <strong>{incident.type}</strong><br/>
              {incident.description}
            </Popup>
          </Marker>
        ))}

        {hospitals.map(hospital => (
          <Marker 
            key={`hosp-${hospital.id}`} 
            position={[hospital.lat, hospital.lng]}
            icon={hospitalIcon}
          >
            <Popup>
              <strong>{hospital.name}</strong><br/>
              Capacity: {hospital.capacity}%
            </Popup>
          </Marker>
        ))}

        {responders.map(responder => (
          <Marker 
            key={`resp-${responder.id}`} 
            position={[responder.lat, responder.lng]}
            icon={responderIcon}
          >
            <Popup>
              <strong>{responder.name}</strong><br/>
              Status: {responder.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
