import { useState } from 'react';

function AddJobForm({ onAddJob }) {
  const [formData, setFormData] = useState({
    entreprise: '',
    annonce: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [notification, setNotification] = useState('');

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
      date: new Date().toISOString().split('T')[0]
    });

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Ajouter une annonce</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entreprise <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="entreprise"
            value={formData.entreprise}
            onChange={handleChange}
            placeholder="Nom de l'entreprise"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annonce <span className="text-red-500">*</span>
          </label>
          <textarea
            name="annonce"
            value={formData.annonce}
            onChange={handleChange}
            placeholder="Description du poste"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date <span className="text-gray-500">(Auto-incrémenté)</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          💾 Sauvegarder
        </button>
      </form>

      {notification && (
        <div className={`mt-4 p-4 rounded-lg ${
          notification.includes('succès') 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {notification}
        </div>
      )}
    </div>
  );
}

export default AddJobForm;
