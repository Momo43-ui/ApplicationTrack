const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Gestion des erreurs API
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Une erreur est survenue');
  }
  return response.json();
};

// ============= Authentication =============

export const register = async (username, email, password, telephone, ville) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, telephone, ville })
  });
  return handleResponse(response);
};

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(response);
};

// ============= Candidatures =============

export const getCandidatures = async (userId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.etat) params.append('etat', filters.etat);
  if (filters.date_debut) params.append('date_debut', filters.date_debut);
  if (filters.date_fin) params.append('date_fin', filters.date_fin);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.sort_order) params.append('sort_order', filters.sort_order);
  
  const queryString = params.toString();
  const url = `${API_URL}/users/${userId}/candidatures${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const createCandidature = async (userId, candidatureData) => {
  const response = await fetch(`${API_URL}/users/${userId}/candidatures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidatureData)
  });
  return handleResponse(response);
};

export const updateCandidature = async (candidatureId, candidatureData) => {
  const response = await fetch(`${API_URL}/candidatures/${candidatureId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidatureData)
  });
  return handleResponse(response);
};

export const updateCandidatureEtat = async (candidatureId, etat) => {
  const response = await fetch(`${API_URL}/candidatures/${candidatureId}/etat`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ etat })
  });
  return handleResponse(response);
};

export const deleteCandidature = async (candidatureId) => {
  const response = await fetch(`${API_URL}/candidatures/${candidatureId}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
};

// ============= Statistiques =============

export const getStats = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/stats`);
  return handleResponse(response);
};

export const getAdvancedStats = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/stats/advanced`);
  return handleResponse(response);
};

export const exportCandidatures = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/candidatures/export`);
  if (!response.ok) {
    throw new Error('Erreur lors de l\'export');
  }
  return response.blob();
};

// ============= Health Check =============

export const healthCheck = async () => {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse(response);
};
