import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function ForecastTable({ data }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>Forecast data unavailable</div>;

  return (
    <div className="forecast-grid">
      {data.slice(0, 8).map((row, i) => {
        const isHigh = row.predicted_incidents > 15;
        const Icon = isHigh ? AlertTriangle : TrendingUp;
        return (
          <motion.div
            key={i}
            className="forecast-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{ '--card-accent': isHigh ? 'var(--alert-red)' : 'var(--ai-blue)' }}
          >
            <div className="fc-lga">{row.lga}</div>
            <div className="fc-type">{row.type}</div>
            <div className="fc-metric">
              <Icon size={16} color={isHigh ? 'var(--alert-red)' : 'var(--ai-blue)'} />
              <span className="fc-val" style={{ color: isHigh ? 'var(--alert-red)' : 'var(--text-primary)' }}>
                {row.predicted_incidents}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>PROJECTED</span>
            </div>
            {isHigh && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, color: 'var(--alert-red)', fontWeight: 700, padding: '2px 6px', background: 'rgba(229,72,77,0.1)', borderRadius: 4 }}>HIGH RISK</div>}
          </motion.div>
        );
      })}
    </div>
  );
}
