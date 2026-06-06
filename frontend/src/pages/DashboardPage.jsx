import { useEffect, useState } from 'react';
import IncidentQueue from '../components/IncidentQueue';
import IncidentDetail from '../components/IncidentDetail';
import LEINMap from '../components/LEINMap';
import api from '../services/api';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await api.get('/incidents');
        setIncidents(res.data);
        const { data: resp } = await api.get('/responders');
        setResponders(resp);
      } catch (err) {
        console.warn("Using mock dashboard data");
      }
    };
    fetchIncidents();
    const int = setInterval(fetchIncidents, 5000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (selectedIncident) {
      setLoadingHospitals(true);
      api.get(`/hospitals/nearby?lat=${selectedIncident.lat}&lng=${selectedIncident.lng}`)
        .then(res => setHospitals(res.data))
        .catch(() => setHospitals([]))
        .finally(() => setLoadingHospitals(false));
    }
  }, [selectedIncident]);

  const handleResolve = async (id) => {
    try {
      await api.post(`/resolve/${id}`);
      setIncidents(prev => prev.filter(i => i.id !== id));
      if (selectedIncident?.id === id) setSelectedIncident(null);
    } catch {
      setIncidents(prev => prev.filter(i => i.id !== id));
      if (selectedIncident?.id === id) setSelectedIncident(null);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="panel-left">
        <div className="panel-header">
          <span className="panel-title">LIVE INCIDENT FEED</span>
          <span className="badge safe">● ACTIVE</span>
        </div>
        <div className="panel-content" style={{ padding: 0 }}>
          <IncidentQueue
            incidents={incidents}
            selectedIncident={selectedIncident}
            setSelectedIncident={setSelectedIncident}
          />
        </div>
      </div>

      <div className="panel-center">
        <LEINMap
          incidents={incidents}
          hospitals={hospitals}
          responders={responders}
          setSelectedIncident={setSelectedIncident}
        />
      </div>

      <div className="panel-right">
        <div className="panel-header">
          <span className="panel-title">AI RECOMMENDATION ENGINE</span>
        </div>
        <div className="panel-content">
          <IncidentDetail
            incident={selectedIncident}
            hospitals={hospitals}
            loadingHospitals={loadingHospitals}
            onResolve={handleResolve}
            responders={responders}
          />
        </div>
      </div>
    </div>
  );
}
