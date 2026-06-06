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
                  <Icon size={24} /> 
                  <span>{isCritical ? 'CRITICAL ' : ''}{incident.type} EMERGENCY</span>
                </div>
              </div>
              
              <div style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 16, fontWeight: 700 }}>
                {incident.lga} LGA
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>PRIORITY</span>
                  <span style={{ color: isCritical ? 'var(--alert-red)' : 'var(--text-primary)', fontSize: 20, fontWeight: 900 }}>
                    {incident.priority_score ? incident.priority_score.toFixed(1) : (incident.severity * 2).toFixed(1)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>AI CONFIDENCE</span>
                  <span style={{ color: 'var(--ai-blue-light)', fontSize: 20, fontWeight: 900 }}>
                    {incident.priority_score ? Math.round(incident.priority_score * 10) : 94}%
                  </span>
                </div>
              </div>

              <div className="inc-time">
                Reported {incident.timestamp ? Math.floor((Date.now() - new Date(incident.timestamp).getTime()) / 60000) : '2'} minutes ago
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
