import {
  useEffect, useState
} from 'react';
import {
  Bell, X, Calendar
} from 'lucide-react';
export default function RappelsNotifications({
  jobs, onViewJob
}) {
  const [rappels, setRappels] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
useEffect(() => {
  // Filtrer les candidatures avec des rappels const today = new Date();
today.setHours(0, 0, 0, 0);
const rappelsActifs = jobs.filter(job => {
  if (!job.rappel_date) return false;
const rappelDate = new Date(job.rappel_date);
rappelDate.setHours(0, 0, 0, 0);
// Rappels d'aujourd'hui et passÃ©s return rappelDate <= today;
}).sort((a, b) => new Date(a.rappel_date) - new Date(b.rappel_date));
setRappels(rappelsActifs);
}, [jobs]);
const getRappelColor = (date) => {
  const today = new Date();
today.setHours(0, 0, 0, 0);
const rappelDate = new Date(date);
rappelDate.setHours(0, 0, 0, 0);
const diffDays = Math.floor((today - rappelDate) / (1000 * 60 * 60 * 24));
if (diffDays > 7) return 'bg-red-100 border-red-400 text-red-800';
if (diffDays > 3) return 'bg-orange-100 border-orange-400 text-orange-800';
if (diffDays > 0) return 'bg-yellow-100 border-yellow-400 text-yellow-800';
return 'bg-blue-100 border-blue-400 text-blue-800';
};
const formatRappelText = (date) => {
  const today = new Date();
today.setHours(0, 0, 0, 0);
const rappelDate = new Date(date);
rappelDate.setHours(0, 0, 0, 0);
const diffDays = Math.floor((today - rappelDate) / (1000 * 60 * 60 * 24));
if (diffDays === 0) return "Aujourd'hui";
if (diffDays === 1) return "Hier";
if (diffDays > 1) return `Il y a ${
  diffDays
} jours`;
return rappelDate.toLocaleDateString('fr-FR');
};
if (rappels.length === 0) return null;
return ( <> {
  /* Bouton de notification */
} <button onClick={
  () => setShowNotifications(!showNotifications)
} className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all z-50 flex items-center gap-2" > <Bell size={
  24
} /> <span className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"> {
  rappels.length
} </span> </button> {
  /* Panneau de notifications */
} {
  showNotifications && ( <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border-2 border-red-400 z-50 max-h-[70vh] overflow-hidden flex flex-col"> <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-between"> <div className="flex items-center gap-2"> <Bell size={
  20
} /> <h3 className="font-bold">Rappels actifs ({
  rappels.length
})</h3> </div> <button onClick={
  () => setShowNotifications(false)
} className="hover:bg-red-600 rounded p-1" > <X size={
  20
} /> </button> </div> <div className="overflow-y-auto flex-1 p-4 space-y-3"> {
  rappels.map(job => ( <div key={
  job.id
} className={
  `border-2 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${
  getRappelColor(job.rappel_date)
}`
} onClick={
  () => {
  onViewJob(job);
setShowNotifications(false);
}
} > <div className="flex items-start justify-between mb-2"> <h4 className="font-bold text-sm">{
  job.entreprise
}</h4> <span className="text-xs font-semibold flex items-center gap-1"> <Calendar size={
  14
} /> {
  formatRappelText(job.rappel_date)
} </span> </div> <p className="text-xs opacity-80 line-clamp-2">{
  job.annonce
}</p> <div className="mt-2 flex items-center justify-between"> <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-50 rounded"> {
  job.etat
} </span> <span className="text-xs font-medium"> Cliquez pour voir â†’ </span> </div> </div> ))
} </div> </div> )
} </> );
} 