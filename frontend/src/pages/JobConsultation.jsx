function JobConsultation({ job, onBack, etats }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors"
          >
            ← Retour au tableau
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-8">
            <h1 className="text-4xl font-bold mb-2">Consultation de l'annonce</h1>
            <p className="text-blue-100 text-lg">Détails complets de votre candidature</p>
          </div>
          
          {/* Contenu */}
          <div className="p-8 space-y-8">
            {/* Entreprise */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                🏢 Entreprise
              </h2>
              <p className="text-4xl font-bold text-gray-900">
                {job.entreprise}
              </p>
            </div>
            
            {/* Date de candidature */}
            <div className="border-l-4 border-green-500 pl-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                📅 Date de candidature
              </h2>
              <p className="text-2xl font-semibold text-gray-900">
                {new Date(job.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {/* Annonce complète */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                📄 Annonce / Description du poste
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                  {job.annonce}
                </p>
              </div>
            </div>
            
            {/* État actuel */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                🏷️ État de la candidature
              </h2>
              <span className={`inline-block px-6 py-3 rounded-lg text-lg font-bold ${etats[job.etat]?.color || 'bg-gray-200 text-gray-800'}`}>
                {etats[job.etat]?.label || job.etat}
              </span>
            </div>
            
            {/* Conseils pour l'entretien */}
            {(job.etat === 'entretien_passe' || job.etat === 'en_attente') && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                <h3 className="font-bold text-green-800 text-xl mb-3 flex items-center gap-2">
                  💡 Conseils de préparation
                </h3>
                <ul className="text-base text-green-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Relisez attentivement l'annonce ci-dessus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Préparez des exemples concrets de votre expérience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Recherchez plus d'informations sur {job.entreprise}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Notez vos questions à poser au recruteur</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Footer avec bouton retour */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl text-lg"
            >
              ← Retour au tableau de suivi
            </button>
          </div>
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

export default JobConsultation;
