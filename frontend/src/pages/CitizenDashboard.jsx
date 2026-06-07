import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { getUser, getToken } from '../services/auth';

export default function CitizenDashboard() {
  const user = getUser();
  const [incidents, setIncidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('Medical');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [loadingStage, setLoadingStage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMyIncidents = async () => {
    try {
      const token = getToken();
      const res = await fetch('http://localhost:8000/incidents/my', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      } else {
        setIncidents([]);
      }
    } catch (e) {
      setIncidents([]);
    }
  };

  useEffect(() => { fetchMyIncidents(); }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocation(`My location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

  const submitIncident = async () => {
    setSubmitting(true);
    const token = getToken();
    try {
      setLoadingStage('🔍 Classifying emergency...');
      await new Promise((r) => setTimeout(r, 500));
      setLoadingStage('⚡ Scoring severity...');
      await new Promise((r) => setTimeout(r, 400));
      setLoadingStage('🚑 Finding nearest responder...');
      await new Promise((r) => setTimeout(r, 400));

      setLoadingStage('✅ Dispatching...');
      const res = await fetch('http://localhost:8000/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: selectedType,
          description,
          location,
          lat: coords.lat || 6.5244,
          lng: coords.lng || 3.3792,
          reporter_name: user?.full_name || 'anonymous',
          reporter_phone: user?.phone || ''
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data) {
        setShowModal(false);
        // toast
        alert('Emergency reported! Help is on the way.');
        fetchMyIncidents();
        // reset
        setSelectedType('Medical');
        setDescription('');
        setLocation('');
      } else {
        alert(data.error || 'Could not report incident');
      }
    } catch (e) {
      alert('Network error reporting incident');
    } finally {
      setSubmitting(false);
      setLoadingStage('');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>My Incidents</h2>
        <button onClick={() => setShowModal(true)} style={{ background: '#EF4444', color: '#fff', fontWeight: 800, padding: '10px 16px', borderRadius: 10 }}>
          🚨 Lodge Emergency
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {incidents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No incidents yet.</div>
        ) : (
          incidents.map((it) => (
            <div key={it.id} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-bright)' }}>
              <div style={{ fontWeight: 800 }}>{it.type} — {it.lga}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{it.description}</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>Status: {it.status}</div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div style={{ width: '94%', maxWidth: 600, background: 'var(--bg-panel)', border: '1px solid var(--border-bright)', borderRadius: 12, padding: 20, position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
            <h3 style={{ marginTop: 6 }}>Lodge Emergency</h3>
            <p style={{ color: 'var(--text-muted)' }}>Describe your emergency. Our AI will classify and dispatch help immediately.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              {['Medical','Fire','Security','Accident'].map((t) => (
                <button key={t} onClick={() => setSelectedType(t)} style={{ padding: 14, borderRadius: 8, background: selectedType === t ? 'var(--ai-blue)' : 'var(--bg-card)', color: selectedType === t ? '#fff' : 'var(--text-primary)', fontWeight: 800 }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8, color: 'var(--text-muted)' }}>Description</div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={"Describe in English or Pidgin... e.g. 'E don faint, e no dey breathe'"} style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid var(--border-bright)', background: 'transparent', color: 'var(--text-primary)' }} />
              <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>{description.length} chars</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8, color: 'var(--text-muted)' }}>Location</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Enter location or use my location" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--border-bright)', background: 'transparent', color: 'var(--text-primary)' }} />
                <button onClick={useMyLocation} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)' }}>📍 Use my location</button>
              </div>
            </div>

            <div style={{ marginTop: 12, color: 'var(--text-muted)' }}>
              Reporting as: {user?.full_name || 'anonymous'}<br />
              Contact: {user?.phone || 'not provided'}
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={submitIncident} disabled={submitting} style={{ width: '100%', background: '#EF4444', color: '#fff', padding: '12px 16px', borderRadius: 10, fontWeight: 900 }}>
                {submitting ? loadingStage || 'Dispatching...' : 'Dispatch Emergency Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
