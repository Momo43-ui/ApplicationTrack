import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const ETATS = [
  { value: '', label: 'Tous les états' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'entretien_passe', label: 'Entretien passé' },
  { value: 'accepte', label: 'Accepté' },
  { value: 'refus_etude', label: 'Refus étude' },
  { value: 'refuse_entretien', label: 'Refusé entretien' },
  { value: 'sans_reponse', label: 'Sans réponse' },
  { value: 'sans_reponse_entretien', label: 'Sans réponse entretien' }
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date de création' },
  { value: 'date', label: 'Date de candidature' },
  { value: 'entreprise', label: 'Entreprise' }
];

export default function AdvancedFilters({ onFilterChange, currentFilters }) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentFilters || {
    search: '',
    entreprise: '',
    etat: '',
    type_contrat: '',
    date_debut: '',
    date_fin: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      entreprise: '',
      etat: '',
      type_contrat: '',
      date_debut: '',
      date_fin: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = localFilters.search || localFilters.entreprise || localFilters.etat || localFilters.type_contrat || localFilters.date_debut || localFilters.date_fin;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Barre de recherche par entreprise */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom d'entreprise..."
              value={localFilters.entreprise}
              onChange={(e) => handleInputChange('entreprise', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Barre de recherche générale */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Recherche globale..."
              value={localFilters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Bouton pour afficher/masquer les filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
              showFilters ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter size={20} />
            Filtres
            {hasActiveFilters && (
              <span className="badge-notification bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Bouton reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn-danger flex items-center gap-2"
            >
              <X size={20} />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Panneau de filtres avancés */}
      {showFilters && (
        <div className="animate-fadeIn border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtre par état */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎯 État
            </label>
            <select
              value={localFilters.etat}
              onChange={(e) => handleInputChange('etat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {ETATS.map(etat => (
                <option key={etat.value} value={etat.value}>
                  {etat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par type de contrat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📄 Type de contrat
            </label>
            <select
              value={localFilters.type_contrat}
              onChange={(e) => handleInputChange('type_contrat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Tous les types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Alternance">Alternance</option>
              <option value="Freelance">Freelance</option>
              <option value="Interim">Intérim</option>
              <option value="Apprentissage">Apprentissage</option>
            </select>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📅 Date de début
            </label>
            <input
              type="date"
              value={localFilters.date_debut}
              onChange={(e) => handleInputChange('date_debut', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Date de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📅 Date de fin
            </label>
            <input
              type="date"
              value={localFilters.date_fin}
              onChange={(e) => handleInputChange('date_fin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔄 Trier par
            </label>
            <div className="flex gap-2">
              <select
                value={localFilters.sort_by}
                onChange={(e) => handleInputChange('sort_by', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={localFilters.sort_order}
                onChange={(e) => handleInputChange('sort_order', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer font-bold text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="desc">↓</option>
                <option value="asc">↑</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
