import { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DocumentsManager({ candidature, user, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const documentTypes = {
    cv: 'CV',
    lettre_motivation: 'Lettre de motivation',
    fiche_poste: 'Fiche de poste',
    autre: 'Autre document'
  };

  useEffect(() => {
    loadDocuments();
  }, [candidature.id]);

  const loadDocuments = async () => {
    try {
      const response = await fetch(
        `${API_URL}/candidatures/${candidature.id}/documents?user_id=${user.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setDocuments(data);
      } else {
        setError(data.error || 'Erreur lors du chargement des documents');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux (max 10 MB)');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Formats acceptés : PDF, DOC, DOCX, TXT, PNG, JPG');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type_document', documentType);
      formData.append('user_id', user.id);

      const response = await fetch(
        `${API_URL}/candidatures/${candidature.id}/documents`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess('Document téléchargé avec succès !');
        loadDocuments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de télécharger le document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/documents/${documentId}?user_id=${user.id}`,
        {
          method: 'DELETE'
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess('Document supprimé avec succès');
        loadDocuments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de supprimer le document');
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await fetch(
        `${API_URL}/documents/${documentId}/download?user_id=${user.id}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de télécharger le document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Documents - {candidature.entreprise}
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
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="text-sm text-red-600 hover:text-red-700 underline mt-1"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Télécharger un document
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(documentTypes).map(([type, label]) => (
                <label
                  key={type}
                  className={`
                    flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${uploading
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                    }
                  `}
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">{label}</span>
                  <input
                    type="file"
                    disabled={uploading}
                    onChange={(e) => handleUpload(e, type)}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés : PDF, DOC, DOCX, TXT, PNG, JPG (max 10 MB)
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Documents téléchargés ({documents.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun document téléchargé</p>
                <p className="text-sm mt-1">
                  Utilisez les boutons ci-dessus pour ajouter des documents
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-800 truncate">
                          {doc.nom_fichier}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                            {documentTypes[doc.type_document] || doc.type_document}
                          </span>
                          <span>{formatFileSize(doc.taille)}</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleDownload(doc.id, doc.nom_fichier)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
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
