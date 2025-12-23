import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react'';
import AddJobForm from './components/AddJobForm';
import JobTracker from './components/JobTracker';
import JobConsultation from './pages/JobConsultation';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdvancedFilters from './components/AdvancedFilters';
import { ToastContainer, useToast } from './components/Toast';
import { getCandidatures, createCandidature, updateCandidatureEtat, getStats } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    etat: '',
    date_debut: '',
    date_fin: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const { toasts, addToast, removeToast } = useToast();

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Charger les candidatures depuis l'API au dÃ©marrage
  useEffect(() => {
    if (user) {
      loadCandidatures();
      loadStats();
    }
  }, [user, filters]);

  const loadCandidatures = async () => {
    try {
      setLoading(true);
      const data = await getCandidatures(user.id, filters);
      setJobs(data);
    } catch (err) {
      addToast('Erreur lors du chargement des candidatures', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getStats(user.id);
      setStats(data);
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    addToast(`Bienvenue ${userData.username} !`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setJobs([]);
    setStats(null);
    addToast('Vous Ãªtes dÃ©connectÃ©', 'info');
  };

  const handleAddJob = async (newJobData) => {
    try {
      const response = await createCandidature(user.id, newJobData);
      setJobs(prevJobs => [...prevJobs, response.candidature]);
      loadStats();
      addToast('Candidature ajoutÃ©e avec succÃ¨s !', 'success');
    } catch (err) {
      addToast('Erreur lors de l\'ajout de la candidature', 'error');
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
      loadStats();
      addToast('Statut mis Ã  jour !', 'success');
    } catch (err) {
      addToast('Erreur lors de la mise Ã  jour du statut', 'error');
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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Si non connectÃ©, afficher la page de connexion
  if (!user) {
    return (
      <>
        <Auth onLogin={handleLogin} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  const etats = {
    en_attente: { label: 'En attente', color: 'bg-gray-200 text-gray-800' },
    refus_etude: { label: 'Refus aprÃ¨s Ã©tudes', color: 'bg-red-200 text-red-800' },
    entretien_passe: { label: 'Entretien passÃ©', color: 'bg-blue-200 text-blue-800' },
    sans_reponse: { label: 'Sans rÃ©ponse', color: 'bg-yellow-200 text-yellow-800' },
    accepte: { label: 'AcceptÃ©', color: 'bg-green-200 text-green-800' },
    refuse_entretien: { label: 'RefusÃ© aprÃ¨s entretien', color: 'bg-red-300 text-red-900' },
    sans_reponse_entretien: { label: 'Sans rÃ©ponse aprÃ¨s entretien', color: 'bg-orange-200 text-orange-800' }
  };

  // Affichage de la page de consultation
  if (currentPage === 'consultation' && selectedJob) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <JobConsultation job={selectedJob} onBack={handleBackToDashboard} etats={etats} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Affichage des statistiques
  if (currentPage === 'stats') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-blue-600">
                    ðŸ“Š Statistiques
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300:bg-gray-600 transition-colors"
                  >
                    {darkMode ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-gray-700" size={24} />}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    DÃ©connexion
                  </button>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Dashboard userId={user.id} stats={stats} />
          </main>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Affichage du dashboard principal
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-600">
                  ðŸ“‹ ApplicationTrack
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Bienvenue, {user.username}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage('stats')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  ðŸ“Š Statistiques
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300:bg-gray-600 transition-colors"
                  title={darkMode ? 'Mode clair' : 'Mode sombre'}
                >
                  {darkMode ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-gray-700" size={24} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  DÃ©connexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Formulaire d'ajout */}
              <AddJobForm onAddJob={handleAddJob} />
              
              {/* Filtres avancÃ©s */}
              <AdvancedFilters onFilterChange={handleFilterChange} currentFilters={filters} />
              
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
            <p>ApplicationTrack Â© 2025 - GÃ©rez vos candidatures efficacement</p>
          </div>
        </footer>
      </div>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
