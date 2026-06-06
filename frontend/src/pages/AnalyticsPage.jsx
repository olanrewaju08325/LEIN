import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Cpu, Map as MapIcon, CalendarRange } from 'lucide-react';
import SummaryCards from '../components/SummaryCards';
import LGABarChart from '../components/LGABarChart';
import HourlyTrendChart from '../components/HourlyTrendChart';
import ForecastTable from '../components/ForecastTable';
import { mockHeatmap, mockForecast } from '../data/mockData';
import api from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const AI_SYSTEMS = [
  { icon: Brain,         name: 'NLP Classifier',      desc: 'Classifies emergencies in English & Pidgin using specialized LLMs', acc: '94.2%', status: 'ACTIVE' },
  { icon: Cpu,           name: 'Severity Predictor',  desc: 'Scores priority 1–10 from real-time incident features', acc: '91.8%', status: 'ACTIVE' },
  { icon: MapIcon,       name: 'Route Optimizer',     desc: 'Selects nearest available unit using live traffic multipliers', acc: '97.4%', status: 'ACTIVE' },
  { icon: CalendarRange, name: 'Incident Forecaster', desc: 'Predicts next 6h incident volume by LGA and category', acc: '88.5%', status: 'ACTIVE' },
];

export default function AnalyticsPage() {
  const [heatmap, setHeatmap] = useState(mockHeatmap);
  const [forecast, setForecast] = useState(mockForecast);
  const [summaryStats, setSummaryStats] = useState({ activeCount: 12, avgResponse: '12', respondersCount: 45, hospitalsOnline: 18 });

  const [hourlyData] = useState(() =>
    Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      medical:  Math.floor(Math.random() * 10) + (i > 7 && i < 18 ? 5 : 0),
      fire:     Math.floor(Math.random() * 3),
      security: Math.floor(Math.random() * 5) + (i > 18 ? 4 : 0),
      accident: Math.floor(Math.random() * 4) + (i === 8 || i === 17 ? 6 : 0),
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      gsap.fromTo('.analytics-row',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.analytics-container', start: 'top 80%' } }
      );
    }, 100);

    const abortController = new AbortController();
    (async () => {
      try { const r = await api.get('/stats/heatmap', { signal: abortController.signal }); setHeatmap(r.data); } catch { console.warn("API offline, using mock heatmap"); }
      try { const r = await api.get('/forecast', { signal: abortController.signal }); setForecast(r.data); } catch { console.warn("API offline, using mock forecast"); }
      try { const r = await api.get('/incidents', { signal: abortController.signal }); setSummaryStats(p => ({ ...p, activeCount: r.data.length })); } catch { console.warn("API offline, using mock incidents"); }
    })();

    return () => { clearTimeout(timer); abortController.abort(); };
  }, []);

  return (
    <div className="analytics-page">
      <div className="analytics-container" style={{ maxWidth: 1400, margin: '0 auto' }}>

        <div className="analytics-header analytics-row">
          <h1>CITY INTELLIGENCE OVERVIEW</h1>
          <p style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Real-time intelligence powered by LEIN AI Network</p>
        </div>

        <div className="analytics-row">
          <SummaryCards {...summaryStats} />
        </div>

        <div className="analytics-row charts-grid">
          <div className="chart-panel">
            <div className="chart-title"><MapIcon size={16} /> INCIDENT VOLUME BY LGA</div>
            <LGABarChart data={heatmap} />
          </div>
          <div className="chart-panel">
            <div className="chart-title"><ActivitySquare size={16} /> 24-HOUR CITY TREND</div>
            <HourlyTrendChart data={hourlyData} />
          </div>
        </div>

        <div className="analytics-row">
          <div className="chart-panel">
            <div className="chart-title"><Brain size={16} /> AI PREDICTIVE FORECAST (NEXT 6H)</div>
            <ForecastTable data={forecast} />
          </div>
        </div>

        <div className="analytics-row">
          <div className="chart-panel">
            <div className="chart-title"><Cpu size={16} /> LEIN AI SYSTEMS STATUS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {AI_SYSTEMS.map((sys, i) => {
                const Icon = sys.icon;
                return (
                  <motion.div
                    key={sys.name}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ borderColor: 'var(--ai-blue)', y: -4 }}
                  >
                    <Icon size={24} color="var(--ai-blue)" style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{sys.name}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ai-blue)', margin: '8px 0' }}>{sys.acc}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{sys.desc}</div>
                    <div style={{ marginTop: 16, fontSize: 10, color: 'var(--safe-green)', fontWeight: 700, letterSpacing: '0.1em' }}>
                      ● {sys.status}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
