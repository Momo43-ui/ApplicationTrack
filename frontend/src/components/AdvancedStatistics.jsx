import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Calendar as CalendarIcon,
  Award,
  Target
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

function AdvancedStatistics({ jobs }) {
  const etats = {
    en_attente: { label: 'En attente', color: '#9CA3AF' },
    refus_etude: { label: 'Refus après études', color: '#EF4444' },
    entretien_passe: { label: 'Entretien passé', color: '#3B82F6' },
    sans_reponse: { label: 'Sans réponse', color: '#F59E0B' },
    accepte: { label: 'Accepté', color: '#10B981' },
    refuse_entretien: { label: 'Refusé après entretien', color: '#DC2626' },
    sans_reponse_entretien: { label: 'Sans réponse après entretien', color: '#F97316' }
  };

  // Statistiques globales
  const stats = useMemo(() => {
    const total = jobs.length;
    const entretiens = jobs.filter(j =>
      j.etat === 'entretien_passe' ||
      j.etat === 'accepte' ||
      j.etat === 'refuse_entretien' ||
      j.etat === 'sans_reponse_entretien'
    ).length;
    const acceptes = jobs.filter(j => j.etat === 'accepte').length;
    const refus = jobs.filter(j =>
      j.etat === 'refus_etude' ||
      j.etat === 'refuse_entretien'
    ).length;
    const tauxReponse = total > 0 ? ((entretiens / total) * 100).toFixed(1) : 0;
    const tauxAcceptation = entretiens > 0 ? ((acceptes / entretiens) * 100).toFixed(1) : 0;
    const tauxRefus = total > 0 ? ((refus / total) * 100).toFixed(1) : 0;

    // Temps moyen de réponse (basé sur les candidatures qui ont eu une réponse)
    const candidaturesAvecReponse = jobs.filter(j =>
      j.etat !== 'en_attente' &&
      j.etat !== 'sans_reponse' &&
      j.etat !== 'sans_reponse_entretien'
    );
    let tempsTotal = 0;
    candidaturesAvecReponse.forEach(job => {
      const dateCreation = new Date(job.created_at || job.date);
      const dateModification = new Date(job.updated_at || job.date);
      const diff = dateModification - dateCreation;
      tempsTotal += diff;
    });
    const tempsmoyenne = candidaturesAvecReponse.length > 0
      ? Math.round(tempsTotal / candidaturesAvecReponse.length / (1000 * 60 * 60 * 24))
      : 0;

    return {
      total,
      entretiens,
      acceptes,
      refus,
      tauxReponse,
      tauxAcceptation,
      tauxRefus,
      tempsReponse: tempsmoyenne
    };
  }, [jobs]);

  // Répartition par état
  const etatData = useMemo(() => {
    const counts = {};
    jobs.forEach(job => {
      counts[job.etat] = (counts[job.etat] || 0) + 1;
    });
    return Object.entries(counts).map(([etat, count]) => ({
      name: etats[etat]?.label || etat,
      value: count,
      color: etats[etat]?.color
    }));
  }, [jobs]);

  // Statistiques par type de contrat
  const typeContratData = useMemo(() => {
    const counts = {};
    jobs.forEach(job => {
      const type = job.type_contrat || 'Non spécifié';
      if (!counts[type]) {
        counts[type] = {
          total: 0,
          entretiens: 0,
          acceptes: 0
        };
      }
      counts[type].total++;
      if (['entretien_passe', 'accepte', 'refuse_entretien', 'sans_reponse_entretien'].includes(job.etat)) {
        counts[type].entretiens++;
      }
      if (job.etat === 'accepte') {
        counts[type].acceptes++;
      }
    });
    return Object.entries(counts).map(([type, data]) => ({
      type,
      'Candidatures': data.total,
      'Entretiens': data.entretiens,
      'Accepté': data.acceptes,
      tauxReponse: data.total > 0 ? ((data.entretiens / data.total) * 100).toFixed(1) : 0
    }));
  }, [jobs]);

  // Meilleurs jours pour postuler
  const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const joursData = useMemo(() => {
    const counts = Array(7).fill(0).map(() => ({
      total: 0,
      entretiens: 0
    }));
    jobs.forEach(job => {
      const jour = new Date(job.date).getDay();
      counts[jour].total++;
      if (['entretien_passe', 'accepte', 'refuse_entretien', 'sans_reponse_entretien'].includes(job.etat)) {
        counts[jour].entretiens++;
      }
    });
    return counts.map((data, index) => ({
      jour: joursSemaine[index],
      'Candidatures': data.total,
      'Taux de réponse (%)': data.total > 0 ? Math.round((data.entretiens / data.total) * 100) : 0
    }));
  }, [jobs]);

  // Timeline des candidatures (par mois)
  const timelineData = useMemo(() => {
    const months = {};
    jobs.forEach(job => {
      const date = new Date(job.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short'
      });
      if (!months[key]) {
        months[key] = {
          mois: label,
          total: 0,
          entretiens: 0,
          acceptes: 0
        };
      }
      months[key].total++;
      if (['entretien_passe', 'accepte', 'refuse_entretien', 'sans_reponse_entretien'].includes(job.etat)) {
        months[key].entretiens++;
      }
      if (job.etat === 'accepte') {
        months[key].acceptes++;
      }
    });
    return Object.values(months).sort((a, b) => a.mois.localeCompare(b.mois));
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Taux de réponse</p>
              <p className="text-3xl font-bold text-gray-900">{stats.tauxReponse}%</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.entretiens} / {stats.total} candidatures
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Taux d'acceptation</p>
              <p className="text-3xl font-bold text-gray-900">{stats.tauxAcceptation}%</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.acceptes} acceptées
              </p>
            </div>
            <Award className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Temps de réponse</p>
              <p className="text-3xl font-bold text-gray-900">{stats.tempsReponse}j</p>
              <p className="text-sm text-gray-600 mt-1">
                En moyenne
              </p>
            </div>
            <Clock className="w-12 h-12 text-orange-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Taux de refus</p>
              <p className="text-3xl font-bold text-gray-900">{stats.tauxRefus}%</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.refus} refusées
              </p>
            </div>
            <Target className="w-12 h-12 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par état */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Répartition par état
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={etatData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {etatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance par type de contrat */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Performance par type de contrat
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeContratData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Candidatures" fill="#3B82F6" />
              <Bar dataKey="Entretiens" fill="#10B981" />
              <Bar dataKey="Accepté" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meilleurs jours pour postuler */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Meilleurs jours pour postuler
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={joursData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jour" />
              <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="Candidatures" fill="#3B82F6" />
              <Bar yAxisId="right" dataKey="Taux de réponse (%)" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline des candidatures */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Évolution des candidatures
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total" fill="#3B82F6" />
              <Bar dataKey="entretiens" name="Entretiens" fill="#10B981" />
              <Bar dataKey="acceptes" name="Acceptées" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          💡 Insights
        </h3>
        <div className="space-y-3 text-gray-700">
          {stats.tauxReponse >= 50 && (
            <p className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Excellent taux de réponse ! Votre profil semble correspondre aux offres.</span>
            </p>
          )}
          {stats.tauxReponse < 20 && stats.total > 5 && (
            <p className="flex items-start gap-2">
              <span className="text-orange-500">⚠</span>
              <span>Taux de réponse faible. Pensez à personnaliser davantage vos candidatures.</span>
            </p>
          )}
          {stats.tempsReponse > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-blue-500">ℹ</span>
              <span>Les entreprises répondent en moyenne en {stats.tempsReponse} jours.</span>
            </p>
          )}
          {typeContratData.length > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-purple-500">📊</span>
              <span>
                Type de contrat le plus fréquent : {[...typeContratData].sort((a, b) => b.Candidatures - a.Candidatures)[0].type}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedStatistics;
