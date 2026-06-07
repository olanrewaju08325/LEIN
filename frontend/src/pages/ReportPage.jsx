import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, CarFront, CheckCircle2, Flame, Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const TYPES = [
  { id: 'Medical', icon: Activity, label: 'Medical', emoji: '🏥', color: 'var(--alert-red)' },
  { id: 'Fire', icon: Flame, label: 'Fire', emoji: '🔥', color: 'var(--warn-amber)' },
  { id: 'Security', icon: ShieldAlert, label: 'Security', emoji: '🔫', color: 'var(--ai-blue)' },
  { id: 'Accident', icon: CarFront, label: 'Accident', emoji: '🚗', color: 'var(--premium-gold)' },
];

const DEFAULT_FORM = {
  type: 'Medical',
  description: '',
  location: 'Ikeja',
  lat: '6.6018',
  lng: '3.3515',
  reporter_name: '',
  reporter_phone: '',
};

const inputStyle = {
  width: '100%',
  height: 54,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-bright)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--text-primary)',
  padding: '0 16px',
  outline: 'none',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 15,
};

const labelStyle = {
  color: 'var(--text-primary)',
  fontSize: 17,
  fontWeight: 900,
  margin: '0 0 14px',
};

const loadingSteps = [
  '🔍 Classifying emergency...',
  '⚡ Scoring severity...',
  '🗺️ Finding nearest responder...',
  '✅ Dispatching response...',
];

function getTypeMeta(type) {
  return TYPES.find((item) => item.id === type) || TYPES[0];
}

function capacityColor(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('critical')) return 'var(--alert-red)';
  if (text.includes('moderate')) return 'var(--warn-amber)';
  return 'var(--safe-green)';
}

export default function ReportPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isSubmitting) return undefined;
    const timer = setInterval(() => {
      setLoadingStep((step) => (step + 1) % loadingSteps.length);
    }, 850);
    return () => clearInterval(timer);
  }, [isSubmitting]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError('');
    setIsSubmitting(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available on this device.');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField('lat', String(position.coords.latitude));
        updateField('lng', String(position.coords.longitude));
        updateField('location', 'Current location');
      },
      () => setError('Unable to access your current location.')
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.type || form.description.trim().length < 10) {
      setError('Describe the emergency with at least 10 characters.');
      return;
    }
    if (!form.reporter_name.trim() || !form.reporter_phone.trim()) {
      setError('Reporter name and phone number are required.');
      return;
    }

    setLoadingStep(0);
    setIsSubmitting(true);
    try {
      const response = await api.post('/incidents', {
        type: form.type,
        description: form.description,
        location: form.location,
        lat: Number(form.lat),
        lng: Number(form.lng),
        reporter_name: form.reporter_name,
        reporter_phone: form.reporter_phone,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Incident could not be submitted.');
    } finally {
      setLoadingStep(0);
      setIsSubmitting(false);
    }
  };

  if (result) {
    const typeMeta = getTypeMeta(result.type || form.type);
    const Icon = typeMeta.icon;
    const severity = Number(result.severity || 0);
    const items = [
      {
        label: 'Emergency Type',
        value: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: typeMeta.color }}>
            <Icon size={18} /> {result.type || form.type}
          </span>
        ),
      },
      {
        label: 'Severity',
        value: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {severity} / 5
            <span style={{ display: 'inline-flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <span key={dot} style={{ width: 8, height: 8, borderRadius: 999, background: dot <= severity ? typeMeta.color : 'var(--border-bright)' }} />
              ))}
            </span>
          </span>
        ),
      },
      { label: 'Priority Score', value: `${Number(result.priority_score || 0).toFixed(1)} / 10`, color: 'var(--alert-red)' },
      { label: 'Recommended Unit', value: result.recommended_unit, color: 'var(--ai-blue)' },
      { label: 'ETA', value: `${result.eta_minutes} minutes`, color: 'var(--safe-green)' },
      { label: 'Nearest Hospital', value: result.nearest_hospital, color: 'var(--text-primary)' },
      { label: 'Hospital Capacity', value: result.hospital_capacity, color: capacityColor(result.hospital_capacity) },
      {
        label: 'Status',
        value: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--safe-green)' }}>
            <CheckCircle2 size={16} />
            {result.status === 'dispatched' ? 'Dispatched' : result.status}
          </span>
        ),
      },
    ];

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '96px clamp(24px, 5vw, 48px) 48px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 860, margin: '0 auto', background: 'var(--bg-panel)', border: '1px solid rgba(16,185,129,0.45)', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px, 5vw, 40px)', boxShadow: 'var(--shadow-panel)' }}
        >
          <div style={{ width: 78, height: 78, borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: 'var(--safe-green)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', border: '1px solid rgba(16,185,129,0.35)' }}>
            <CheckCircle2 size={44} />
          </div>
          <h1 style={{ color: 'var(--safe-green)', textAlign: 'center', fontSize: 38, fontWeight: 900, margin: '0 0 8px' }}>Response Dispatched</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 16, margin: '0 0 32px' }}>AI has processed your emergency</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginBottom: 28 }}>
            {items.map((item) => (
              <div key={item.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 900, marginBottom: 8 }}>{item.label}</div>
                <div style={{ color: item.color || 'var(--text-primary)', fontSize: 16, fontWeight: 900 }}>{item.value}</div>
              </div>
            ))}
          </div>

          <button
            onClick={resetForm}
            style={{ width: '100%', height: 56, background: 'transparent', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <RotateCcw size={18} />
            Report Another Emergency
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '96px clamp(24px, 5vw, 48px) 48px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 860, margin: '0 auto', background: 'var(--bg-panel)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px, 5vw, 40px)', boxShadow: 'var(--shadow-panel)' }}
      >
        <header style={{ marginBottom: 34 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
            <button
              onClick={() => window.history.back()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', border: 0, color: 'var(--text-primary)', cursor: 'pointer', padding: 0, fontWeight: 900, fontSize: 18 }}
            >
              <ArrowLeft size={22} />
              Emergency Report
            </button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ai-blue)', border: '1px solid var(--ai-blue-glow)', background: 'rgba(59,130,246,0.12)', borderRadius: 999, padding: '8px 13px', fontSize: 13, fontWeight: 900 }}>
              🔴 No login required
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            Report in English or Pidgin. Our AI classifies automatically.
          </p>
        </header>

        <section style={{ marginBottom: 30 }}>
          <h2 style={labelStyle}>What is the emergency?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {TYPES.map((item) => {
              const selected = form.type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateField('type', item.id)}
                  style={{
                    minHeight: 128,
                    background: selected ? 'var(--bg-card)' : 'var(--bg-panel)',
                    border: `1px solid ${selected ? item.color : 'var(--border-bright)'}`,
                    borderRadius: 'var(--radius-xl)',
                    color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    fontSize: 18,
                    fontWeight: 900,
                    boxShadow: selected ? `0 0 28px ${item.color}` : 'none',
                    opacity: selected ? 1 : 0.72,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 34 }}>{item.emoji}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2 style={labelStyle}>Describe what happened</h2>
          <div style={{ position: 'relative' }}>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={"e.g. 'Person don faint for Ikeja bus stop, e no dey breathe' or 'Car accident on Third Mainland Bridge, 2 people injured'"}
              style={{
                width: '100%',
                minHeight: 140,
                resize: 'vertical',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-bright)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)',
                padding: '16px 16px 36px',
                outline: 'none',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 15,
                lineHeight: 1.6,
              }}
            />
            <span style={{ position: 'absolute', right: 16, bottom: 14, color: 'var(--text-muted)', fontSize: 12, fontWeight: 800 }}>
              {form.description.length} characters
            </span>
          </div>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2 style={labelStyle}>Your location</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'center' }}>
            <input style={inputStyle} value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="LGA, street, landmark, or address" />
            <button
              type="button"
              onClick={useCurrentLocation}
              style={{ height: 54, padding: '0 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-bright)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              📍 Use my current location
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
            <input style={inputStyle} value={form.lat} onChange={(e) => updateField('lat', e.target.value)} placeholder="Latitude" />
            <input style={inputStyle} value={form.lng} onChange={(e) => updateField('lng', e.target.value)} placeholder="Longitude" />
          </div>
        </section>

        <section style={{ marginBottom: 26 }}>
          <h2 style={labelStyle}>Contact <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>(Optional)</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <input style={inputStyle} value={form.reporter_name} onChange={(e) => updateField('reporter_name', e.target.value)} placeholder="Your name" />
            <input style={inputStyle} value={form.reporter_phone} onChange={(e) => updateField('reporter_phone', e.target.value)} placeholder="Phone number" />
          </div>
        </section>

        {error && (
          <div style={{ color: 'var(--alert-red)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 24, fontWeight: 800 }}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ width: '100%', minHeight: 64, background: 'var(--ai-blue)', border: '1px solid var(--ai-blue)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 900, letterSpacing: 0, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 18px' }}
        >
          {isSubmitting ? <Loader2 className="inline-spin" size={22} /> : null}
          {isSubmitting ? loadingSteps[loadingStep] : 'DISPATCH EMERGENCY RESPONSE'}
        </button>
      </motion.div>
    </div>
  );
}
