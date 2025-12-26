import { useState, useEffect } from 'react';
import { Calendar, Bell, Sparkles, Target, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function JobConsultation({ job, onBack, etats, userId }) {
  const [showCoverLetterForm, setShowCoverLetterForm] = useState(false);
  const [showRappelForm, setShowRappelForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMatchingAnalysis, setShowMatchingAnalysis] = useState(false);
  const [matchingData, setMatchingData] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [editData, setEditData] = useState({
    entreprise: job.entreprise || '',
    annonce: job.annonce || '',
    salaire: job.salaire || '',
    localisation: job.localisation || '',
    notes: job.notes || ''
  });
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

  // Charger le score de matching au chargement
  useEffect(() => {
    console.log('[JobConsultation] useEffect - job.id:', job.id, 'userId:', userId);
    if (job.id && userId && showMatchingAnalysis) {
      console.log('[JobConsultation] Conditions remplies, appel loadMatchingScore');
      loadMatchingScore();
    } else {
      console.log('[JobConsultation] Conditions non remplies pour loadMatchingScore');
    }
  }, [job.id, userId, showMatchingAnalysis]);

  const loadMatchingScore = async () => {
    setMatchingLoading(true);
    setError('');
    try {
      console.log('[Matching Score] Envoi requête pour job:', job.id, 'user:', userId);
      
      const response = await fetch(`${API_URL}/ai/matching-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidature_id: job.id,
          user_id: userId,
          experience: '3 ans',  // À adapter depuis le profil user
          competences: 'React, Node.js, Python'  // À adapter
        })
      });

      console.log('[Matching Score] Statut réponse:', response.status);
      const data = await response.json();
      console.log('[Matching Score] Données reçues:', data);
      
      if (data.success && data.analysis) {
        setMatchingData(data.analysis);
        console.log('[Matching Score] Score chargé avec succès:', data.analysis);
      } else {
        console.error('[Matching Score] Erreur dans la réponse:', data.error);
        setError(data.error || 'Erreur lors du calcul du score de matching');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('[Matching Score] Exception:', error);
      setError('Impossible de calculer le score de matching. Vérifiez votre connexion.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterData.name || !coverLetterData.skills) {
      setError('Veuillez remplir au moins votre nom et vos compétences clés');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/ai/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidature_id: job.id,
          user_profile: {
            name: coverLetterData.name,
            skills: coverLetterData.skills,
            experience: coverLetterData.experience,
            motivation: coverLetterData.motivation
          },
          provider: 'gemini' // Utilise Gemini par défaut
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedLetter(data.letter);
        setSuccessMessage('Lettre générée avec succès !');
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

  const handleSaveEdit = async () => {
    if (!editData.entreprise || !editData.annonce) {
      setError('Le nom de l\'entreprise et l\'annonce sont obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/candidatures/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();

      if (response.ok && data.message) {
        setSuccessMessage('Candidature modifiée avec succès !');
        setShowEditForm(false);
        setTimeout(() => {
          setSuccessMessage('');
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-lg transition-colors"
          >
            ← Retour au tableau
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Consultation de l'annonce</h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Détails complets de votre candidature</p>
          </div>
          
          {/* Contenu */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Messages de succès/erreur */}
            {successMessage && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                ✅ {successMessage}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowMatchingAnalysis(!showMatchingAnalysis)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <Target size={18} />
                <span className="text-sm font-medium hidden sm:inline">Score matching</span>
                <span className="text-sm font-medium sm:hidden">Score</span>
              </button>
              
              <button
                onClick={() => setShowCoverLetterForm(!showCoverLetterForm)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <span className="text-lg leading-none">✍️</span>
                <span className="text-sm font-medium hidden sm:inline">Générer lettre</span>
                <span className="text-sm font-medium sm:hidden">Lettre</span>
              </button>
              
              <button
                onClick={() => setShowRappelForm(!showRappelForm)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <Bell size={18} />
                <span className="text-sm font-medium hidden sm:inline">Planifier rappel</span>
                <span className="text-sm font-medium sm:hidden">Rappel</span>
              </button>
              
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <span className="text-lg leading-none">✏️</span>
                <span className="text-sm font-medium">Modifier</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <span className="text-lg leading-none">🗑️</span>
                <span className="text-sm font-medium">Supprimer</span>
              </button>
            </div>

            {/* Score de matching AI */}
            {showMatchingAnalysis && (
              <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                  <Target size={28} />
                  Analyse de Matching AI
                </h3>
                
                {matchingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Sparkles className="animate-spin text-green-600 dark:text-green-400" size={40} />
                    <span className="ml-3 text-lg text-green-700 dark:text-green-300">Analyse en cours...</span>
                  </div>
                ) : matchingData ? (
                  <div className="space-y-6">
                    {/* Score global */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
                      <div className="text-6xl font-bold mb-2" style={{
                        color: matchingData.score >= 70 ? '#10b981' : matchingData.score >= 50 ? '#f59e0b' : '#ef4444'
                      }}>
                        {matchingData.score}%
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                        <TrendingUp size={20} />
                        <span className="font-medium">Score de compatibilité</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4">
                        <div 
                          className="h-3 rounded-full transition-all" 
                          style={{
                            width: `${matchingData.score}%`,
                            backgroundColor: matchingData.score >= 70 ? '#10b981' : matchingData.score >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Points forts */}
                    <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-600 dark:border-green-500 rounded-lg p-5">
                      <h4 className="font-bold text-green-900 dark:text-green-300 text-lg mb-3">💪 Points Forts</h4>
                      <ul className="space-y-2">
                        {matchingData.points_forts?.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-green-800 dark:text-green-300">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Points faibles */}
                    {matchingData.points_faibles?.length > 0 && (
                      <div className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-600 dark:border-orange-500 rounded-lg p-5">
                        <h4 className="font-bold text-orange-900 dark:text-orange-300 text-lg mb-3">⚠️ Points d'Attention</h4>
                        <ul className="space-y-2">
                          {matchingData.points_faibles.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-orange-800 dark:text-orange-300">
                              <span className="text-orange-600 font-bold">⚡</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Conseils AI */}
                    <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-500 rounded-lg p-5">
                      <h4 className="font-bold text-blue-900 dark:text-blue-300 text-lg mb-3 flex items-center gap-2">
                        <Sparkles size={20} />
                        Conseils Personnalisés
                      </h4>
                      <ul className="space-y-3">
                        {matchingData.conseils?.map((conseil, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-blue-800 dark:text-blue-300">
                            <span className="text-blue-600 font-bold">💡</span>
                            <span>{conseil}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={loadMatchingScore}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={20} />
                      Recalculer le score
                    </button>
                  </div>
                ) : error ? (
                  <div className="text-center py-6">
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
                      ❌ {error}
                    </div>
                    <button
                      onClick={loadMatchingScore}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold rounded-lg transition-all inline-flex items-center gap-2"
                    >
                      <Sparkles size={20} />
                      Réessayer
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <Sparkles className="text-green-600 dark:text-green-400" size={32} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Aucune analyse disponible</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Cliquez ci-dessous pour analyser votre compatibilité avec ce poste</p>
                    </div>
                    <button
                      onClick={loadMatchingScore}
                      disabled={matchingLoading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all inline-flex items-center gap-2"
                    >
                      {matchingLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Analyse en cours...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          <span>Lancer l'analyse</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Confirmation compacte de suppression */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-5 animate-scale-in">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Supprimer ?</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Candidature <strong>{job.entreprise}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implémenter suppression API
                        setShowDeleteConfirm(false);
                        onBack();
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Planificateur de rappel */}
            {showRappelForm && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border-2 border-orange-300 dark:border-orange-700 space-y-4">
                <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">
                  <Bell size={24} />
                  Planifier une relance
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date de rappel *
                  </label>
                  <input
                    type="date"
                    value={rappelDate}
                    onChange={(e) => setRappelDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Note (optionnel)
                  </label>
                  <textarea
                    value={rappelNote}
                    onChange={(e) => setRappelNote(e.target.value)}
                    placeholder="Ex: Relancer le recruteur par email..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {error && !successMessage && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
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
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    Annuler
                  </button>
                </div>

                {job.rappel_date && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📅 Rappel actuel : <strong>{new Date(job.rappel_date).toLocaleDateString('fr-FR')}</strong>
                      {job.rappel_note && (
                        <span className="block mt-1 text-gray-500 dark:text-gray-400">Note : {job.rappel_note}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Formulaire de modification */}
            {showEditForm && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700 space-y-4">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">
                  ✏️ Modifier la candidature
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    value={editData.entreprise}
                    onChange={(e) => setEditData({...editData, entreprise: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Annonce *
                  </label>
                  <textarea
                    value={editData.annonce}
                    onChange={(e) => setEditData({...editData, annonce: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      💰 Salaire
                    </label>
                    <input
                      type="text"
                      value={editData.salaire}
                      onChange={(e) => setEditData({...editData, salaire: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      📍 Localisation
                    </label>
                    <input
                      type="text"
                      value={editData.localisation}
                      onChange={(e) => setEditData({...editData, localisation: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:bg-gray-400"
                  >
                    {loading ? 'Enregistrement...' : '💾 Enregistrer'}
                  </button>
                </div>
              </div>
            )}

            {/* Générateur de lettre de motivation (affiché en haut si activé) */}
            {showCoverLetterForm && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 space-y-4">
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4">
                  🤖 Générateur de Lettre de Motivation (IA)
                </h3>
                
                {!generatedLetter ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Votre nom complet *
                      </label>
                      <input
                        type="text"
                        value={coverLetterData.name}
                        onChange={(e) => setCoverLetterData({...coverLetterData, name: e.target.value})}
                        placeholder="Ex: Jean Dupont"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Compétences clés * (séparées par des virgules)
                      </label>
                      <input
                        type="text"
                        value={coverLetterData.skills}
                        onChange={(e) => setCoverLetterData({...coverLetterData, skills: e.target.value})}
                        placeholder="Ex: JavaScript, React, Node.js, Communication"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Expérience pertinente (optionnel)
                      </label>
                      <textarea
                        value={coverLetterData.experience}
                        onChange={(e) => setCoverLetterData({...coverLetterData, experience: e.target.value})}
                        placeholder="Ex: 3 ans en tant que développeur full-stack..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Motivation (optionnel)
                      </label>
                      <textarea
                        value={coverLetterData.motivation}
                        onChange={(e) => setCoverLetterData({...coverLetterData, motivation: e.target.value})}
                        placeholder="Ex: Passionné par les nouvelles technologies..."
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
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
                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-sans leading-relaxed">
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
                        className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
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
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                🏢 Entreprise
              </h2>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {job.entreprise}
              </p>
            </div>
            
            {/* Date de candidature */}
            <div className="border-l-4 border-green-500 pl-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                📅 Date de candidature
              </h2>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
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
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                📄 Annonce / Description du poste
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                  {job.annonce}
                </p>
              </div>
            </div>
            
            {/* État actuel */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                🏷️ État de la candidature
              </h2>
              <span className={`inline-block px-6 py-3 rounded-lg text-lg font-bold ${etats[job.etat]?.color || 'bg-gray-200 text-gray-800'}`}>
                {etats[job.etat]?.label || job.etat}
              </span>
            </div>
            
            {/* Conseils pour l'entretien */}
            {(job.etat === 'entretien_passe' || job.etat === 'en_attente') && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-6">
                <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-3 flex items-center gap-2">
                  💡 Conseils de préparation
                </h3>
                <ul className="text-base text-green-700 dark:text-green-300 space-y-2">
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
          <div className="bg-gray-50 dark:bg-gray-900 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
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
      <footer className="bg-white dark:bg-gray-800 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>ApplicationTrack © 2025 - Gérez vos candidatures efficacement</p>
        </div>
      </footer>
    </div>
  );
}

export default JobConsultation;
