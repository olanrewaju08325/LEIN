import { motion } from 'framer-motion';

export default function IncidentQueue({ incidents, selectedIncident, setSelectedIncident }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'Medical': return 'var(--accent-blue)';
      case 'Fire': return 'var(--alert-red)';
      case 'Security': return '#F39C12';
      case 'Accident': return '#F1C40F';
      default: return 'var(--text-muted)';
    }
  };

  const getSeverityBadge = (sev) => {
    if (sev <= 2) return <span className="badge safe">Low Priority</span>;
    if (sev === 3) return <span className="badge warn">Moderate Priority</span>;
    return <span className="badge danger">High Priority</span>;
  };

  return (
    <div className="incident-queue">
      <div className="queue-header">
        <h2>Active Incidents</h2>
        <span className="live-badge">{incidents.length} Live</span>
      </div>
      <div className="queue-list">
        {incidents.map((incident) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={incident.id}
            className={`queue-card ${selectedIncident?.id === incident.id ? 'selected' : ''}`}
            onClick={() => setSelectedIncident(incident)}
            style={{ borderLeftColor: getTypeColor(incident.type) }}
          >
            <div className="card-top">
              <span className="type-label">{incident.type}</span>
              <span className="time-ago">Just now</span>
            </div>
            <div className="lga-label">📍 {incident.lga}</div>
            
            <div className="priority-bar-container">
              <div 
                className="priority-bar-fill" 
                style={{ width: `${(incident.priority_score / 10) * 100}%` }} 
              />
            </div>

            <div className="card-bottom">
              {getSeverityBadge(incident.severity)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
