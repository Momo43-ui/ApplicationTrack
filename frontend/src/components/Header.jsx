import { Moon, Sun, BarChart3, Calendar, FileText, LogOut, Menu } from 'lucide-react';

export default function Header({ 
  user, 
  darkMode, 
  setDarkMode, 
  currentPage, 
  setCurrentPage, 
  onLogout,
  onOpenMobileMenu
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📋' },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'calendar', label: 'Calendrier', icon: Calendar }
  ];

  return (
    <header className="sticky-header bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo et titre */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg">
              <span className="text-white text-xl sm:text-2xl">📋</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                ApplicationTrack
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                Bienvenue, {user.username}
              </p>
            </div>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {typeof Icon === 'string' ? (
                    <span>{Icon}</span>
                  ) : (
                    <Icon size={18} />
                  )}
                  <span className="hidden xl:inline font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Bouton menu hamburger pour mobile/tablette */}
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              aria-label="Open menu"
            >
              <Menu className="text-gray-700 dark:text-gray-300" size={20} />
            </button>

            {/* Boutons desktop */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-110"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="text-yellow-400" size={18} />
                ) : (
                  <Moon className="text-gray-700" size={18} />
                )}
              </button>
              <button
                onClick={onLogout}
                className="btn-danger flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden lg:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
