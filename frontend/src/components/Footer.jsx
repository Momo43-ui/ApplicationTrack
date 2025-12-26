import { Github, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer({ setCurrentPage }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
              📋 ApplicationTrack
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gérez vos candidatures efficacement avec notre plateforme intuitive. 
              Suivez vos entretiens, analysez vos statistiques et optimisez votre recherche d'emploi.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Liens rapides
            </h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setCurrentPage?.('dashboard')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  📊 Tableau de bord
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage?.('stats')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  📈 Statistiques
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage?.('calendar')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  📅 Calendrier
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Contact
            </h3>
            <div className="flex gap-3 mb-4">
              <a
                href="#"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all transform hover:scale-110"
                aria-label="Github"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all transform hover:scale-110"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              support@applicationtrack.com
            </p>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              © {currentYear} ApplicationTrack. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Fait avec <Heart className="text-red-500" size={16} fill="currentColor" /> par l'équipe ApplicationTrack
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
