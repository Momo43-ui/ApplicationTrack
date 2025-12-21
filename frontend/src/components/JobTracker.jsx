import { useState } from 'react';

function JobTracker({ jobs, onUpdateJobStatus, onViewJob }) {
  const [selectedJob, setSelectedJob] = useState(null);

  const etats = {
    en_attente: { label: 'En attente', color: 'bg-gray-200 text-gray-800' },
    refus_etude: { label: 'Refus après études', color: 'bg-red-200 text-red-800' },
    entretien_passe: { label: 'Entretien passé', color: 'bg-blue-200 text-blue-800' },
    sans_reponse: { label: 'Sans réponse', color: 'bg-yellow-200 text-yellow-800' },
    accepte: { label: 'Accepté', color: 'bg-green-200 text-green-800' },
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Suivi de mes candidatures</h2>
      
      {jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Aucune candidature enregistrée</p>
          <p className="text-sm mt-2">Ajoutez votre première annonce ci-dessus</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  État
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consulter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.entreprise}</div>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="text-sm text-gray-500 truncate max-w-[12rem]" title="Cliquez sur 'Voir détails' pour lire l'annonce complète">
                      {job.annonce.substring(0, 40)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{job.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${etats[job.etat]?.color || 'bg-gray-200 text-gray-800'}`}>
                      {etats[job.etat]?.label || job.etat}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onViewJob(job)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                      title="Voir les détails de l'annonce"
                    >
                      👁️ Voir détails
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getNextStates(job.etat).length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Changer l'état
                        </button>
                        
                        {selectedJob === job.id && (
                          <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">Réponse après {job.etat === 'en_attente' ? 'études' : 'entretien'} :</p>
                            <div className="space-y-2">
                              {getNextStates(job.etat).map((state) => (
                                <button
                                  key={state}
                                  onClick={() => handleStatusChange(job.id, state)}
                                  className={`w-full text-left px-3 py-2 rounded ${etats[state]?.color} hover:opacity-80 transition-opacity`}
                                >
                                  {etats[state]?.label}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setSelectedJob(null)}
                              className="mt-2 w-full text-center text-xs text-gray-500 hover:text-gray-700"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {getNextStates(job.etat).length === 0 && (
                      <span className="text-gray-400 italic">État final</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistiques */}
      {jobs.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">{jobs.length}</p>
            <p className="text-sm text-gray-500">Total candidatures</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-700">
              {jobs.filter(j => j.etat === 'accepte').length}
            </p>
            <p className="text-sm text-gray-500">Acceptées</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">
              {jobs.filter(j => j.etat === 'en_attente' || j.etat === 'entretien_passe').length}
            </p>
            <p className="text-sm text-gray-500">En cours</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-red-700">
              {jobs.filter(j => j.etat === 'refus_etude' || j.etat === 'refuse_entretien').length}
            </p>
            <p className="text-sm text-gray-500">Refusées</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobTracker;