import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import AddJobForm from './components/AddJobForm';
import JobTracker from './components/JobTracker';
import JobConsultation from './pages/JobConsultation';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdvancedFilters from './components/AdvancedFilters';
import ChatBot from './components/ChatBot';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import CalendarView from './components/CalendarView';
import MobileMenu from './components/MobileMenu';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Charger les candidatures depuis l'API au démarrage
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
    addToast('Vous êtes déconnecté', 'info');
  };

  const handleAddJob = async (newJobData) => {
    try {
      const response = await createCandidature(user.id, newJobData);
      setJobs(prevJobs => [...prevJobs, response.candidature]);
      loadStats();
      addToast('Candidature ajoutée avec succès !', 'success');
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
      addToast('Statut mis à jour !', 'success');
    } catch (err) {
      addToast('Erreur lors de la mise à jour du statut', 'error');
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

  // Si non connecté, afficher la page de connexion
  if (!user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Auth onLogin={handleLogin} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
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
    return (
      <div className={darkMode ? 'dark' : ''}>
        <JobConsultation job={selectedJob} onBack={handleBackToDashboard} etats={etats} userId={user.id} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Affichage des statistiques
  if (currentPage === 'stats') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
          <Header 
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
          <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
            <Dashboard userId={user.id} stats={stats} />
          </main>
          <Footer setCurrentPage={setCurrentPage} />
        </div>
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
          username={user.username}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Affichage du générateur de lettre de motivation
  if (currentPage === 'coverletter') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
          <Header 
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
          <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
            <CoverLetterGenerator />
          </main>
          <Footer setCurrentPage={setCurrentPage} />
        </div>
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
          username={user.username}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Affichage du calendrier
  if (currentPage === 'calendar') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
          <Header 
            user={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
          <CalendarView 
            jobs={jobs} 
            onViewJob={(job) => {
              setSelectedJob(job);
              setCurrentPage('consultation');
            }}
            onBack={() => setCurrentPage('dashboard')}
          />
          <Footer setCurrentPage={setCurrentPage} />
        </div>
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
          username={user.username}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // Affichage du dashboard principal
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        {/* Header */}
        <Header
          user={user}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">\n          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Formulaire d'ajout */}
              <AddJobForm onAddJob={handleAddJob} />
              
              {/* Filtres avancés */}
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

        {/* Footer - cachée sur mobile pour ne pas gêner le menu */}
        <Footer setCurrentPage={setCurrentPage} />
      </div>
      
      {/* Menu mobile */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        username={user.username}
      />
      
      {/* Chatbot AI */}
      <ChatBot user={user} candidatures={jobs} />
      
      {/* Scroll to top button */}
      <ScrollToTop />
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
