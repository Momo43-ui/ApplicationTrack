import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CSVImport({ user, onImportComplete, onClose }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Veuillez sélectionner un fichier CSV valide.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setResults(null);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données.');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  };

  const mapRowToCandidature = (row) => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      entreprise: row.entreprise || row.company || row.societe || '',
      annonce: row.annonce || row.poste || row.position || row.description || '',
      date: row.date || today,
      etat: row.etat || row.statut || row.status || 'en_attente',
      notes: row.notes || row.commentaires || row.comments || '',
      type_contrat: row.type_contrat || row.contrat || row.contract || '',
      localisation: row.localisation || row.ville || row.location || row.city || '',
      salaire: row.salaire || row.salary || '',
      contact_nom: row.contact_nom || row.contact || '',
      contact_email: row.contact_email || row.email || '',
      contact_telephone: row.contact_telephone || row.telephone || row.phone || ''
    };
  };

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    setImporting(true);
    setError('');
    setResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        throw new Error('Aucune donnée trouvée dans le fichier CSV.');
      }

      const importResults = {
        total: rows.length,
        success: 0,
        errors: []
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const candidature = mapRowToCandidature(row);

        if (!candidature.entreprise || !candidature.annonce) {
          importResults.errors.push({
            row: i + 2,
            error: 'Entreprise et annonce sont obligatoires'
          });
          continue;
        }

        try {
          const response = await fetch(`${API_URL}/users/${user.id}/candidatures`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(candidature)
          });

          if (response.ok) {
            importResults.success++;
          } else {
            const data = await response.json();
            importResults.errors.push({
              row: i + 2,
              error: data.error || 'Erreur inconnue'
            });
          }
        } catch (err) {
          importResults.errors.push({
            row: i + 2,
            error: err.message
          });
        }
      }

      setResults(importResults);

      if (importResults.success > 0) {
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
    } catch (err) {
      console.error('Erreur lors de l\'import:', err);
      setError(err.message || 'Erreur lors de la lecture du fichier CSV.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `entreprise,annonce,date,etat,type_contrat,localisation,salaire,notes,contact_nom,contact_email,contact_telephone
Google,Développeur Full Stack,2025-12-20,en_attente,CDI,Paris,50000€,Candidature spontanée,Jean Dupont,jean.dupont@google.com,01 23 45 67 89
Microsoft,Ingénieur DevOps,2025-12-18,entretien_passe,CDI,Lyon,55000€,Recommandé par un ami,Marie Martin,marie.martin@microsoft.com,06 12 34 56 78`;

    const element = document.createElement('a');
    const file = new Blob([template], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'template_candidatures.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Importer des candidatures (CSV)
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
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Format du fichier CSV
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Le fichier CSV doit contenir les colonnes suivantes (la première ligne doit être l'en-tête) :
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• <strong>entreprise</strong> (obligatoire)</li>
              <li>• <strong>annonce</strong> (obligatoire)</li>
              <li>• date, etat, type_contrat, localisation, salaire, notes</li>
              <li>• contact_nom, contact_email, contact_telephone</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Télécharger un modèle CSV
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un fichier CSV
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  {file ? file.name : 'Choisir un fichier...'}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {results && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Import terminé
                  </h3>
                  <p className="text-sm text-green-800 mt-1">
                    {results.success} candidature(s) importée(s) avec succès sur {results.total}
                  </p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2 text-sm">
                    Erreurs ({results.errors.length}) :
                  </h4>
                  <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                    {results.errors.map((err, index) => (
                      <li key={index}>
                        Ligne {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className={`
                flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2
                ${!file || importing
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
                transition-colors
              `}
            >
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Importer les candidatures
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
