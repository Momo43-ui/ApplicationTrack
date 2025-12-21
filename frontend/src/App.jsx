import { useState, useEffect } from 'react';
import AddJobForm from './components/AddJobForm';
import JobTracker from './components/JobTracker';
import JobConsultation from './pages/JobConsultation';
import './App.css';

function App() {
  const [jobs, setJobs] = useState(() => {
    // Charger les candidatures depuis localStorage au démarrage
    const savedJobs = localStorage.getItem('applicationTrack_jobs');
    return savedJobs ? JSON.parse(savedJobs) : [];
  });

  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' ou 'consultation'
  const [selectedJob, setSelectedJob] = useState(null);

  // Sauvegarder les candidatures dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('applicationTrack_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const handleAddJob = (newJob) => {
    setJobs(prevJobs => [...prevJobs, newJob]);
  };

  const handleUpdateJobStatus = (jobId, newStatus) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, etat: newStatus } 
          : job
      )
    );
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setCurrentPage('consultation');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedJob(null);
  };

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
            <h1 className="text-3xl font-bold text-blue-600">
              📋 ApplicationTrack
            </h1>
            <div className="text-sm text-gray-500">
              Suivi de candidatures
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
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
