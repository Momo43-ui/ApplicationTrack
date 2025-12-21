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

export const register = async (username, email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
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

export const getCandidatures = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/candidatures`);
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

// ============= Health Check =============

export const healthCheck = async () => {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse(response);
};
