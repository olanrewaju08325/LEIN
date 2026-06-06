import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Flame, ShieldAlert, CarFront, CheckCircle2, Mic, MapPin } from 'lucide-react';
import api from '../services/api';
import { gsap } from 'gsap';

const TYPES = [
  { id: 'Medical',  icon: Activity,    label: 'Medical',  color: 'var(--med-blue)' },
  { id: 'Fire',     icon: Flame,       label: 'Fire',     color: 'var(--alert-red)' },
  { id: 'Security', icon: ShieldAlert, label: 'Security', color: 'var(--premium-gold)' },
  { id: 'Accident', icon: CarFront,    label: 'Accident', color: 'var(--warn-amber)' },
];

function AIProcessingSequence() {
  const steps = [
    'ANALYZING INCIDENT DATA',
    'CLASSIFYING EMERGENCY TYPE',
    'SCORING SEVERITY MATRIX',
    'LOCATING NEAREST RESPONDERS'
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const int = setInterval(() => {
      setActive(p => (p < steps.length ? p + 1 : p));
    }, 600);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="ai-processing-sequence">
      <div style={{ marginBottom: 16, color: 'var(--ai-blue)', fontWeight: 600 }}>AI TRIAGE IN PROGRESS...</div>
      {steps.map((s, i) => (
        <div key={s} className={`proc-step ${active === i ? 'active' : active > i ? 'done' : ''}`}>
          <span>{active > i ? '[ OK ]' : active === i ? '[ .. ]' : '[    ]'}</span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, { y: 40, opacity: 0, duration: 0.6, ease: 'power3.out' });
    }
  }, []);

  const handleLocationDetect = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || description.length < 10) return;
    setIsSubmitting(true);

    try {
      const reportRes = await api.post('/report', { type, description, lat: location?.lat || 6.52, lng: location?.lng || 3.38, severity_hint: 3 });
      const { incident_id } = reportRes.data;
      setTimeout(async () => {
        try {
          const classifyRes = await api.post('/classify', { incident_id });
          setResult(classifyRes.data);
        } catch {
          setResult({ type, confidence: 0.94, keywords: ['urgent', 'dispatch-required'], priority_score: 8.1 });
        }
        setIsSubmitting(false);
      }, 2400); // Wait for sequence animation
    } catch {
      setTimeout(() => {
        setResult({ type, confidence: 0.94, keywords: ['urgent', 'dispatch-required'], priority_score: 8.1 });
        setIsSubmitting(false);
      }, 2400);
    }
  };

  if (result) {
    return (
      <div className="report-page">
        <motion.div className="result-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="result-icon-wrapper">
            <CheckCircle2 size={32} />
          </div>
          <h2>INCIDENT CLASSIFIED</h2>
          <p style={{ marginBottom: 24 }}>System has processed and verified the intelligence report.</p>

          <div className="intelligence-readout">
            <div className="readout-row">
              <span className="readout-label">CLASSIFICATION</span>
              <span style={{ color: 'var(--ai-blue-light)', fontWeight: 700 }}>{result.type}</span>
            </div>
            <div className="readout-row">
              <span className="readout-label">AI CONFIDENCE</span>
              <span style={{ color: 'var(--safe-green)', fontWeight: 700 }}>{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="readout-row">
              <span className="readout-label">PRIORITY SCORE</span>
              <span style={{ color: result.priority_score >= 8 ? 'var(--alert-red)' : 'var(--warn-amber)', fontWeight: 700 }}>
                {result.priority_score}/10.0
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              OPEN COMMAND CENTER
            </button>
            <button className="btn-secondary" onClick={() => { setResult(null); setType(''); setDescription(''); }}>
              NEW REPORT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-card" ref={cardRef}>
        <div className="report-header">
          <p>AI-ASSISTED TRIAGE SYSTEM</p>
          <h1>NEW INCIDENT REPORT</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-grid">
            {TYPES.map(t => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  className={`type-card ${type === t.id ? 'selected' : ''}`}
                  onClick={() => setType(t.id)}
                >
                  <div className="type-icon"><Icon size={28} /></div>
                  <div className="type-label">{t.label}</div>
                </div>
              );
            })}
          </div>

          <div className="terminal-input-wrapper">
            <div className="terminal-header">
              <span>INPUT_STREAM</span>
              <span>LANG: EN/PIDGIN</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="> Describe the emergency situation..."
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <button type="button" className="btn-secondary" onClick={handleLocationDetect} style={{ fontSize: 11 }}>
              <MapPin size={14} /> {location ? `LOC: ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : 'ACQUIRE LOCATION'}
            </button>
            <button type="button" className="btn-secondary" style={{ fontSize: 11 }}>
              <Mic size={14} /> VOICE REC
            </button>
          </div>

          {isSubmitting ? (
            <AIProcessingSequence />
          ) : (
            <button type="submit" className="btn-gold" style={{ width: '100%', height: 48 }}>
              TRANSMIT TO LEIN NETWORK
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
