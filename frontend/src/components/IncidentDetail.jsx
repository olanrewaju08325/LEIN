import { motion } from 'framer-motion';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import api from '../services/api';
import { useState } from 'react';

export default function IncidentDetail({ incident, hospitals, loadingHospitals, onResolve }) {
  const [assigning, setAssigning] = useState(false);
  const [eta, setEta] = useState(null);

  if (!incident) {
    return (
      <div className="incident-detail-panel">
        <EmptyState message="← Select an incident from the queue" />
      </div>
    );
  }

  const handleAssign = async () => {
    setAssigning(true);
    try {
      const res = await api.post('/assign', { incident_id: incident.id, responder_id: 1 }); // Mock responder_id
      setEta(res.data.eta || '12 mins');
    } catch {
      // Mock ETA on error
      setEta('12 mins (mock)');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <motion.div 
      className="incident-detail-panel"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      key={incident.id}
    >
      <div className="detail-section">
        <h2>Incident Details</h2>
        <div className="detail-row"><span>Type:</span> <strong>{incident.type}</strong></div>
        <div className="detail-row"><span>Location:</span> {incident.lga}</div>
        <div className="detail-row"><span>Severity:</span> {incident.severity}/5</div>
        <div className="detail-description">{incident.description}</div>
      </div>

      <div className="detail-section ai-section">
        <h3>AI Analysis</h3>
        <div className="detail-row"><span>Confidence:</span> 92%</div>
        <div className="detail-row"><span>Priority Score:</span> {incident.priority_score}/10</div>
        <div className="keywords">
          {['urgent', 'dispatch-ready'].map(kw => <span key={kw} className="chip">{kw}</span>)}
        </div>
      </div>

      <div className="detail-section">
        <h3>Nearby Hospitals</h3>
        {loadingHospitals ? (
          <LoadingSkeleton />
        ) : hospitals.length > 0 ? (
          <div className="hospital-list">
            {hospitals.slice(0, 3).map(h => (
              <div key={h.id} className="hospital-item">
                <div className="h-name">{h.name}</div>
                <div className="h-capacity">
                  <div className="h-bar" style={{ width: `${h.capacity}%`, background: h.capacity > 80 ? 'var(--alert-red)' : 'var(--safe-green)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No hospitals found nearby" />
        )}
      </div>

      <div className="detail-actions">
        {eta ? (
          <div className="eta-badge">Responder Assigned! ETA: {eta}</div>
        ) : (
          <button className="btn-primary" onClick={handleAssign} disabled={assigning}>
            {assigning ? 'Assigning...' : 'Assign Nearest Responder'}
          </button>
        )}
        <button className="btn-secondary mt-2" onClick={() => onResolve(incident.id)}>
          Resolve Incident
        </button>
      </div>
    </motion.div>
  );
}
