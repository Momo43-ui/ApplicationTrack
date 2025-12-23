import { useState } from 'react';
import { Calendar, Bell } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function JobConsultation({ job, onBack, etats }) {
  const [showCoverLetterForm, setShowCoverLetterForm] = useState(false);
  const [showRappelForm, setShowRappelForm] = useState(false);
  const [rappelDate, setRappelDate] = useState(job.rappel_date || '');
  const [rappelNote, setRappelNote] = useState(job.rappel_note || '');
  const [coverLetterData, setCoverLetterData] = useState({
    name: '',
    skills: '',
    experience: '',
    motivation: ''
  });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterData.name || !coverLetterData.skills) {
      setError('Veuillez remplir au moins votre nom et vos compétences clés');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/ai/cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company: job.entreprise,
          job_description: job.annonce,
          user_name: coverLetterData.name,
          key_skills: coverLetterData.skills,
          experience: coverLetterData.experience,
          motivation: coverLetterData.motivation
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedLetter(data.cover_letter);
      } else {
        setError(data.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    alert('Lettre copiée dans le presse-papier !');
  };

  const handleDownloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lettre_motivation_${job.entreprise.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveRappel = async () => {
    if (!rappelDate) {
      setError('Veuillez sélectionner une date de rappel');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/candidatures/${job.id}/rappel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rappel_date: rappelDate,
          rappel_note: rappelNote
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Rappel enregistré avec succès !');
        setShowRappelForm(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Erreur lors de l\'enregistrement du rappel');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de se connecter au serveur');
    }
  };

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
            {/* Messages de succès/erreur */}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                ✅ {successMessage}
              </div>
            )}

            {/* Boutons d'action en haut */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCoverLetterForm(!showCoverLetterForm)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                ✍️ Générer lettre de motivation
              </button>
              <button
                onClick={() => setShowRappelForm(!showRappelForm)}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                <Bell className="inline-block mr-2" size={20} />
                Planifier rappel
              </button>
              <button
                onClick={() => {/* TODO: Implémenter modification */}}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
                    // TODO: Implémenter suppression
                    onBack();
                  }
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
              >
                🗑️ Supprimer
              </button>
            </div>

            {/* Planificateur de rappel */}
            {showRappelForm && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-300 space-y-4">
                <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Bell size={24} />
                  Planifier une relance
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de rappel *
                  </label>
                  <input
                    type="date"
                    value={rappelDate}
                    onChange={(e) => setRappelDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note (optionnel)
                  </label>
                  <textarea
                    value={rappelNote}
                    onChange={(e) => setRappelNote(e.target.value)}
                    placeholder="Ex: Relancer le recruteur par email..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {error && !successMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveRappel}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    💾 Enregistrer le rappel
                  </button>
                  <button
                    onClick={() => setShowRappelForm(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    Annuler
                  </button>
                </div>

                {job.rappel_date && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                    <p className="text-sm text-gray-600">
                      📅 Rappel actuel : <strong>{new Date(job.rappel_date).toLocaleDateString('fr-FR')}</strong>
                      {job.rappel_note && (
                        <span className="block mt-1 text-gray-500">Note : {job.rappel_note}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Générateur de lettre de motivation (affiché en haut si activé) */}
            {showCoverLetterForm && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-300 space-y-4">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">
                  🤖 Générateur de Lettre de Motivation (IA)
                </h3>
                
                {!generatedLetter ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Votre nom complet *
                      </label>
                      <input
                        type="text"
                        value={coverLetterData.name}
                        onChange={(e) => setCoverLetterData({...coverLetterData, name: e.target.value})}
                        placeholder="Ex: Jean Dupont"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Compétences clés * (séparées par des virgules)
                      </label>
                      <input
                        type="text"
                        value={coverLetterData.skills}
                        onChange={(e) => setCoverLetterData({...coverLetterData, skills: e.target.value})}
                        placeholder="Ex: JavaScript, React, Node.js, Communication"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expérience pertinente (optionnel)
                      </label>
                      <textarea
                        value={coverLetterData.experience}
                        onChange={(e) => setCoverLetterData({...coverLetterData, experience: e.target.value})}
                        placeholder="Ex: 3 ans en tant que développeur full-stack..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Motivation (optionnel)
                      </label>
                      <textarea
                        value={coverLetterData.motivation}
                        onChange={(e) => setCoverLetterData({...coverLetterData, motivation: e.target.value})}
                        placeholder="Ex: Passionné par les nouvelles technologies..."
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleGenerateCoverLetter}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? '⏳ Génération en cours...' : '✨ Générer la lettre'}
                      </button>
                      <button
                        onClick={() => setShowCoverLetterForm(false)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border-2 border-indigo-300 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                        {generatedLetter}
                      </pre>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopyLetter}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                      >
                        📋 Copier
                      </button>
                      <button
                        onClick={handleDownloadLetter}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                      >
                        💾 Télécharger
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedLetter('');
                          setCoverLetterData({name: '', skills: '', experience: '', motivation: ''});
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        🔄 Nouvelle lettre
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
