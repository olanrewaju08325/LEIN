import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ActivitySquare, Clock, Users, Hospital } from 'lucide-react';

const CARDS = [
  { title: 'ACTIVE INCIDENTS', key: 'activeCount',     icon: ActivitySquare, color: 'var(--alert-red)' },
  { title: 'AVG RESPONSE',     key: 'avgResponse',     icon: Clock,          color: 'var(--ai-blue)' },
  { title: 'RESPONDERS',       key: 'respondersCount', icon: Users,          color: 'var(--premium-gold)' },
  { title: 'HOSPITALS ONLINE', key: 'hospitalsOnline', icon: Hospital,       color: 'var(--safe-green)' },
];

function AnimatedCounter({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    const isNum = !isNaN(parseFloat(String(value)));
    if (!isNum || !ref.current) {
      if (ref.current) ref.current.textContent = value;
      return;
    }
    const numVal = parseFloat(String(value));
    gsap.fromTo({ v: 0 }, { v: 0 }, {
      v: numVal, duration: 1.5, ease: 'power2.out',
      onUpdate() { if (ref.current) ref.current.textContent = Math.round(this.targets()[0].v); }
    });
  }, [value]);
  return <span ref={ref}>{value}</span>;
}

export default function SummaryCards({ activeCount = 0, avgResponse = '0', respondersCount = 0, hospitalsOnline = 0 }) {
  const values = { activeCount, avgResponse: parseFloat(avgResponse) || 0, respondersCount, hospitalsOnline };

  return (
    <div className="kpi-grid">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.key}
            className="kpi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="kpi-header">
              <span className="kpi-title">{card.title}</span>
              <Icon size={16} color={card.color} />
            </div>
            <div className="kpi-value" style={{ color: card.color }}>
              <AnimatedCounter value={values[card.key]} />
              {card.key === 'avgResponse' && <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 4 }}>MIN</span>}
            </div>
            <div style={{ height: 2, width: '40%', background: card.color, opacity: 0.5, marginTop: 'auto' }} />
          </motion.div>
        );
      })}
    </div>
  );
}
