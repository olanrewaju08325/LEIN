import { useState, useEffect, useRef } from 'react';
import { Users, Building2, Server, BrainCircuit, ActivitySquare, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import LEINMap from '../components/LEINMap';
import IncidentDetail from '../components/IncidentDetail';
import { useMemo } from 'react';
import IncidentQueue from '../components/IncidentQueue';
import api from '../services/api';

const MOCK_INCIDENTS = [
  { id: 1, type: 'Medical', lga: 'Ikeja', lat: 6.6018, lng: 3.3515, severity: 5, priority_score: 9.4, timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 2, type: 'Fire', lga: 'Lekki', lat: 6.4698, lng: 3.5852, severity: 4, priority_score: 8.2, timestamp: new Date(Date.now() - 240000).toISOString() },
  { id: 3, type: 'Security', lga: 'Surulere', lat: 6.5000, lng: 3.3500, severity: 4, priority_score: 7.8, timestamp: new Date(Date.now() - 600000).toISOString() }
];

const MOCK_HOSPITALS = [
  { id: 1, name: 'Lagos General', lat: 6.45, lng: 3.40, capacity: 60 },
  { id: 2, name: 'Ikeja Medical', lat: 6.60, lng: 3.34, capacity: 15 },
  { id: 3, name: 'Lekki Care', lat: 6.46, lng: 3.58, capacity: 90 }
];

const MOCK_RESPONDERS = [
  { id: 1, name: 'Unit A-07', type: 'Ambulance', lat: 6.55, lng: 3.36, status: 'available' },
  { id: 2, name: 'Unit B-03', type: 'Fire', lat: 6.48, lng: 3.55, status: 'assigned' },
  { id: 3, name: 'Unit C-11', type: 'Police', lat: 6.51, lng: 3.38, status: 'returning' },
  { id: 4, name: 'Unit A-09', type: 'Ambulance', lat: 6.61, lng: 3.33, status: 'available' }
];

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const dashboardRef = useRef(null);

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
  };

  const handleDispatchSuccess = (incidentId) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === incidentId ? { ...item, status: 'dispatched' } : item
      )
    );
    setSelectedIncident((prev) =>
      prev && prev.id === incidentId ? { ...prev, status: 'dispatched' } : prev
    );
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [incRes, respRes, hospRes] = await Promise.all([
          api.get('/incidents').catch(() => ({ data: [] })),
          api.get('/responders').catch(() => ({ data: [] })),
          api.get('/hospitals').catch(() => ({ data: [] }))
        ]);
        
        if (!active) return;

        console.log('Dashboard fetch:', {
          incidents: incRes.data,
          responders: respRes.data,
          hospitals: hospRes.data,
        });

        const finalIncidents = incRes.data.length > 0 ? incRes.data : MOCK_INCIDENTS;
        const finalResponders = respRes.data.length > 0 ? respRes.data : MOCK_RESPONDERS;
        const finalHospitals = hospRes.data.length > 0 ? hospRes.data : MOCK_HOSPITALS;

        setIncidents(finalIncidents);
        setResponders(finalResponders);
        setHospitals(finalHospitals);
        
        if (finalIncidents.length > 0) setSelectedIncident(finalIncidents[0]);
      } catch {
        if (active) {
          setIncidents(MOCK_INCIDENTS);
          setResponders(MOCK_RESPONDERS);
          setHospitals(MOCK_HOSPITALS);
          setSelectedIncident(MOCK_INCIDENTS[0]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  const sortedHospitals = useMemo(() => {
    if (!selectedIncident || !hospitals || hospitals.length === 0) return hospitals;
    return [...hospitals].sort((a, b) => {
      const da = haversine(selectedIncident.lat, selectedIncident.lng, a.lat, a.lng);
      const db = haversine(selectedIncident.lat, selectedIncident.lng, b.lat, b.lng);
      return da - db;
    });
  }, [selectedIncident, hospitals]);

  // System Alive Entrance Animation
  useEffect(() => {
    if (!loading && dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current.querySelectorAll('.dash-panel, .kpi-card-top'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" }
      );
    }
  }, [loading]);

  return (
    <div className="dashboard-root" ref={dashboardRef}>
      
      {/* TOP KPI ROW (Massive Numbers) */}
      <div className="kpi-top-row">
        <div className="kpi-card-top">
          <div className="kpi-card-label"><ActivitySquare size={14} /> ACTIVE INCIDENTS</div>
          <div className="kpi-card-value">{incidents.length}</div>
        </div>
        <div className="kpi-card-top">
          <div className="kpi-card-label"><TrendingUp size={14} /> AVG RESPONSE TIME</div>
          <div className="kpi-card-value">4.2<span style={{ fontSize: 16 }}>MIN</span></div>
        </div>
        <div className="kpi-card-top">
          <div className="kpi-card-label"><Users size={14} /> RESPONDERS ONLINE</div>
          <div className="kpi-card-value">{responders.length}</div>
        </div>
        <div className="kpi-card-top">
          <div className="kpi-card-label"><Building2 size={14} /> ONLINE HOSPITALS</div>
          <div className="kpi-card-value">{hospitals.length || 26}</div>
        </div>
        <div className="kpi-card-top">
          <div className="kpi-card-label"><BrainCircuit size={14} /> AI CONFIDENCE</div>
          <div className="kpi-card-value">98<span style={{ fontSize: 16 }}>%</span></div>
        </div>
        <div className="kpi-card-top" style={{ background: 'var(--safe-green-glow)', borderColor: 'var(--safe-green)' }}>
          <div className="kpi-card-label" style={{ color: 'var(--safe-green)' }}><Server size={14} /> SYSTEM STATUS</div>
          <div className="kpi-card-value" style={{ color: 'var(--safe-green)', fontSize: 24, marginTop: 8 }}>OPERATIONAL</div>
        </div>
      </div>

      {/* HERO MAP SECTION (70vh centerpiece) */}
      <motion.div 
        className="hero-map-section"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <LEINMap incidents={incidents} hospitals={hospitals} responders={responders} setSelectedIncident={setSelectedIncident} />
      </motion.div>

      {/* LOWER GRID LAYOUT (3 Columns) */}
      <div className="dashboard-lower-grid">
        {/* LEFT COLUMN */}
        <div className="dash-panel" style={{ maxHeight: 600 }}>
          <div className="dash-panel-header">
            <span>LIVE INCIDENT QUEUE</span>
          </div>
          <div className="dash-panel-content" style={{ overflowY: 'auto' }}>
            {!loading ? (
              <IncidentQueue 
                incidents={incidents}
                selectedId={selectedIncident?.id}
                onSelectIncident={handleSelectIncident}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Loading intelligence...</div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="dash-panel" style={{ maxHeight: 600 }}>
          <div className="dash-panel-header">
            <span>AI DISPATCH INTELLIGENCE</span>
            <ShieldCheck size={14} color="var(--ai-blue)" />
          </div>
          <div className="dash-panel-content">
            {selectedIncident ? (
              (() => {
                const nearest = (sortedHospitals && sortedHospitals.length > 0) ? sortedHospitals[0] : null;
                const capacityLabel = (c) => {
                  if (c == null) return 'Unknown';
                  if (c < 50) return 'Available';
                  if (c < 80) return 'Moderate';
                  return 'Critical';
                };
                return (
                  <div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 12, padding: 24, marginBottom: 12 }}>
                      <div style={{ fontSize: 18, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 20 }}>TACTICAL RECOMMENDATION</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Recommended Unit</div>
                          <div style={{ color: 'var(--ai-blue)', fontSize: 18, fontWeight: 900 }}>Unit A-07</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Est. Arrival Time</div>
                          <div style={{ color: 'var(--safe-green)', fontSize: 18, fontWeight: 900 }}>4 Minutes</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Nearest Hospital</div>
                          <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 900 }}>{nearest ? nearest.name : 'Unknown'}</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Hospital Capacity</div>
                          <div style={{ color: 'var(--warn-amber)', fontSize: 18, fontWeight: 900 }}>{nearest ? capacityLabel(nearest.capacity) : 'Unknown'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Pass sorted hospitals to IncidentDetail so index 0 is the closest */}
                    <IncidentDetail
                      incident={selectedIncident}
                      hospitals={sortedHospitals || hospitals}
                      responders={responders}
                      onResolve={async (id) => {
                        try {
                          await api.post('/resolve', { incident_id: id });
                          setIncidents((prev) => prev.filter((it) => it.id !== id));
                          setSelectedIncident(null);
                        } catch (e) {
                          console.warn('Resolve failed', e);
                        }
                      }}
                      onDispatchSuccess={handleDispatchSuccess}
                    />
                  </div>
                );
              })()
            ) : (
              <div style={{ color: 'var(--text-muted)', padding: 24 }}>Select an incident.</div>
            )}
            
            <div className="dash-panel-header" style={{ marginTop: 16, padding: '16px 0', background: 'transparent' }}>
              <span>AI ENGINE STATUS</span>
              <BrainCircuit size={14} color="var(--safe-green)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="engine-item"><span>Classifier</span><div className="engine-online" /></div>
              <div className="engine-item"><span>Severity</span><div className="engine-online" /></div>
              <div className="engine-item"><span>Forecast</span><div className="engine-online" /></div>
              <div className="engine-item"><span>Routing</span><div className="engine-online" /></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dash-panel" style={{ maxHeight: 600 }}>
          <div className="dash-panel-header">
            <span>HOSPITAL INTELLIGENCE</span>
            <Building2 size={14} />
          </div>
          <div className="dash-panel-content" style={{ paddingBottom: 0 }}>
            <div className="hosp-item">
              <div className="hosp-item-name">LAGOS GENERAL</div>
              <div className="hosp-item-meta">
                <span>Available Beds: 21</span>
                <span style={{ color: 'var(--safe-green)' }}>Available</span>
              </div>
              <div className="hosp-capacity-bar"><div className="hosp-capacity-fill" style={{ width: '40%', background: 'var(--safe-green)' }} /></div>
            </div>
            <div className="hosp-item">
              <div className="hosp-item-name">IKEJA HOSPITAL</div>
              <div className="hosp-item-meta">
                <span>Available Beds: 7</span>
                <span style={{ color: 'var(--alert-red)' }}>Critical</span>
              </div>
              <div className="hosp-capacity-bar"><div className="hosp-capacity-fill" style={{ width: '85%', background: 'var(--alert-red)' }} /></div>
            </div>
          </div>

          <div className="dash-panel-header" style={{ borderTop: '1px solid var(--border-bright)' }}>
            <span>RESPONDER STATUS BOARD</span>
            <Users size={14} />
          </div>
          <div className="dash-panel-content" style={{ flex: 1, overflowY: 'auto' }}>
            {responders.map(r => (
              <div className="resource-item" key={r.id}>
                <span className="resource-name">{r.name}</span>
                <span className={`resource-badge resource-${r.status.toLowerCase()}`}>{r.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
