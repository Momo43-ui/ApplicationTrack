import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, CheckCircle, Clock, Bell } from 'lucide-react';
import { exportCandidatures } from '../services/api';
import LoadingSkeleton from './LoadingSkeleton';
import ScrollToTop from './ScrollToTop';

const COLORS = {
  'en_attente': '#FCD34D',
  'entretien_passe': '#60A5FA',
  'accepte': '#34D399',
  'refus_etude': '#F87171',
  'refuse_entretien': '#FB923C',
  'sans_reponse': '#9CA3AF',
  'sans_reponse_entretien': '#A78BFA'
};

const LABELS = {
  'en_attente': 'En attente',
  'entretien_passe': 'Entretien passé',
  'accepte': 'Accepté',
  'refus_etude': 'Refus étude',
  'refuse_entretien': 'Refusé entretien',
  'sans_reponse': 'Sans réponse',
  'sans_reponse_entretien': 'Sans réponse entretien'
};

export default function Dashboard({ userId, stats }) {
  const [advancedStats, setAdvancedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAdvancedStats();
  }, [userId]);

  const loadAdvancedStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/stats/advanced`);
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
      const data = await response.json();
      setAdvancedStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCandidatures(userId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidatures_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      alert('Erreur lors de l\'export CSV');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton type="stat" count={4} />
        </div>
        <LoadingSkeleton type="chart" count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        Erreur : {error}
      </div>
    );
  }

  if (!advancedStats || advancedStats.total === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Aucune statistique disponible. Ajoutez des candidatures pour voir vos statistiques !
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const pieData = Object.entries(advancedStats.stats_par_etat)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key],
      value: value,
      color: COLORS[key]
    }));

  const timelineData = advancedStats.timeline || [];
  const monthlyData = advancedStats.stats_mensuelles || [];

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'export */}
      <header className="sticky-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">📊 Tableau de bord</h2>
        <button
          onClick={handleExport}
          className="btn-success flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
        >
          <Download size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Exporter CSV</span>
          <span className="xs:hidden">Export</span>
        </button>
      </header>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-blue-500 dark:border-blue-400">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{advancedStats.total}</p>
            </div>
            <Users className="text-blue-500 dark:text-blue-400 flex-shrink-0" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-green-500 dark:border-green-400">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">Taux de réponse</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{advancedStats.taux_reponse}%</p>
            </div>
            <TrendingUp className="text-green-500 dark:text-green-400 flex-shrink-0" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-purple-500 dark:border-purple-400">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">Taux d'entretien</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{advancedStats.taux_entretien}%</p>
            </div>
            <Clock className="text-purple-500 dark:text-purple-400" size={40} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500 dark:border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Taux d'acceptation</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{advancedStats.taux_acceptation}%</p>
            </div>
            <CheckCircle className="text-yellow-500 dark:text-yellow-400" size={40} />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagramme circulaire - Répartition par état */}
        <div className="animate-fadeIn bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all" style={{animationDelay: '0.4s'}}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Répartition par état</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique en barres - États */}
        <div className="animate-fadeIn bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-all" style={{animationDelay: '0.5s'}}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Candidatures par état</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline des 7 derniers jours */}
        <div className="animate-fadeIn bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-xl transition-all" style={{animationDelay: '0.6s'}}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">Timeline (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} name="Candidatures" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistiques mensuelles */}
        <div className="animate-fadeIn bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-xl transition-all" style={{animationDelay: '0.7s'}}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">Évolution mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="Candidatures" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
