import { useState } from 'react';

function JobTracker({ jobs, onUpdateJobStatus, onViewJob }) {
  const [selectedJob, setSelectedJob] = useState(null);

  const etats = {
    en_attente: { label: 'En attente', color: 'bg-gray-200 text-gray-800 animate-pulse' },
    refus_etude: { label: 'Refus après études', color: 'bg-red-200 text-red-800' },
    entretien_passe: { label: 'Entretien passé', color: 'bg-blue-200 text-blue-800 animate-pulse' },
    sans_reponse: { label: 'Sans réponse', color: 'bg-yellow-200 text-yellow-800' },
    accepte: { label: 'Accepté', color: 'bg-green-200 text-green-800 shadow-lg' },
    refuse_entretien: { label: 'Refusé après entretien', color: 'bg-red-300 text-red-900' },
    sans_reponse_entretien: { label: 'Sans réponse après entretien', color: 'bg-orange-200 text-orange-800' }
  };

  const handleStatusChange = (jobId, newStatus) => {
    onUpdateJobStatus(jobId, newStatus);
    setSelectedJob(null);
  };

  const getNextStates = (currentState) => {
    switch (currentState) {
      case 'en_attente':
        return ['refus_etude', 'entretien_passe', 'sans_reponse'];
      case 'entretien_passe':
        return ['accepte', 'refuse_entretien', 'sans_reponse_entretien'];
      default:
        return [];
    }
  };

  return (
    <div className="animate-fadeIn bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">Suivi de mes candidatures</h2>
      
      {jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Aucune candidature enregistrée</p>
          <p className="text-sm mt-2">Ajoutez votre première annonce ci-dessus</p>
        </div>
      ) : (
        <>
          {/* Vue tableau pour desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Annonce
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    État
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Consulter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.entreprise}</div>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[12rem]" title="Cliquez sur 'Voir détails' pour lire l'annonce complète">
                        {job.annonce.substring(0, 40)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{job.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${etats[job.etat]?.color || 'bg-gray-200 text-gray-800'}`}>
                        {etats[job.etat]?.label || job.etat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => onViewJob(job)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                        title="Voir les détails de l'annonce"
                      >
                        👁️ Voir détails
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getNextStates(job.etat).length > 0 ? (
                        <div className="relative">
                          <button
                            onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                            className="group inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-300 dark:border-blue-700 rounded-lg hover:shadow-md transition-all duration-200"
                          >
                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Mettre à jour</span>
                            <svg className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform ${selectedJob === job.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {selectedJob === job.id && (
                            <div className="absolute z-20 mt-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[240px] animate-fade-in">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Nouveau statut</p>
                              </div>
                              <div className="space-y-2">
                                {getNextStates(job.etat).map((state) => (
                                  <button
                                    key={state}
                                    onClick={() => handleStatusChange(job.id, state)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg ${etats[state]?.color} hover:scale-105 hover:shadow-md transition-all duration-200 font-medium text-sm`}
                                  >
                                    {etats[state]?.label}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => setSelectedJob(null)}
                                className="mt-3 w-full text-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                ✕ Annuler
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Terminé</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue cartes pour mobile */}
          <div className="md:hidden space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="card-hover bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{job.entreprise}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📅 {job.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${etats[job.etat]?.color || 'bg-gray-200 text-gray-800'}`}>
                    {etats[job.etat]?.label || job.etat}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {job.annonce}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewJob(job)}
                    className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  >
                    👁️ Voir détails
                  </button>

                  {getNextStates(job.etat).length > 0 && (
                    <button
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <span>Mettre à jour</span>
                      <svg className={`w-4 h-4 transition-transform ${selectedJob === job.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {selectedJob === job.id && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                        Choisir le nouveau statut
                      </p>
                    </div>
                    <div className="space-y-2">
                      {getNextStates(job.etat).map((state) => (
                        <button
                          key={state}
                          onClick={() => handleStatusChange(job.id, state)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold ${etats[state]?.color} hover:scale-105 hover:shadow-md transition-all duration-200`}
                        >
                          {etats[state]?.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="mt-3 w-full text-center py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      ✕ Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Statistiques */}
      {jobs.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{jobs.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total candidatures</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {jobs.filter(j => j.etat === 'accepte').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Acceptées</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {jobs.filter(j => j.etat === 'en_attente' || j.etat === 'entretien_passe').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">En cours</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {jobs.filter(j => j.etat === 'refus_etude' || j.etat === 'refuse_entretien').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Refusées</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobTracker;