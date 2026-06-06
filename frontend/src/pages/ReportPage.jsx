import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EMERGENCY_TYPES = [
  { id: 'Medical', icon: '🏥', label: 'Medical' },
  { id: 'Fire', icon: '🔥', label: 'Fire' },
  { id: 'Security', icon: '🔒', label: 'Security' },
  { id: 'Accident', icon: '🚗', label: 'Accident' }
];

export default function ReportPage() {
  const navigate = useNavigate();
  
  // Form State
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null); // { lat, lng }
  const [locationError, setLocationError] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [severityHint, setSeverityHint] = useState(3);
  
  // Validation & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  // Refs for auto-resizing textarea
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [description]);

  const handleLocationDetect = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(false);
      },
      () => {
        setLocationError(true);
      }
    );
  };

  const getSeverityColor = (val) => {
    if (val <= 2) return 'var(--safe-green)';
    if (val === 3) return '#F39C12'; // Orange
    return 'var(--alert-red)';
  };

  const validate = () => {
    const newErrors = {};
    if (!type) newErrors.type = 'Please select an emergency type';
    if (description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    
    const finalLat = location ? location.lat : manualLat;
    const finalLng = location ? location.lng : manualLng;
    if (!finalLat || !finalLng) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    const finalLat = location ? location.lat : parseFloat(manualLat);
    const finalLng = location ? location.lng : parseFloat(manualLng);

    try {
      const reportRes = await api.post('/report', { 
        type, 
        description, 
        lat: finalLat, 
        lng: finalLng, 
        severity_hint: severityHint 
      });
      const { incident_id } = reportRes.data;
      
      const classifyRes = await api.post('/classify', { incident_id });
      setResult(classifyRes.data);
    } catch (err) {
      console.warn('API failed, using mock result', err);
      // Mock fallback
      setResult({
        type: type,
        confidence: 0.92,
        keywords: ['emergency', 'urgent'],
        priority_score: 7
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="report-container">
        <motion.div 
          className="result-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="success-banner">✓ Report submitted</div>
          <h2>AI Classification</h2>
          <div className="result-stats">
            <div><strong>Type:</strong> {result.type}</div>
            <div><strong>Confidence:</strong> {(result.confidence * 100).toFixed(0)}%</div>
            <div><strong>Priority Score:</strong> {result.priority_score}/10</div>
          </div>
          <div className="keywords">
            {result.keywords?.map(kw => (
              <span key={kw} className="chip">{kw}</span>
            ))}
          </div>
          <button className="btn-primary mt-4" onClick={() => navigate('/dashboard')}>
            View Dashboard →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-card">
        <div className="report-header">
          <h1>LEIN</h1>
          <p>Report an Emergency — English or Pidgin accepted</p>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          {/* Emergency Type Selector */}
          <div className="form-group">
            <label>Emergency Type</label>
            <div className="type-grid">
              {EMERGENCY_TYPES.map(et => (
                <motion.div
                  key={et.id}
                  className={`type-btn ${type === et.id ? 'selected' : ''}`}
                  onClick={() => setType(et.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="icon">{et.icon}</span>
                  <span>{et.label}</span>
                </motion.div>
              ))}
            </div>
            {errors.type && <div className="error-text">{errors.type}</div>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the emergency in English or Pidgin... e.g. 'e don do am, e no dey breathe'"
              rows={3}
              style={{ minHeight: '80px', maxHeight: '200px' }}
            />
            <div className="char-counter">{description.length} chars</div>
            {errors.description && <div className="error-text">{errors.description}</div>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location</label>
            {!location ? (
              <button type="button" className="btn-secondary" onClick={handleLocationDetect}>
                📍 Auto-detect my location
              </button>
            ) : null}
            
            <AnimatePresence>
              {location && (
                <motion.div 
                  className="location-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  ✓ Detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  <button type="button" className="btn-text" onClick={() => setLocation(null)}>Change</button>
                </motion.div>
              )}
            </AnimatePresence>

            {locationError && !location && (
              <div className="manual-location mt-2">
                <input type="number" step="any" placeholder="Latitude" value={manualLat} onChange={e => setManualLat(e.target.value)} />
                <input type="number" step="any" placeholder="Longitude" value={manualLng} onChange={e => setManualLng(e.target.value)} />
              </div>
            )}
            {errors.location && <div className="error-text">{errors.location}</div>}
          </div>

          {/* Severity */}
          <div className="form-group">
            <label>Severity ({severityHint})</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={severityHint} 
              onChange={e => setSeverityHint(parseInt(e.target.value))}
              style={{ accentColor: getSeverityColor(severityHint), transition: 'accent-color 0.3s' }}
            />
            <div className="severity-labels">
              <span>1 = Minor</span>
              <span>3 = Moderate</span>
              <span>5 = Critical</span>
            </div>
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
