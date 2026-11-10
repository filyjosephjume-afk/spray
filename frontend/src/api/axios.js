import axios from 'axios';
import { API_URL } from '../utils/constants';

// Instance axios unique pour tout le projet
const http = axios.create({ baseURL: API_URL });

// Ajoute le jeton de connexion à chaque requête
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Jeton expiré ou invalide : retour à la page de connexion
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Accepte {data: ...} ou directement la donnée
export const unwrap = (res) => {
  const d = res?.data;
  if (d && !Array.isArray(d) && typeof d === 'object' && 'data' in d) return d.data;
  return d;
};

// Transforme une réponse en tableau (accepte [..], {rows:[..]}, {items:[..]})
export const asList = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

// Message d'erreur lisible
export function errMsg(e) {
  const data = e?.response?.data;
  if (data?.message) return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (e?.code === 'ERR_NETWORK') {
    return "Impossible de joindre le serveur. Vérifiez que le back-end est lancé et que VITE_API_URL (fichier .env) est correct.";
  }
  if (e?.response?.status === 404) {
    return 'Route introuvable côté serveur (404) : vérifiez le fichier correspondant dans src/api.';
  }
  return e?.message || 'Une erreur est survenue.';
}

// Fabrique les 5 appels standards d'une ressource REST
export function resource(path) {
  return {
    list: (params) => http.get(path, { params }).then(unwrap).then(asList),
    get: (id) => http.get(`${path}/${id}`).then(unwrap),
    create: (data) => http.post(path, data).then(unwrap),
    update: (id, data) => http.put(`${path}/${id}`, data).then(unwrap),
    remove: (id) => http.delete(`${path}/${id}`).then(unwrap),
  };
}

export default http;
