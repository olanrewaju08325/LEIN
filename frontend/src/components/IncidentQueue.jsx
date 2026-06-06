import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, ShieldAlert, CarFront } from 'lucide-react';

const TYPE_META = {
  Medical:  { icon: Activity,    color: 'var(--med-blue)' },
  Fire:     { icon: Flame,       color: 'var(--alert-red)' },
  Security: { icon: ShieldAlert, color: 'var(--premium-gold)' },
  Accident: { icon: CarFront,    color: 'var(--warn-amber)' },
};

export default function IncidentQueue({ incidents, selectedIncident, setSelectedIncident }) {
  const getMeta = (type) => TYPE_META[type] || { icon: Activity, color: '#94A3B8' };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AnimatePresence>
        {incidents.map((incident) => {
          const meta = getMeta(incident.type);
          const Icon = meta.icon;
          const isSelected = selectedIncident?.id === incident.id;
          const isCritical = incident.priority_score > 7;
          
          return (
            <motion.div
              layout
              key={incident.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`incident-card ${isSelected ? 'selected' : ''}`}
              style={{
                '--severity-color': isCritical ? 'var(--alert-red)' : meta.color,
                boxShadow: isCritical && isSelected ? '0 0 24px rgba(229,72,77,0.2)' : 'none'
              }}
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="inc-header">
                <div className="inc-type" style={{ color: meta.color }}>
                  <Icon size={16} /> {incident.type}
                </div>
                <div className="inc-time">
                  {incident.timestamp ? new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                </div>
              </div>
              
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 12, fontWeight: 500 }}>
                {incident.lga} LGA
              </div>

              <div className="inc-meta">
                <span style={{ color: isCritical ? 'var(--alert-red)' : 'var(--text-secondary)' }}>
                  SEV: {incident.severity}/5
                </span>
                <span style={{ color: 'var(--ai-blue)' }}>
                  CONF: {Math.round(incident.priority_score * 10)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {incidents.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
          SYSTEM STATUS: STABLE<br/>NO ACTIVE INCIDENTS
        </div>
      )}
    </div>
  );
}
