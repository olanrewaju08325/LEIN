import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Radar } from 'lucide-react';

const STEPS = [
  'INITIALIZING NEURAL NETWORKS...',
  'CONNECTING TO LAGOS DATA GRID...',
  'CALIBRATING TRIAGE ALGORITHMS...',
  'LOADING PREDICTIVE FORECAST MODELS...',
];

export default function LoadingScreen({ onComplete }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState([]);
  const [showReady, setShowReady] = useState(false);
  const progressRef = useRef(null);
  const readyRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(ringRef.current, { scale: 0, opacity: 0, duration: 0.8, ease: 'power3.out' });

    STEPS.forEach((_, i) => {
      tl.call(() => setActiveStep(i), [], `+=${i === 0 ? 0.2 : 0.4}`)
        .to(progressRef.current, { width: `${((i + 1) / STEPS.length) * 100}%`, duration: 0.4, ease: 'none' }, '<')
        .call(() => {
          setDoneSteps(prev => [...prev, i]);
          setActiveStep(-1);
        }, [], '+=0.3');
    });

    tl.call(() => setShowReady(true), [], '+=0.2')
      .to(readyRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '<')
      .to(progressRef.current, { width: '100%', duration: 0.2 }, '<')
      .call(() => {
        gsap.to('.loading-screen', {
          opacity: 0, duration: 0.6, delay: 0.8, ease: 'power2.inOut',
          onComplete,
        });
      }, [], '+=0.4');
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-logo-ring" ref={ringRef}>
        <Radar size={32} color="var(--ai-blue)" />
      </div>

      <div className="loading-title">LEIN.OS</div>
      <div className="loading-tagline">LAGOS EMERGENCY INTELLIGENCE NETWORK</div>

      <div className="loading-steps">
        <div style={{ marginBottom: 16, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
          SYS.BOOT SEQUENCE INITIATED
        </div>
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`loading-step${activeStep === i ? ' active' : ''}${doneSteps.includes(i) ? ' done' : ''}`}
          >
            <span>{step}</span>
            <span>{doneSteps.includes(i) ? '[ OK ]' : activeStep === i ? '[ .. ]' : ''}</span>
          </div>
        ))}
      </div>

      <div className="loading-progress-bar">
        <div className="loading-progress-fill" ref={progressRef} />
      </div>

      <div className="loading-ready" ref={readyRef} style={{ transform: 'translateY(10px)', opacity: 0, marginTop: 24, fontSize: 13, fontWeight: 700, color: 'var(--safe-green)', letterSpacing: '0.2em' }}>
        {showReady ? 'SYSTEM READY' : ''}
      </div>
    </div>
  );
}
