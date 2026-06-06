import { useState, useEffect } from 'react';
import IncidentQueue from '../components/IncidentQueue';
import LEINMap from '../components/LEINMap';
import IncidentDetail from '../components/IncidentDetail';
import { mockIncidents, mockHospitals, mockResponders } from '../data/mockData';
import api from '../services/api';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [responders, setResponders] = useState(mockResponders);

  // Poll for incidents
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await api.get('/incidents');
        setIncidents(res.data);
      } catch {
        // Keep existing data on fail
      }
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  // Fetch hospitals when incident selected
  useEffect(() => {
    if (!selectedIncident) {
      setHospitals([]);
      return;
    }
    const fetchHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const res = await api.get(`/hospitals/nearby?lat=${selectedIncident.lat}&lng=${selectedIncident.lng}`);
        setHospitals(res.data);
      } catch {
        setHospitals(mockHospitals);
      } finally {
        setLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, [selectedIncident]);

  const handleResolve = async (id) => {
    try {
      await api.post('/resolve', { incident_id: id });
    } catch {
      // Ignore API fail in mock mode
    }
    setIncidents(prev => prev.filter(i => i.id !== id));
    if (selectedIncident?.id === id) {
      setSelectedIncident(null);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-left">
        <IncidentQueue 
          incidents={incidents.sort((a,b) => b.priority_score - a.priority_score)} 
          selectedIncident={selectedIncident}
          setSelectedIncident={setSelectedIncident}
        />
      </div>
      <div className="dashboard-center">
        <LEINMap 
          incidents={incidents}
          hospitals={hospitals.length > 0 ? hospitals : mockHospitals}
          responders={responders}
          selectedIncident={selectedIncident}
          setSelectedIncident={setSelectedIncident}
        />
      </div>
      <div className="dashboard-right">
        <IncidentDetail 
          incident={selectedIncident}
          hospitals={hospitals}
          loadingHospitals={loadingHospitals}
          onResolve={handleResolve}
        />
      </div>
    </div>
  );
}
