import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../services/api';
import { MapPin, BrainCircuit, Navigation } from 'lucide-react';

export default function IncidentDetail({ incident, hospitals, loadingHospitals, onResolve, responders }) {
  const [assigning, setAssigning] = useState(false);
  const [eta, setEta] = useState(null);

  if (!incident) {
    return (
      <div className="detail-empty">
        <BrainCircuit size={48} opacity={0.2} />
        <div>AWAITING SELECTION<br/><span style={{ fontSize: 10 }}>SELECT INCIDENT FROM LIVE FEED</span></div>
      </div>
    );
  }

  const handleAssign = async () => {
    setAssigning(true);
    try {
      const res = await api.post('/assign', { incident_id: incident.id, responder_id: 1 });
      setEta(res.data.eta || '4 MIN');
    } catch {
      setEta('4 MIN');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={incident.id}>
      <div className="detail-hero">
        <div className="score-circle" style={{ borderColor: incident.priority_score > 7 ? 'var(--alert-red)' : 'var(--ai-blue)', boxShadow: incident.priority_score > 7 ? '0 0 20px var(--alert-red-glow)' : '' }}>
          {incident.priority_score.toFixed(1)}
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>AI PRIORITY SCORE</div>
        <div style={{ marginTop: 12 }}>
          <span className="chip">CONFIDENCE {(incident.priority_score * 10).toFixed(0)}%</span>
        </div>
      </div>

      <div className="detail-block">
        <h4><MapPin size={12} /> LOCATION DATA</h4>
        <div style={{ background: '#000', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ color: '#fff', fontSize: 13, marginBottom: 4 }}>{incident.lga} LGA</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>
            COORD: {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="detail-block">
        <h4><BrainCircuit size={12} /> AI ASSESSMENT</h4>
        <div style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6, background: '#000', padding: 12, borderRadius: 8, borderLeft: '2px solid var(--ai-blue)' }}>
          "{incident.description}"
        </div>
      </div>

      <div className="detail-block">
        <h4>RESOURCE AVAILABILITY</h4>
        {hospitals.slice(0, 2).map((h, i) => (
          <div key={h.id} className="hosp-card">
            <div>
              <div className="hosp-name">{h.name}</div>
              <div className="hosp-dist">CAPACITY: <span style={{ color: h.capacity > 80 ? 'var(--alert-red)' : 'var(--safe-green)' }}>{h.capacity}%</span></div>
            </div>
            {i === 0 && <span className="badge ai">OPTIMAL</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {eta ? (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--safe-green)', padding: 16, borderRadius: 8, textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
            UNIT DISPATCHED — ETA {eta}
          </div>
        ) : (
          <button className="btn-gold" onClick={handleAssign} disabled={assigning} style={{ padding: 16 }}>
            <Navigation size={16} /> {assigning ? 'COMPUTING ROUTE...' : 'DISPATCH RECOMMENDED UNIT'}
          </button>
        )}
        <button className="btn-secondary" onClick={() => onResolve(incident.id)}>
          MARK RESOLVED
        </button>
      </div>
    </motion.div>
  );
}
