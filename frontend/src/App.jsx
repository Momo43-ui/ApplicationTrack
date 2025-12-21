import { useState, useEffect } from 'react';
import AddJobForm from './components/AddJobForm';
import JobTracker from './components/JobTracker';
import JobConsultation from './pages/JobConsultation';
import Auth from './components/Auth';
import { getCandidatures, createCandidature, updateCandidatureEtat } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les candidatures depuis l'API au démarrage
  useEffect(() => {
    if (user) {
      loadCandidatures();
    }
  }, [user]);

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const data = await getCandidatures(user.id);
      setJobs(data);
    } catch (err) {
      setError('Erreur lors du chargement des candidatures');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setJobs([]);
  };

  const handleAddJob = async (newJobData) => {
    try {
      const response = await createCandidature(user.id, newJobData);
      setJobs(prevJobs => [...prevJobs, response.candidature]);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la candidature');
      console.error(err);
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      await updateCandidatureEtat(jobId, newStatus);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, etat: newStatus } 
          : job
        )
      );
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error(err);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setCurrentPage('consultation');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedJob(null);
  };

  // Si non connecté, afficher la page de connexion
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const etats = {
    en_attente: { label: 'En attente', color: 'bg-gray-200 text-gray-800' },
    refus_etude: { label: 'Refus après études', color: 'bg-red-200 text-red-800' },
    entretien_passe: { label: 'Entretien passé', color: 'bg-blue-200 text-blue-800' },
    sans_reponse: { label: 'Sans réponse', color: 'bg-yellow-200 text-yellow-800' },
    accepte: { label: 'Accepté', color: 'bg-green-200 text-green-800' },
    refuse_entretien: { label: 'Refusé après entretien', color: 'bg-red-300 text-red-900' },
    sans_reponse_entretien: { label: 'Sans réponse après entretien', color: 'bg-orange-200 text-orange-800' }
  };

  // Affichage de la page de consultation
  if (currentPage === 'consultation' && selectedJob) {
    return <JobConsultation job={selectedJob} onBack={handleBackToDashboard} etats={etats} />;
  }

  // Affichage du dashboard principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">
                📋 ApplicationTrack
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Bienvenue, {user.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Formulaire d'ajout */}
            <AddJobForm onAddJob={handleAddJob} />
            
            {/* Tableau de suivi */}
            <JobTracker 
              jobs={jobs} 
              onUpdateJobStatus={handleUpdateJobStatus}
              onViewJob={handleViewJob}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>ApplicationTrack © 2025 - Gérez vos candidatures efficacement</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
