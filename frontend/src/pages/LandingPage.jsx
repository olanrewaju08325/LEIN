import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Brain,
  Building2,
  LineChart,
  List,
  Map,
  MessageCircle,
  MousePointer,
  Navigation,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

const colors = {
  bg: '#0A0F1E',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.15)',
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  gold: '#FCD34D',
  purple: '#A855F7',
  amber: '#F59E0B',
  text: '#FFFFFF',
  secondary: '#CBD5E1',
  muted: '#94A3B8',
};

const sectionMotion = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const buttonBase = {
  height: 56,
  borderRadius: 999,
  padding: '0 32px',
  fontWeight: 800,
  border: `1px solid ${colors.border}`,
  color: colors.text,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  whiteSpace: 'nowrap',
};

const sectionWrap = {
  maxWidth: 1180,
  margin: '0 auto',
  width: '100%',
};

const labelStyle = {
  color: colors.muted,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  marginBottom: 12,
};

const cardStyle = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
};

function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 42 }}>
      <div style={labelStyle}>{label}</div>
      <h2 style={{ color: colors.text, fontSize: 'clamp(30px, 5vw, 36px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      {subtitle && <p style={{ color: colors.muted, fontSize: 17, lineHeight: 1.7, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const stats = [
    ['< 3s', 'AI Response Time'],
    ['30+', 'Lagos Hospitals Covered'],
    ['4', 'AI Systems in Concert'],
    ['20M+', 'Residents Protected'],
  ];

  const systems = [
    {
      icon: Brain,
      number: '01',
      iconColor: colors.blue,
      title: 'Emergency Classifier',
      name: 'NLP Classifier',
      description:
        "Understands English and Nigerian Pidgin. Classifies any emergency report into Medical, Fire, Security, or Accident in milliseconds using Groq's LLaMA 3.3 model.",
      tag: 'NLP · LLM',
    },
    {
      icon: Activity,
      number: '02',
      iconColor: colors.amber,
      title: 'Severity Scorer',
      name: 'Severity Scorer',
      description:
        'RandomForest ML model trained on Lagos incident data. Scores every emergency 1-10 using 6 risk factors: type, location, time, day, keywords, and citizen input.',
      tag: 'ML · RandomForest',
    },
    {
      icon: Navigation,
      number: '03',
      iconColor: colors.green,
      title: 'Route Optimiser',
      name: 'Route Optimiser',
      description:
        'Finds the nearest available responder using Haversine distance and real Lagos traffic multipliers. Matches responder type to incident type.',
      tag: 'Optimisation · GIS',
    },
    {
      icon: LineChart,
      number: '04',
      iconColor: colors.purple,
      title: 'Incident Forecaster',
      name: 'Incident Forecaster',
      description:
        'Predicts emergency volumes for the next 6 hours across Lagos LGAs. Helps dispatchers pre-position resources before incidents occur.',
      tag: 'Forecasting · Time-Series',
    },
  ];

  const painPoints = [
    'No unified dispatch system',
    'WhatsApp coordination breaks at scale',
    'Ambulances re-routing from full hospitals',
    'Pidgin language barriers slow response',
  ];

  const comparisons = [
    ['2-6 hour coordination', '< 3 second AI dispatch'],
    ['Phone/WhatsApp chaos', 'Unified real-time dashboard'],
    ['English-only intake', 'English + Pidgin NLP'],
    ['No incident forecasting', '6-hour predictive analytics'],
  ];

  const features = [
    {
      icon: Map,
      color: colors.blue,
      title: 'Real-Time Map',
      text: 'Live Leaflet map of Lagos showing all active incidents, available responders, and hospital capacity in real time.',
    },
    {
      icon: List,
      color: colors.red,
      title: 'AI Dispatch Queue',
      text: 'Incidents automatically ranked by AI priority score. Highest severity appears at top. Color-coded by emergency type.',
    },
    {
      icon: MousePointer,
      color: colors.gold,
      title: 'One-Click Assignment',
      text: 'Assign the nearest available responder to any incident with a single click. ETA calculated instantly.',
    },
    {
      icon: Building2,
      color: colors.green,
      title: 'Hospital Intelligence',
      text: '30 Lagos hospitals with real coordinates, bed capacity, and specialisation tags. Nearest hospital recommended automatically.',
    },
    {
      icon: TrendingUp,
      color: colors.purple,
      title: 'Predictive Analytics',
      text: 'Forecast dashboard shows expected incident volumes for next 6 hours by LGA and type. Plan before emergencies happen.',
    },
    {
      icon: MessageCircle,
      color: colors.amber,
      title: 'Pidgin Support',
      text: "The only emergency platform that understands Nigerian Pidgin. 'E don faint' → Medical. Instantly.",
    },
  ];

  const faqs = [
    [
      'Do I need an account to report an emergency?',
      'No. The emergency report form is completely public. Any citizen can report an emergency without creating an account. Only dispatchers need to log in.',
    ],
    [
      'What languages does LEIN support?',
      "LEIN's AI classifier understands English, Nigerian Pidgin, and mixed language input. You can write exactly how you speak — 'e don faint' or 'person don wound' — and LEIN will classify it correctly.",
    ],
    [
      'How does the AI classify emergencies?',
      "LEIN uses a three-layer AI system: first it tries Groq's LLaMA 3.3 model for classification, then falls back to a TF-IDF machine learning model, then to keyword matching. This ensures LEIN never fails to classify an emergency.",
    ],
    [
      'How is the nearest responder chosen?',
      'The Route Optimiser calculates Haversine distance from every available responder to the incident, applies Lagos traffic multipliers based on time of day, and matches responder type to incident type (Medical → Ambulance, Fire → Fire Truck).',
    ],
    [
      'How accurate is the severity scoring?',
      'The severity model is a RandomForest regressor trained on 620 synthetic Lagos incident records. It considers 6 factors: incident type, LGA risk weight, hour of day, day of week, citizen severity hint, and high-risk keyword count.',
    ],
    [
      'What hospitals are in the system?',
      'LEIN includes 30 Lagos hospitals with real coordinates, including LUTH, Lagos Island General, Ikeja General, Reddington Hospital VI, St Nicholas Hospital, Gbagada General, and more.',
    ],
    [
      'Is LEIN free to use?',
      "LEIN was built for NacosCuab Hackathon '26 as an open innovation project. It is currently a prototype demonstrating what AI-powered emergency response could look like for Lagos.",
    ],
    [
      'Can LEIN scale beyond Lagos?',
      "Yes. The LGA risk weights, hospital seed data, and traffic multipliers are configurable. LEIN's architecture can be adapted for any Nigerian city or African megacity with minimal changes.",
    ],
  ];

  const footerLinks = [
    ['Report Emergency', '/report'],
    ['Dispatcher Login', '/login'],
    ['Create Account', '/register'],
    ['Live Dashboard', '/dashboard'],
    ['Analytics', '/analytics'],
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      <section
        style={{
          minHeight: '100vh',
          background: colors.bg,
          padding: '24px clamp(24px, 5vw, 48px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <nav style={{ ...sectionWrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={34} color={colors.gold} />
            <span style={{ color: colors.text, fontSize: 24, fontWeight: 900 }}>LEIN</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ ...buttonBase, height: 44, padding: '0 20px', background: 'transparent', borderColor: 'rgba(255,255,255,0.55)' }}
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ ...buttonBase, height: 44, padding: '0 22px', background: colors.blue, borderColor: colors.blue }}
            >
              Create Account
            </button>
          </div>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '56px 0 84px' }}
        >
          <div style={{ width: '100%', maxWidth: 960 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                border: `1px solid ${colors.red}`,
                color: colors.red,
                borderRadius: 999,
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 900,
                marginBottom: 24,
                background: 'rgba(239,68,68,0.08)',
              }}
            >
              <motion.span
                animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.16, 0.9] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: 999, background: colors.red, display: 'inline-block' }}
              />
              LIVE · AI-Powered Emergency Dispatch for Lagos
            </div>

            <h1
              style={{
                color: colors.text,
                fontSize: 'clamp(48px, 10vw, 80px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                margin: '0 0 26px',
              }}
            >
              Lagos Emergency
              <br />
              Intelligence Network
            </h1>

            <p style={{ color: colors.muted, fontSize: 'clamp(17px, 2.4vw, 20px)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 36px' }}>
              LEIN uses four AI systems to classify emergencies, score severity, and dispatch the nearest responder — all in under 3 seconds. Built for Lagos.
              Scalable to every African city.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={() => navigate('/report')} style={{ ...buttonBase, background: colors.blue, borderColor: colors.blue }}>
                🚨 Report Emergency Now
              </button>
              <button onClick={() => navigate('/login')} style={{ ...buttonBase, background: 'transparent', borderColor: 'rgba(255,255,255,0.55)' }}>
                Dispatcher Login →
              </button>
            </div>

            <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>No account needed to report · Free for emergency services</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: colors.muted, fontSize: 28 }}
        >
          ↓
        </motion.div>
      </section>

      <motion.section {...sectionMotion} style={{ background: colors.card, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: 32 }}>
        <div style={{ ...sectionWrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {stats.map(([number, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              style={{
                textAlign: 'center',
                padding: '10px 20px',
                borderLeft: index === 0 ? '0' : `1px solid ${colors.border}`,
              }}
            >
              <div style={{ color: colors.text, fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: 900, lineHeight: 1 }}>{number}</div>
              <div style={{ color: colors.muted, fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 10 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section {...sectionMotion} style={{ padding: '96px clamp(24px, 5vw, 48px)' }}>
        <div style={sectionWrap}>
          <SectionHeader label="THE TECHNOLOGY" title="Four AI Systems Working in Concert" subtitle="Every emergency report triggers a cascade of intelligent decisions" />

          <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {systems.map((system, index) => {
              const Icon = system.icon;
              return (
                <motion.div
                  key={system.number}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 48px rgba(59,130,246,0.3)', borderColor: colors.blue }}
                  style={{ ...cardStyle, position: 'relative', overflow: 'hidden', padding: 28, borderLeft: `4px solid ${system.iconColor}`, minHeight: 330 }}
                >
                  <div style={{ position: 'absolute', right: 20, top: 14, color: colors.muted, fontSize: 48, fontWeight: 900, opacity: 0.1 }}>{system.number}</div>
                  <div style={{ width: 54, height: 54, borderRadius: 999, background: `${system.iconColor}33`, color: system.iconColor, display: 'grid', placeItems: 'center', marginBottom: 22 }}>
                    <Icon size={28} />
                  </div>
                  <div style={{ color: colors.muted, fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>{system.name}</div>
                  <h3 style={{ color: colors.text, fontSize: 23, fontWeight: 900, margin: '0 0 12px' }}>{system.title}</h3>
                  <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.7, margin: '0 0 20px' }}>{system.description}</p>
                  <span style={{ color: system.iconColor, background: `${system.iconColor}14`, border: `1px solid ${system.iconColor}55`, borderRadius: 999, padding: '7px 11px', fontSize: 12, fontWeight: 900 }}>
                    {system.tag}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion} style={{ padding: '24px clamp(24px, 5vw, 48px) 96px' }}>
        <div style={{ ...sectionWrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 30, alignItems: 'center' }}>
          <div>
            <div style={labelStyle}>THE PROBLEM</div>
            <h2 style={{ color: colors.text, fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.05, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 24px' }}>
              Lagos Emergency Response is Broken
            </h2>
            <p style={{ color: colors.secondary, fontSize: 17, lineHeight: 1.75, margin: '0 0 18px' }}>
              Lagos has over 20 million residents across 20 LGAs — and no unified emergency dispatch system.
            </p>
            <p style={{ color: colors.muted, fontSize: 17, lineHeight: 1.75, margin: '0 0 24px' }}>
              Dispatchers coordinate via WhatsApp and phone calls. Ambulances arrive at full hospitals. Language barriers slow intake. No historical data exists to
              predict peak-hour incident clusters.
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {painPoints.map((point) => (
                <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 12, color: colors.secondary, fontWeight: 800 }}>
                  <span style={{ color: colors.red, fontSize: 20, lineHeight: 1 }}>✗</span>
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${colors.blue}`, padding: 28 }}>
            <h3 style={{ color: colors.text, fontSize: 28, fontWeight: 900, margin: '0 0 22px' }}>LEIN Changes Everything</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {comparisons.map(([before, after]) => (
                <div key={before} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ color: colors.red, fontWeight: 900, lineHeight: 1.4 }}>{before}</span>
                  <span style={{ color: colors.muted }}>→</span>
                  <span style={{ color: colors.green, fontWeight: 900, lineHeight: 1.4 }}>{after}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion} style={{ padding: '0 clamp(24px, 5vw, 48px) 96px' }}>
        <div style={sectionWrap}>
          <SectionHeader label="FEATURES" title="Everything a Dispatcher Needs" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  whileHover={{ y: -7, boxShadow: '0 18px 42px rgba(59,130,246,0.22)', borderColor: colors.blue }}
                  style={{ ...cardStyle, padding: 26, minHeight: 245 }}
                >
                  <div style={{ width: 50, height: 50, borderRadius: 999, background: `${feature.color}22`, color: feature.color, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                    <Icon size={25} />
                  </div>
                  <h3 style={{ color: colors.text, fontSize: 21, fontWeight: 900, margin: '0 0 10px' }}>{feature.title}</h3>
                  <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.7, margin: 0 }}>{feature.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion} style={{ padding: '0 clamp(24px, 5vw, 48px) 96px' }}>
        <div style={sectionWrap}>
          <SectionHeader label="GET STARTED" title="Up and Running in Seconds" />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
            <div style={{ position: 'absolute', left: '12%', right: '12%', top: 36, borderTop: `2px dotted ${colors.border}`, zIndex: 0 }} />
            {[
              ['1', colors.blue, 'For Citizens', 'Report an Emergency', 'Visit /report. Select type, describe in English or Pidgin, share location. No account needed.', 'Report Now →', () => navigate('/report')],
              ['2', colors.amber, 'AI Processing', 'AI Takes Over', 'LEIN classifies, scores severity, finds nearest responder, and calculates ETA in under 3 seconds.', '', null],
              ['3', colors.green, 'For Dispatchers', 'Monitor & Manage', 'Login to the dashboard. View live map, manage incident queue, assign responders, track resolutions.', 'Dispatcher Login →', () => navigate('/login')],
            ].map(([num, color, eyebrow, title, text, cta, action], index) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                style={{ ...cardStyle, padding: 26, textAlign: 'center', position: 'relative', zIndex: 1 }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 999, background: color, color: colors.text, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 900, margin: '0 auto 20px', boxShadow: `0 0 34px ${color}55` }}>
                  {num}
                </div>
                <div style={{ color, fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{eyebrow}</div>
                <h3 style={{ color: colors.text, fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>{title}</h3>
                <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.7, margin: cta ? '0 0 18px' : 0 }}>{text}</p>
                {cta && (
                  <button onClick={action} style={{ background: 'transparent', border: 0, color, fontWeight: 900, cursor: 'pointer', padding: 0 }}>
                    {cta}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion} style={{ padding: '0 clamp(24px, 5vw, 48px) 96px' }}>
        <div style={{ ...sectionWrap, maxWidth: 900 }}>
          <SectionHeader label="FAQ" title="Frequently Asked Questions" />
          <div style={{ display: 'grid', gap: 14 }}>
            {faqs.map(([question, answer], index) => {
              const open = openFaq === index;
              return (
                <div key={question} style={{ ...cardStyle, borderLeft: open ? `4px solid ${colors.blue}` : `1px solid ${colors.border}`, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    style={{ width: '100%', background: 'transparent', border: 0, color: colors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '20px 24px', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.5 }}>{question}</span>
                    <span style={{ color: colors.blue, fontSize: 26, fontWeight: 300, lineHeight: 1 }}>{open ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.75, margin: 0, padding: '0 24px 22px' }}>{answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion} style={{ padding: '0 clamp(24px, 5vw, 48px) 96px' }}>
        <div
          style={{
            ...sectionWrap,
            ...cardStyle,
            borderLeft: '4px solid transparent',
            borderImage: `linear-gradient(${colors.blue}, ${colors.purple}) 1`,
            borderRadius: 16,
            padding: 'clamp(28px, 5vw, 42px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ color: colors.text, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
              Built for Lagos.
              <br />
              Ready to Respond.
            </h2>
            <p style={{ color: colors.muted, fontSize: 17, lineHeight: 1.7, margin: 0 }}>Join the future of emergency response in Africa's largest megacity.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/report')} style={{ ...buttonBase, background: colors.blue, borderColor: colors.blue }}>
              Report Emergency
            </button>
            <button onClick={() => navigate('/login')} style={{ ...buttonBase, background: 'transparent', borderColor: 'rgba(255,255,255,0.55)' }}>
              Dispatcher Login
            </button>
          </div>
        </div>
      </motion.section>

      <footer style={{ background: colors.card, borderTop: `1px solid ${colors.border}`, padding: '40px clamp(24px, 5vw, 48px) 26px' }}>
        <div style={{ ...sectionWrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 34 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <ShieldAlert size={30} color={colors.gold} />
              <span style={{ color: colors.text, fontSize: 24, fontWeight: 900 }}>LEIN</span>
            </div>
            <p style={{ color: colors.secondary, fontWeight: 800, margin: '0 0 8px' }}>Lagos Emergency Intelligence Network</p>
            <p style={{ color: colors.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>AI-Powered · Real-Time · Built for Lagos</p>
          </div>

          <div>
            <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 900, margin: '0 0 14px' }}>Platform</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {footerLinks.map(([label, path]) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{ background: 'transparent', border: 0, color: colors.muted, padding: 0, textAlign: 'left', cursor: 'pointer', fontWeight: 800 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ color: colors.text, fontSize: 15, fontWeight: 900, margin: '0 0 14px' }}>Built With</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {['FastAPI', 'Supabase', 'React', 'Groq LLaMA', 'scikit-learn', 'Leaflet'].map((tech) => (
                <span key={tech} style={{ color: colors.secondary, border: `1px solid ${colors.border}`, borderRadius: 999, padding: '7px 10px', fontSize: 12, fontWeight: 800 }}>
                  {tech}
                </span>
              ))}
            </div>
            <p style={{ color: colors.muted, fontSize: 14, margin: 0 }}>NacosCuab Hackathon '26</p>
          </div>
        </div>

        <div style={{ ...sectionWrap, borderTop: `1px solid ${colors.border}`, marginTop: 34, paddingTop: 22, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', color: colors.muted, fontSize: 13 }}>
          <span>© 2026 LEIN. Built in 48 hours.</span>
          <span>Lagos, Nigeria 🇳🇬</span>
        </div>
      </footer>
    </div>
  );
}
