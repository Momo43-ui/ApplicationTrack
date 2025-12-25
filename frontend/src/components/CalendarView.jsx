import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
export default function CalendarView({ jobs, onViewJob, onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };
  const getJobsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return jobs.filter((job) => {
      const jobDate = job.date;
      const rappelDate = job.rappel_date
        ? new Date(job.rappel_date).toISOString().split("T")[0]
        : null;
      return jobDate === dateStr || rappelDate === dateStr;
    });
  };
  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentDate);
  const monthNames = [
    "Janvier",
    "Fevrier",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Aout",
    "Septembre",
    "Octobre",
    "Novembre",
    "Decembre",
  ];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  const openDayModal = (date, jobsForDay) => {
    setSelectedDate(date);
    setShowModal(true);
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {" "}

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {" "}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
          {" "}
          {/* En-tÃªte du calendrier */}{" "}
          <div className="flex items-center justify-between mb-6">
            {" "}
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {" "}
              <CalendarIcon className="text-blue-600 dark:text-blue-400" size={32} /> Calendrier
              des candidatures{" "}
            </h2>{" "}
            <div className="flex items-center gap-4">
              {" "}
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Aujourd'hui
              </button>
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {" "}
                <ChevronLeft size={24} />{" "}
              </button>{" "}
              <span className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 min-w-[200px] text-center">
                {" "}
                {monthNames[month]} {year}{" "}
              </span>{" "}
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {" "}
                <ChevronRight size={24} />{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          {/* LÃ©gende */}{" "}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>{" "}
              <span className="text-gray-700 dark:text-gray-300">Candidature</span>{" "}
            </div>{" "}
            <div className="flex items-center gap-2">
              {" "}
              <div className="w-4 h-4 bg-red-200 dark:bg-red-800 rounded"></div>{" "}
              <span className="text-gray-700 dark:text-gray-300">Rappel</span>{" "}
            </div>{" "}
            <div className="flex items-center gap-2">
              {" "}
              <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></div>{" "}
              <span className="text-gray-700 dark:text-gray-300">AcceptÃ©</span>{" "}
            </div>{" "}
          </div>{" "}
          {/* Grille du calendrier */}{" "}
          <div className="grid grid-cols-7 gap-2">
            {" "}
            {/* Jours de la semaine */}{" "}
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-gray-700 dark:text-gray-300 py-2"
              >
                {" "}
                {day}{" "}
              </div>
            ))}{" "}
            {/* Cases vides avant le premier jour */}{" "}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}{" "}
            {/* Jours du mois */}{" "}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(year, month, day);
              date.setHours(0, 0, 0, 0);
              const isToday = date.getTime() === today.getTime();
              const jobsForDay = getJobsForDate(date);
              const hasJobs = jobsForDay.length > 0;
              return (
                <div
                  key={day}
                  className={`aspect-square border-2 rounded-lg p-1 md:p-2 relative ${isToday ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30" : "border-gray-200 dark:border-gray-700"} ${hasJobs ? "cursor-pointer hover:shadow-lg" : ""} transition-all`}
                  onClick={() => hasJobs && jobsForDay.length > 2 && openDayModal(date, jobsForDay)}
                >
                  {" "}
                  <div className="font-bold text-sm md:text-base text-gray-900 dark:text-gray-100 mb-1">
                    {" "}
                    {day}{" "}
                  </div>
                  {hasJobs && (
                    <span className="absolute top-1 right-1 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {jobsForDay.length}
                    </span>
                  )}{" "}
                  {hasJobs && (
                    <div className="space-y-1">
                      {" "}
                      {jobsForDay.slice(0, 2).map((job) => {
                        const isRappel =
                          job.rappel_date &&
                          new Date(job.rappel_date)
                            .toISOString()
                            .split("T")[0] === date.toISOString().split("T")[0];
                        const isAccepte = job.etat === "accepte";
                        return (
                          <div
                            key={job.id}
                            onClick={() => onViewJob(job)}
                            className={`text-xs p-1 rounded truncate ${isAccepte ? "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200" : isRappel ? "bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-200" : "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200"} hover:opacity-80`}
                            title={`${job.entreprise} - ${isRappel ? "Rappel" : "Candidature"}`}
                          >
                            {" "}
                            {job.entreprise}{" "}
                          </div>
                        );
                      })}{" "}
                      {jobsForDay.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          {" "}
                          +{jobsForDay.length - 2}{" "}
                        </div>
                      )}{" "}
                    </div>
                  )}{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </div>{" "}
      </main>

      {/* Modal pour afficher tous les jobs d'un jour */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3">
              {getJobsForDate(selectedDate).map((job) => {
                const isRappel = job.rappel_date && new Date(job.rappel_date).toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
                const isAccepte = job.etat === 'accepte';
                const etatColors = {
                  'en_attente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                  'accepte': 'bg-green-100 text-green-800 border-green-300',
                  'refuse': 'bg-red-100 text-red-800 border-red-300',
                  'entretien': 'bg-blue-100 text-blue-800 border-blue-300'
                };
                return (
                  <div key={job.id} className={`border-2 rounded-lg p-4 ${etatColors[job.etat] || 'bg-gray-100 text-gray-800 border-gray-300'} hover:shadow-md transition-all cursor-pointer`} onClick={() => { setShowModal(false); onViewJob(job); }}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{job.entreprise}</h4>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/50">
                        {isRappel ? '🔔 Rappel' : '📝 Candidature'}
                      </span>
                    </div>
                    {job.annonce && <p className="text-sm opacity-80 line-clamp-2">{job.annonce}</p>}
                    <div className="flex gap-2 mt-2 text-xs">
                      {job.type_contrat && <span className="px-2 py-1 bg-white/50 rounded">{job.type_contrat}</span>}
                      {job.localisation && <span className="px-2 py-1 bg-white/50 rounded">📍 {job.localisation}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
