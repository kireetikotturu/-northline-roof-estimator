// src/services/api.js
//
// Thin wrapper around axios. Every function here maps 1:1 to a backend
// route — the frontend never computes prices or hardcodes config values,
// it only ever asks the API.

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL });

const TOKEN_KEY = 'owner_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.url?.includes('/admin')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Public ---------------------------------------------------------------

export const fetchPublicConfig = () => api.get('/config').then((r) => r.data);

export const submitEstimate = (payload) => api.post('/estimate', payload).then((r) => r.data);

// --- Auth -------------------------------------------------------------

export const ownerLogin = (username, password) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

export const verifySession = (token) =>
  api
    .get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.data);

// --- Owner Panel ------------------------------------------------------

export const fetchAdminConfig = () => api.get('/admin/config').then((r) => r.data);

export const saveAdminConfig = (payload) => api.put('/admin/config', payload).then((r) => r.data);

export const fetchLeads = () => api.get('/admin/leads').then((r) => r.data);
