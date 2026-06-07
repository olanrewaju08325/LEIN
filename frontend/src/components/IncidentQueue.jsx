import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, ShieldAlert, CarFront } from 'lucide-react';
import { useState, useEffect } from 'react';

const TYPE_META = {
  Medical:  { icon: Activity,    color: 'var(--med-blue)' },
  Fire:     { icon: Flame,       color: 'var(--alert-red)' },
  Security: { icon: ShieldAlert, color: 'var(--premium-gold)' },
  Accident: { icon: CarFront,    color: 'var(--warn-amber)' },
};

export default function IncidentQueue({ incidents, selectedId, onSelectIncident }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getMeta = (type) => TYPE_META[type] || { icon: Activity, color: '#94A3B8' };
  const formatMinutesAgo = (timestamp) => {
    if (!timestamp) return 'a few mins ago';
    const minutes = Math.max(0, Math.floor((now - new Date(timestamp).getTime()) / 60000));
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  };

  const getPriorityColor = (score) => {
    if (score > 7) return 'var(--alert-red)';
    if (score >= 4) return 'var(--warn-amber)';
    return 'var(--safe-green)';
  };

  if (!incidents || incidents.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        No active incidents
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AnimatePresence>
        {incidents.map((incident) => {
          const meta = getMeta(incident.type);
          const Icon = meta.icon;
          const isSelected = selectedId === incident.id;
          const priorityScore = Number(incident.priority_score ?? incident.severity * 2);
          const priorityColor = getPriorityColor(priorityScore);
          const isCritical = priorityScore > 7;

          return (
            <motion.div
              layout
              key={incident.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`incident-card ${isSelected ? 'selected' : ''}`}
              style={{
                borderColor: isSelected ? priorityColor : 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                boxShadow: isSelected ? `0 0 24px ${priorityColor}22` : 'none',
                cursor: 'pointer',
              }}
              onClick={() => onSelectIncident?.(incident)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: `${meta.color}22` }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{incident.type || 'Incident'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{incident.type} emergency</div>
                  </div>
                </div>
                {isCritical && (
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', background: 'var(--alert-red)', borderRadius: 999, padding: '4px 8px' }}>
                    CRITICAL
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Location</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{incident.lga || 'Unknown LGA'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Priority</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: priorityColor }}>{priorityScore.toFixed(1)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reported {formatMinutesAgo(incident.timestamp)}</div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectIncident?.(incident);
                  }}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 14px',
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
