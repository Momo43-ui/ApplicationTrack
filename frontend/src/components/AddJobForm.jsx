import { useState } from 'react';
import { X, Plus, Tag, User, Mail, Phone, Sparkles, Loader, Link as LinkIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AddJobForm({ onAddJob }) {
  const [formData, setFormData] = useState({
    entreprise: '',
    annonce: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    salaire: '',
    localisation: '',
    tags: [],
    recruteur_nom: '',
    recruteur_email: '',
    recruteur_telephone: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [notification, setNotification] = useState('');
  const [showRecruteurSection, setShowRecruteurSection] = useState(false);
  const [showAIParser, setShowAIParser] = useState(false);
  const [aiParseText, setAIParseText] = useState('');
  const [aiParseUrl, setAIParseUrl] = useState('');
  const [parseMode, setParseMode] = useState('text'); // 'text' ou 'url'
  const [parsingLoading, setParsingLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.entreprise || !formData.annonce) {
      setNotification('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Générer un ID auto-incrémenté
    const newJob = {
      id: Date.now(),
      ...formData,
      etat: 'en_attente'
    };

    onAddJob(newJob);
    
    setNotification('Annonce ajoutée avec succès ✓');
    
    // Réinitialiser le formulaire
    setFormData({
      entreprise: '',
      annonce: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      salaire: '',
      localisation: '',
      tags: [],
      recruteur_nom: '',
      recruteur_email: '',
      recruteur_telephone: ''
    });
    setShowRecruteurSection(false);

    // Effacer la notification après 3 secondes
    setTimeout(() => setNotification(''), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAIParse = async () => {
    // Validation selon le mode
    if (parseMode === 'text' && !aiParseText.trim()) {
      setNotification('Collez le texte de l\'annonce à parser');
      return;
    }
    if (parseMode === 'url' && !aiParseUrl.trim()) {
      setNotification('Entrez l\'URL de l\'annonce à parser');
      return;
    }

    setParsingLoading(true);
    console.log('[AI Parse Frontend] Démarrage du parsing...');
    console.log('[AI Parse Frontend] Mode:', parseMode);
    
    try {
      console.log('[AI Parse Frontend] URL:', `${API_URL}/ai/parse-announcement`);
      const response = await fetch(`${API_URL}/ai/parse-announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: parseMode === 'text' ? aiParseText : '',
          url: parseMode === 'url' ? aiParseUrl : null
        })
      });

      console.log('[AI Parse Frontend] Status:', response.status);
      const result = await response.json();
      console.log('[AI Parse Frontend] Résultat:', result);

      if (result.success && result.data) {
        const parsed = result.data;
        console.log('[AI Parse Frontend] Données parsées:', parsed);
        
        // Remplir automatiquement le formulaire
        setFormData(prev => ({
          ...prev,
          entreprise: parsed.entreprise || prev.entreprise,
          annonce: parsed.description_courte || (parseMode === 'text' ? aiParseText : prev.annonce),
          salaire: parsed.salaire || prev.salaire,
          localisation: parsed.localisation || prev.localisation,
          tags: parsed.type_contrat ? [parsed.type_contrat, ...prev.tags] : prev.tags
        }));

        setNotification('✨ Annonce parsée avec succès !');
        setShowAIParser(false);
        setAIParseText('');
        setAIParseUrl('');
      } else {
        console.error('[AI Parse Frontend] Échec:', result.error);
        setNotification('❌ Erreur lors du parsing : ' + (result.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('[AI Parse Frontend] Exception:', error);
      setNotification('❌ Impossible de se connecter au serveur: ' + error.message);
    } finally {
      setParsingLoading(false);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  return (
    <div className="animate-fadeIn bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">Ajouter une annonce</h2>
        <button
          type="button"
          onClick={() => setShowAIParser(!showAIParser)}
          className="btn-gradient flex items-center gap-2 shadow-lg text-sm sm:text-base px-3 sm:px-4 py-2 w-full sm:w-auto justify-center"
        >
          <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
          {showAIParser ? 'Fermer AI Parser' : '✨ Parser avec AI'}
        </button>
      </div>

      {/* AI Parser Section */}
      {showAIParser && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg">
          <h3 className="text-base sm:text-lg font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
            <Sparkles size={18} className="sm:w-5 sm:h-5" />
            Parser automatiquement une annonce
          </h3>
          
          {/* Tabs pour choisir le mode */}
          <div className="flex gap-2 mb-3 sm:mb-4">
            <button
              type="button"
              onClick={() => setParseMode('text')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all ${
                parseMode === 'text'
                  ? 'bg-purple-600 dark:bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600'
              }`}
            >
              📝 Texte
            </button>
            <button
              type="button"
              onClick={() => setParseMode('url')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                parseMode === 'url'
                  ? 'bg-purple-600 dark:bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600'
              }`}
            >
              <LinkIcon size={14} className="sm:w-4 sm:h-4" />
              URL
            </button>
          </div>

          {parseMode === 'text' ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Collez le texte complet de l'annonce ci-dessous. L'IA va extraire automatiquement : entreprise, poste, salaire, localisation, type de contrat...
              </p>
              <textarea
                value={aiParseText}
                onChange={(e) => setAIParseText(e.target.value)}
                placeholder="Collez ici le texte complet de l'annonce d'emploi..."
                rows="6"
                className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 mb-3"
              />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Entrez l'URL de l'annonce. Le site sera automatiquement scrapé et l'IA extraira les informations pertinentes.
              </p>
              <input
                type="url"
                value={aiParseUrl}
                onChange={(e) => setAIParseUrl(e.target.value)}
                placeholder="https://www.exemple.com/offre-emploi/developpeur-ios"
                className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 mb-3"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                💡 Fonctionne avec Indeed, LinkedIn, Welcome to the Jungle, etc.
              </p>
            </>
          )}

          <button
            type="button"
            onClick={handleAIParse}
            disabled={parsingLoading}
            className="w-full btn-gradient disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {parsingLoading ? (
              <>
                <Loader className="animate-spin" size={20} />
                {parseMode === 'url' ? 'Scraping et parsing...' : 'Parsing en cours...'}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Parser avec l'IA
              </>
            )}
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Entreprise <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            name="entreprise"
            value={formData.entreprise}
            onChange={handleChange}
            placeholder="Nom de l'entreprise"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Annonce <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            name="annonce"
            value={formData.annonce}
            onChange={handleChange}
            placeholder="Description du poste"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date <span className="text-gray-500 dark:text-gray-400">(Auto-incrémenté)</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💰 Salaire
            </label>
            <input
              type="text"
              name="salaire"
              value={formData.salaire}
              onChange={handleChange}
              placeholder="Ex: 35K - 45K €, Non spécifié..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📍 Localisation
            </label>
            <input
              type="text"
              name="localisation"
              value={formData.localisation}
              onChange={handleChange}
              placeholder="Ex: Paris, Remote, Lyon..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Ajoutez des notes sur cette candidature..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Section Type de contrat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="inline mr-2" size={16} />
            Type de contrat
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              placeholder="Ou saisissez un type personnalisé..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-primary"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* Suggestions de types de contrats */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Interim', 'Apprentissage'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (!formData.tags.includes(type)) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, type]
                    }));
                  }
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-gray-300 dark:border-gray-600"
              >
                + {type}
              </button>
            ))}
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Section Contact Recruteur */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            type="button"
            onClick={() => setShowRecruteurSection(!showRecruteurSection)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mb-4"
          >
            <User size={20} />
            {showRecruteurSection ? 'Masquer' : 'Ajouter'} les informations du recruteur
          </button>

          {showRecruteurSection && (
            <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline mr-2" size={16} />
                  Nom du recruteur
                </label>
                <input
                  type="text"
                  name="recruteur_nom"
                  value={formData.recruteur_nom}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email du recruteur
                </label>
                <input
                  type="email"
                  name="recruteur_email"
                  value={formData.recruteur_email}
                  onChange={handleChange}
                  placeholder="recruteur@entreprise.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Téléphone du recruteur
                </label>
                <input
                  type="tel"
                  name="recruteur_telephone"
                  value={formData.recruteur_telephone}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-gray-800 dark:text-gray-900 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          💾 Sauvegarder
        </button>
      </form>

      {notification && (
        <div className={`mt-4 p-4 rounded-lg ${
          notification.includes('succès') 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
        }`}>
          {notification}
        </div>
      )}
    </div>
  );
}

export default AddJobForm;
