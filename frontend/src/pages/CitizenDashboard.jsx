import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Loader2, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMyIncidents, getIncidentStatus, trackIncident } from '../services/api';
import { getUser } from '../services/auth';

const statusStyles = {
  pending: { background: 'rgba(234,179,8,0.15)', color: 'var(--warn-amber)' },
  assigned: { background: 'rgba(59,130,246,0.12)', color: 'var(--ai-blue)' },
  responding: { background: 'rgba(16,185,129,0.12)', color: 'var(--safe-green)' },
  resolved: { background: 'rgba(16,185,129,0.18)', color: 'var(--safe-green)' },
  cancelled: { background: 'rgba(239,68,68,0.12)', color: 'var(--alert-red)' },
};

function formatTimestamp(timestamp) {
  try {
    return new Date(timestamp).toLocaleString('en-US', { hour12: false, dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return timestamp || 'Unknown';
  }
}

export default function CitizenDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingId, setTrackingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const user = getUser();

  useEffect(() => {
    let active = true;
    async function loadIncidents() {
      setLoading(true);
      setError('');
      try {
        const data = await getMyIncidents();
        if (!active) return;
        setIncidents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        setError('Unable to load your incident reports.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadIncidents();

    const interval = setInterval(loadIncidents, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleRefreshStatus = async (incidentId) => {
    setTrackingId(incidentId);
    setRefreshing(true);
    setError('');
    try {
      const statusData = await getIncidentStatus(incidentId);
      if (statusData && statusData.status) {
        setIncidents((current) =>
          current.map((incident) =>
            incident.id === incidentId ? { ...incident, status: statusData.status, updated_at: statusData.updated_at || incident.updated_at } : incident
          )
        );
      }
    } catch (err) {
      setError('Unable to refresh incident status at this time.');
    } finally {
      setRefreshing(false);
      setTrackingId(null);
    }
  };

  const handleTrackLocation = async (incidentId) => {
    setTrackingId(incidentId);
    setRefreshing(true);
    setError('');
    try {
      const trackData = await trackIncident(incidentId);
      if (trackData && trackData.status) {
        setIncidents((current) =>
          current.map((incident) =>
            incident.id === incidentId ? { ...incident, status: trackData.status, updated_at: trackData.updated_at || incident.updated_at } : incident
          )
        );
      }
    } catch (err) {
      setError('Unable to track incident location right now.');
    } finally {
      setRefreshing(false);
      setTrackingId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '36px 28px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 980, margin: '0 auto 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: 'var(--ai-blue)', display: 'grid', placeItems: 'center', color: 'var(--text-primary)' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>Citizen Tracking Dashboard</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>Monitor your reported incidents and get the latest response status.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ padding: '14px 18px', borderRadius: 18, background: 'rgba(59,130,246,0.08)', minWidth: 220 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Welcome back</div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{user?.full_name || 'Citizen'}</div>
            </div>
            <div style={{ padding: '14px 18px', borderRadius: 18, background: 'rgba(16,185,129,0.08)', minWidth: 220 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Your role</div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>Citizen</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} style={{ maxWidth: 980, margin: '0 auto 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 18, borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border-bright)', width: '100%', minWidth: 260 }}>
            <Activity size={18} color="var(--ai-blue)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Live Reports</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{loading ? '—' : incidents.length}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 18, borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border-bright)', width: '100%', minWidth: 260 }}>
            <MapPin size={18} color="var(--safe-green)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>Current Status</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{incidents.some((incident) => incident.status === 'responding') ? 'Responding' : 'Pending'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {error && (
          <div style={{ marginBottom: 18, padding: 18, borderRadius: 18, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--alert-red)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ minHeight: 260, display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
            <Loader2 className="inline-spin" size={32} />
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: 30, borderRadius: 24, border: '1px solid var(--border-bright)', background: 'var(--bg-card)', color: 'var(--text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>No citizen reports yet</div>
            <div style={{ marginBottom: 16 }}>Submit an incident report from the Report page, then return here to track response progress.</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, background: 'var(--ai-blue)', color: 'var(--text-primary)', fontWeight: 800 }}>
              <CheckCircle2 size={18} /> Report and track</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {incidents.map((incident) => {
              const statusKey = (incident.status || 'pending').toLowerCase();
              const style = statusStyles[statusKey] || { background: 'rgba(148,163,184,0.12)', color: 'var(--text-secondary)' };
              return (
                <div key={incident.id} style={{ borderRadius: 24, border: '1px solid var(--border-bright)', background: 'var(--bg-card)', padding: 22, display: 'grid', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{incident.type || 'Incident Report'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{incident.lga || incident.location || 'Unknown location'}</div>
                    </div>
                    <span style={{ ...style, padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>{incident.status || 'Pending'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                      <div><strong>Reported:</strong> {formatTimestamp(incident.timestamp || incident.reported_at || incident.created_at)}</div>
                      <div><strong>Reference:</strong> {incident.reference || `#${incident.id}`}</div>
                      <div><strong>Current response:</strong> {incident.details || 'Monitoring status updates'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button
                        onClick={() => handleRefreshStatus(incident.id)}
                        disabled={refreshing && trackingId === incident.id}
                        style={{ height: 46, borderRadius: 14, border: '1px solid var(--border-bright)', background: 'var(--bg-panel)', color: 'var(--text-primary)', fontWeight: 900, cursor: 'pointer' }}
                      >
                        {refreshing && trackingId === incident.id ? <Loader2 className="inline-spin" size={16} /> : <RefreshCw size={16} />}
                        <span style={{ marginLeft: 8 }}>{refreshing && trackingId === incident.id ? 'Refreshing' : 'Refresh status'}</span>
                      </button>
                      <button
                        onClick={() => handleTrackLocation(incident.id)}
                        disabled={refreshing && trackingId === incident.id}
                        style={{ height: 46, borderRadius: 14, border: '1px solid var(--ai-blue)', background: 'var(--ai-blue)', color: 'var(--text-primary)', fontWeight: 900, cursor: 'pointer' }}
                      >
                        {refreshing && trackingId === incident.id ? <Loader2 className="inline-spin" size={16} /> : <MapPin size={16} />}
                        <span style={{ marginLeft: 8 }}>{refreshing && trackingId === incident.id ? 'Tracking...' : 'Track location'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
