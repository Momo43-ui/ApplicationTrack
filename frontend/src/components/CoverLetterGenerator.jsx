import { useState, useEffect } from 'react';
import { FileText, Sparkles, Download, Copy, Check, Loader, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CoverLetterGenerator({ candidature, user, onClose }) {
  const [userProfile, setUserProfile] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: user?.telephone || '',
    ville: user?.ville || '',
    experience: '',
    skills: '',
    motivation: ''
  });
  
  const [provider, setProvider] = useState('openai');
  const [availableProviders, setAvailableProviders] = useState({
    openai: false,
    anthropic: false,
    gemini: false
  });
  
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkProviders();
  }, []);

  const checkProviders = async () => {
    try {
      const response = await fetch(`${API_URL}/ai/check-config`);
      const data = await response.json();
      setAvailableProviders(data);
      
      // Sélectionner le premier provider disponible
      if (data.openai) setProvider('openai');
      else if (data.anthropic) setProvider('anthropic');
      else if (data.gemini) setProvider('gemini');
    } catch (error) {
      console.error('Erreur lors de la vérification des providers:', error);
    }
  };

  const handleGenerate = async () => {
    if (!userProfile.name || !userProfile.experience || !userProfile.skills) {
      setError('Veuillez remplir au minimum votre nom, expérience et compétences.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedLetter('');

    try {
      const response = await fetch(`${API_URL}/ai/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidature_id: candidature.id,
          user_profile: userProfile,
          provider: provider
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedLetter(data.letter);
      } else {
        setError(data.error || 'Erreur lors de la génération de la lettre.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lettre_motivation_${candidature.entreprise.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const providerNames = {
    openai: 'OpenAI (ChatGPT)',
    anthropic: 'Anthropic (Claude)',
    gemini: 'Google (Gemini)'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Générateur de lettre de motivation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Candidature : {candidature.entreprise}
            </h3>
            <p className="text-sm text-gray-700 line-clamp-2">
              {candidature.annonce}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Vos informations
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  value={userProfile.ville}
                  onChange={(e) => setUserProfile({ ...userProfile, ville: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paris, France"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Profil professionnel
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expérience *
                </label>
                <textarea
                  value={userProfile.experience}
                  onChange={(e) => setUserProfile({ ...userProfile, experience: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 3 ans d'expérience en développement web..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compétences principales *
                </label>
                <textarea
                  value={userProfile.skills}
                  onChange={(e) => setUserProfile({ ...userProfile, skills: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: React, Node.js, Python, SQL..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivation
                </label>
                <textarea
                  value={userProfile.motivation}
                  onChange={(e) => setUserProfile({ ...userProfile, motivation: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pourquoi cette entreprise/poste vous intéresse..."
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moteur IA
            </label>
            <div className="flex gap-3">
              {Object.entries(availableProviders).map(([key, available]) => (
                <button
                  key={key}
                  onClick={() => setProvider(key)}
                  disabled={!available}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${provider === key
                      ? 'bg-blue-600 text-white'
                      : available
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {providerNames[key]}
                  {!available && ' 🔒'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2
              ${loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
              transition-colors
            `}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer la lettre de motivation
              </>
            )}
          </button>

          {generatedLetter && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">
                  📝 Lettre générée
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copier
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {generatedLetter}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
